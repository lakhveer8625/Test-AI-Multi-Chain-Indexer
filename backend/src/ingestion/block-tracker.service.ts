import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChainAdapterService } from '../chain-adapters/chain-adapter.service';
import { Chain } from '../shared/entities/chain.entity';
import { RawEvent } from '../shared/entities/raw-event.entity';
import { Block } from '../shared/entities/block.entity';
import { Transaction } from '../shared/entities/transaction.entity';
import { DeduplicatorService } from './deduplicator.service';
import { RawTransaction } from '../chain-adapters/adapter.interface';

@Injectable()
export class BlockTrackerService {
    private readonly logger = new Logger(BlockTrackerService.name);
    private isRunning: Map<string, boolean> = new Map();

    constructor(
        private chainAdapterService: ChainAdapterService,
        private deduplicatorService: DeduplicatorService,
        @InjectRepository(Chain)
        private chainRepository: Repository<Chain>,
        @InjectRepository(RawEvent)
        private rawEventRepository: Repository<RawEvent>,
        @InjectRepository(Block)
        private blockRepository: Repository<Block>,
        @InjectRepository(Transaction)
        private transactionRepository: Repository<Transaction>,
    ) { }

    @Cron(CronExpression.EVERY_10_SECONDS)
    async trackBlocks() {
        try {
            const chains = await this.chainRepository.find({ where: { is_active: true } });

            for (const chain of chains) {
                if (this.isRunning.get(chain.chain_id)) {
                    continue; // Skip if already running for this chain
                }

                this.processChain(chain).catch((error) => {
                    this.logger.error(`Error processing chain ${chain.chain_id}: ${error.message}`, error.stack);
                });
            }
        } catch (error: any) {
            this.logger.error(`Critical error in trackBlocks cron: ${error.message}`, error.stack);
        }
    }

    private async processChain(chain: Chain) {
        this.isRunning.set(chain.chain_id, true);

        try {
            const adapter = this.chainAdapterService.getAdapter(chain.chain_id);

            if (!adapter) {
                this.logger.warn(`No adapter found for chain ${chain.chain_id}`);
                return;
            }

            const latestBlock = await adapter.getLatestBlockNumber();
            let lastIndexed = BigInt(chain.latest_indexed_block || '0');
            const latest = BigInt(latestBlock);

            // Apply confirmation depth
            const safeBlock = latest - BigInt(chain.confirmation_depth);

            // If first time indexing, start from latest block minus a small buffer
            if (lastIndexed === 0n) {
                lastIndexed = safeBlock - 10n;
                if (lastIndexed < 0n) lastIndexed = 0n;
                this.logger.log(`First time indexing chain ${chain.chain_id}, starting from block ${lastIndexed}`);
            }

            if (lastIndexed >= safeBlock) {
                this.logger.debug(`Chain ${chain.chain_id} is up to date`);
                return;
            }

            // Process blocks in batches
            const batchSize = 10;
            const fromBlock = lastIndexed + 1n;
            const toBlock = fromBlock + BigInt(batchSize) - 1n > safeBlock
                ? safeBlock
                : fromBlock + BigInt(batchSize) - 1n;

            this.logger.log(
                `Processing blocks ${fromBlock} to ${toBlock} for chain ${chain.chain_id}`
            );

            // Fetch and save block metadata for the entire range
            for (let b = fromBlock; b <= toBlock; b++) {
                try {
                    const metadata = await adapter.fetchBlockMetadata(b.toString());
                    await this.blockRepository.save({
                        chain_id: chain.chain_id,
                        block_number: b.toString(),
                        block_hash: metadata.hash,
                        parent_hash: metadata.parentHash,
                        timestamp: metadata.timestamp,
                        is_canonical: true,
                    });
                } catch (error: any) {
                    if (error.message.includes('SKIP_SLOT')) {
                        this.logger.debug(`Skipping metadata for skipped slot ${b}`);
                    } else {
                        this.logger.warn(`Failed to save metadata for block ${b}: ${error.message}`);
                    }
                }
            }

            const events = await adapter.fetchBlockRange(
                fromBlock.toString(),
                toBlock.toString()
            );

            // Fetch and save transactions
            for (let b = fromBlock; b <= toBlock; b++) {
                try {
                    const txs = await adapter.fetchTransactions(b.toString());
                    if (txs.length > 0) {
                        await this.saveTransactions(txs);
                    }
                } catch (error) {
                    this.logger.error(`Failed to fetch transactions for block ${b}: ${error.message}`);
                }
            }

            // Deduplicate and save events
            const uniqueEvents = await this.deduplicatorService.deduplicate(events);

            if (uniqueEvents.length > 0) {
                await this.saveEvents(uniqueEvents);
            }

            // Update chain's latest indexed block
            await this.chainRepository.update(
                { chain_id: chain.chain_id },
                { latest_indexed_block: toBlock.toString() }
            );

            this.logger.log(
                `Indexed ${uniqueEvents.length} events from chain ${chain.chain_id}`
            );
        } finally {
            this.isRunning.set(chain.chain_id, false);
        }
    }

    private async saveTransactions(txs: RawTransaction[]) {
        const transactions = txs.map((tx) => ({
            chain_id: tx.chain_id,
            block_number: tx.block_number,
            block_hash: tx.block_hash,
            tx_hash: tx.tx_hash,
            from_address: tx.from_address,
            to_address: tx.to_address || undefined,
            value: tx.value,
            input_data: tx.input_data,
            timestamp: tx.timestamp,
            is_canonical: true,
        }));

        await this.transactionRepository.save(transactions);
    }

    private async saveEvents(events: import('../chain-adapters/adapter.interface').RawEvent[]) {
        if (events.length === 0) return;

        // Save raw events
        const rawEvents = events.map((event) => ({
            chain_id: event.chain_id,
            block_number: event.block_number.toString(),
            block_hash: event.block_hash,
            tx_hash: event.tx_hash,
            log_index: event.log_index,
            contract_address: event.contract_address,
            topics: JSON.stringify(event.topics),
            data: event.data,
            is_canonical: true,
            is_processed: false,
            block_timestamp: event.block_timestamp,
        }));

        try {
            const saved = await this.rawEventRepository.save(rawEvents);
            this.logger.log(`✓ Saved ${saved.length} raw events to database for chain ${events[0].chain_id}`);
        } catch (error) {
            this.logger.error(`Failed to save raw events: ${error.message}`);
        }
    }
}
