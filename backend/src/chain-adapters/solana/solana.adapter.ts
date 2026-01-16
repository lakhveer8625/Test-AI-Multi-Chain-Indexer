import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Connection, PublicKey } from '@solana/web3.js';
import { ChainAdapter, RawEvent, ReorgInfo, RawTransaction } from '../adapter.interface';

@Injectable()
export class SolanaAdapter implements ChainAdapter {
    private readonly logger = new Logger(SolanaAdapter.name);
    private connection: Connection;
    private chainId: string;

    constructor(
        private configService: ConfigService,
        chainConfig: { chainId: string; rpcUrl: string }
    ) {
        this.chainId = chainConfig.chainId;
        this.connection = new Connection(chainConfig.rpcUrl, 'confirmed');

        this.logger.log(`Initialized Solana adapter for chainId ${this.chainId}`);
    }

    async start(): Promise<void> {
        this.logger.log('Starting Solana adapter');

        // Verify connection
        const version = await this.connection.getVersion();
        this.logger.log(`Connected to Solana cluster version: ${version['solana-core']}`);
    }

    async stop(): Promise<void> {
        this.logger.log('Stopping Solana adapter');
        // Cleanup if needed
    }

    async fetchBlock(blockNumber: string): Promise<RawEvent[]> {
        const slot = parseInt(blockNumber);
        const block = await this.connection.getBlock(slot, {
            maxSupportedTransactionVersion: 0,
        });

        if (!block) {
            throw new Error(`Block ${blockNumber} not found`);
        }

        const events: RawEvent[] = [];

        // Parse Solana transactions and extract logs
        for (let i = 0; i < block.transactions.length; i++) {
            const tx = block.transactions[i];
            const signature = tx.transaction.signatures[0];

            // Extract logs from transaction meta
            if (tx.meta?.logMessages) {
                for (let logIndex = 0; logIndex < tx.meta.logMessages.length; logIndex++) {
                    const logMessage = tx.meta.logMessages[logIndex];

                    // Parse program invocations and events
                    // This is simplified - real implementation would decode specific program logs
                    events.push({
                        chain_id: this.chainId,
                        block_number: blockNumber,
                        block_hash: block.blockhash,
                        tx_hash: signature,
                        log_index: logIndex,
                        contract_address: '', // Extract from log message
                        topics: [], // Solana doesn't use topics like EVM
                        data: logMessage,
                        block_timestamp: new Date((block.blockTime || 0) * 1000),
                    });
                }
            }
        }

        this.logger.debug(`Fetched ${events.length} events from Solana slot ${blockNumber}`);
        return events;
    }

    async fetchTransactions(blockNumber: string): Promise<RawTransaction[]> {
        const slot = parseInt(blockNumber);
        const block = await this.connection.getBlock(slot, {
            maxSupportedTransactionVersion: 0,
        });

        if (!block) {
            throw new Error(`Block ${blockNumber} not found`);
        }

        const transactions: RawTransaction[] = [];

        for (const tx of block.transactions) {
            const signature = tx.transaction.signatures[0];

            // Simplified value extraction - Solana doesn't have a single "value" like ETH
            // We could use delta of lamports for the fee payer
            const value = (tx.meta?.fee || 0).toString();

            transactions.push({
                chain_id: this.chainId,
                block_number: blockNumber,
                block_hash: block.blockhash,
                tx_hash: signature,
                from_address: tx.transaction.message.staticAccountKeys[0].toString(),
                to_address: tx.transaction.message.staticAccountKeys[1] ? tx.transaction.message.staticAccountKeys[1].toString() : null,
                value,
                input_data: JSON.stringify(tx.transaction.message),
                timestamp: new Date((block.blockTime || 0) * 1000),
            });
        }

        return transactions;
    }

    async fetchBlockRange(fromBlock: string, toBlock: string): Promise<RawEvent[]> {
        const from = parseInt(fromBlock);
        const to = parseInt(toBlock);

        const events: RawEvent[] = [];

        // Fetch blocks in range
        for (let slot = from; slot <= to; slot++) {
            try {
                const blockEvents = await this.fetchBlock(slot.toString());
                events.push(...blockEvents);
            } catch (error) {
                this.logger.warn(`Failed to fetch Solana slot ${slot}: ${error.message}`);
            }
        }

        this.logger.log(`Fetched ${events.length} events from Solana slots ${fromBlock} to ${toBlock}`);
        return events;
    }

    async fetchBlockMetadata(blockNumber: string): Promise<{ hash: string; parentHash: string; timestamp: Date }> {
        const slot = parseInt(blockNumber);
        const block = await this.connection.getBlock(slot, { maxSupportedTransactionVersion: 0 });
        if (!block) throw new Error(`Solana slot ${blockNumber} not found`);
        return {
            hash: block.blockhash,
            parentHash: block.previousBlockhash,
            timestamp: new Date((block.blockTime || 0) * 1000),
        };
    }

    async getLatestBlockNumber(): Promise<string> {
        const slot = await this.connection.getSlot();
        return slot.toString();
    }

    async detectReorg(fromBlock: string): Promise<ReorgInfo | null> {
        // Solana has a different finality model
        // Check if slot is finalized
        const slot = parseInt(fromBlock);
        const isFinalized = await this.connection.getBlockHeight();

        // Simplified - real implementation would check finalization status
        return null;
    }

    async verifyBlockHash(blockNumber: string, expectedHash: string): Promise<boolean> {
        const slot = parseInt(blockNumber);
        const block = await this.connection.getBlock(slot);
        return block?.blockhash === expectedHash;
    }

    getChainId(): string {
        return this.chainId;
    }
}
