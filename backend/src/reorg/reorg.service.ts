import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChainAdapterService } from '../chain-adapters/chain-adapter.service';
import { Chain } from '../shared/entities/chain.entity';
import { Block } from '../shared/entities/block.entity';
import { RawEvent } from '../shared/entities/raw-event.entity';
import { IndexedEvent } from '../shared/entities/indexed-event.entity';

@Injectable()
export class ReorgService {
    private readonly logger = new Logger(ReorgService.name);

    constructor(
        private chainAdapterService: ChainAdapterService,
        @InjectRepository(Chain)
        private chainRepository: Repository<Chain>,
        @InjectRepository(Block)
        private blockRepository: Repository<Block>,
        @InjectRepository(RawEvent)
        private rawEventRepository: Repository<RawEvent>,
        @InjectRepository(IndexedEvent)
        private indexedEventRepository: Repository<IndexedEvent>,
    ) { }

    @Cron(CronExpression.EVERY_MINUTE)
    async checkForReorgs() {
        try {
            const chains = await this.chainRepository.find({ where: { is_active: true } });

            for (const chain of chains) {
                this.detectAndHandleReorg(chain).catch((error) => {
                    this.logger.error(`Error checking reorg for chain ${chain.chain_id}: ${error.message}`, error.stack);
                });
            }
        } catch (error: any) {
            this.logger.error(`Critical error in checkForReorgs cron: ${error.message}`, error.stack);
        }
    }

    private async detectAndHandleReorg(chain: Chain) {
        const adapter = this.chainAdapterService.getAdapter(chain.chain_id);

        if (!adapter) {
            return;
        }

        // Check recent blocks for hash mismatch
        const confirmationDepth = chain.confirmation_depth;
        const latestIndexed = BigInt(chain.latest_indexed_block || '0');
        const checkFromBlock = latestIndexed - BigInt(confirmationDepth * 2);

        if (checkFromBlock < 0n) {
            return; // Not enough blocks yet
        }

        // Fetch recent blocks from database
        const dbBlocks = await this.blockRepository.find({
            where: {
                chain_id: chain.chain_id,
                is_canonical: true,
            },
            order: { block_number: 'DESC' },
            take: confirmationDepth * 2,
        });

        // Verify each block hash
        for (const dbBlock of dbBlocks) {
            const isValid = await adapter.verifyBlockHash(
                dbBlock.block_number,
                dbBlock.block_hash
            );

            if (!isValid) {
                this.logger.warn(
                    `Reorg detected on chain ${chain.chain_id} at block ${dbBlock.block_number}`
                );

                await this.handleReorg(
                    chain.chain_id,
                    dbBlock.block_number,
                    latestIndexed.toString()
                );

                break; // Handle one reorg at a time
            }
        }
    }

    private async handleReorg(chainId: string, fromBlock: string, toBlock: string) {
        this.logger.warn(`Handling reorg on chain ${chainId} from block ${fromBlock} to ${toBlock}`);

        // Mark affected blocks as non-canonical
        await this.blockRepository.update(
            {
                chain_id: chainId,
                block_number: fromBlock,
                is_canonical: true,
            },
            { is_canonical: false }
        );

        // Mark affected raw events as non-canonical
        await this.rawEventRepository
            .createQueryBuilder()
            .update(RawEvent)
            .set({ is_canonical: false })
            .where('chain_id = :chainId', { chainId })
            .andWhere('CAST(block_number AS UNSIGNED) >= :fromBlock', { fromBlock })
            .andWhere('CAST(block_number AS UNSIGNED) <= :toBlock', { toBlock })
            .execute();

        // Mark affected indexed events as non-canonical
        await this.indexedEventRepository
            .createQueryBuilder()
            .update(IndexedEvent)
            .set({ is_canonical: false })
            .where('chain_id = :chainId', { chainId })
            .andWhere('CAST(block_number AS UNSIGNED) >= :fromBlock', { fromBlock })
            .andWhere('CAST(block_number AS UNSIGNED) <= :toBlock', { toBlock })
            .execute();

        // Reset chain's latest indexed block
        const prevBlock = BigInt(fromBlock) - 1n;
        await this.chainRepository.update(
            { chain_id: chainId },
            { latest_indexed_block: prevBlock.toString() }
        );

        this.logger.log(`Reorg handled successfully for chain ${chainId}`);
    }
}
