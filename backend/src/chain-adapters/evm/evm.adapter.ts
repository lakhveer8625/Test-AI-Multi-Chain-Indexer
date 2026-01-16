import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import { ChainAdapter, RawEvent, ReorgInfo, RawTransaction } from '../adapter.interface';

@Injectable()
export class EvmAdapter implements ChainAdapter {
    private readonly logger = new Logger(EvmAdapter.name);
    private provider: ethers.JsonRpcProvider;
    private wsProvider: ethers.WebSocketProvider | null = null;
    private chainId: string;
    private chainName: string;

    constructor(
        private configService: ConfigService,
        chainConfig: { chainId: string; chainName: string; rpcUrl: string; wsUrl?: string }
    ) {
        this.chainId = chainConfig.chainId;
        this.chainName = chainConfig.chainName;
        this.provider = new ethers.JsonRpcProvider(chainConfig.rpcUrl);

        if (chainConfig.wsUrl) {
            this.wsProvider = new ethers.WebSocketProvider(chainConfig.wsUrl);
        }

        this.logger.log(`Initialized EVM adapter for ${this.chainName} (${this.chainId})`);
    }

    async start(): Promise<void> {
        this.logger.log(`Starting EVM adapter for ${this.chainName}`);

        // Verify connection
        const network = await this.provider.getNetwork();
        this.logger.log(`Connected to network: ${network.name} (chainId: ${network.chainId})`);

        // Start listening for new blocks if WebSocket is available
        if (this.wsProvider) {
            this.wsProvider.on('block', (blockNumber) => {
                this.logger.debug(`New block detected: ${blockNumber}`);
            });
        }
    }

    async stop(): Promise<void> {
        this.logger.log(`Stopping EVM adapter for ${this.chainName}`);

        if (this.wsProvider) {
            this.wsProvider.removeAllListeners();
            await this.wsProvider.destroy();
        }

        this.provider.destroy();
    }

    async fetchBlock(blockNumber: string): Promise<RawEvent[]> {
        const blockNum = parseInt(blockNumber);
        const block = await this.provider.getBlock(blockNum, true);

        if (!block) {
            throw new Error(`Block ${blockNumber} not found`);
        }

        const events: RawEvent[] = [];

        // Fetch all transaction receipts to get logs
        for (const tx of block.prefetchedTransactions || []) {
            const receipt = await this.provider.getTransactionReceipt(tx.hash);

            if (receipt && receipt.logs) {
                for (const log of receipt.logs) {
                    events.push({
                        chain_id: this.chainId,
                        block_number: blockNumber,
                        block_hash: block.hash!,
                        tx_hash: tx.hash,
                        log_index: log.index,
                        contract_address: log.address.toLowerCase(),
                        topics: [...log.topics] as string[],
                        data: log.data,
                        block_timestamp: new Date(block.timestamp * 1000),
                    });
                }
            }
        }

        this.logger.debug(`Fetched ${events.length} events from block ${blockNumber}`);
        return events;
    }

    async fetchBlockRange(fromBlock: string, toBlock: string): Promise<RawEvent[]> {
        const from = parseInt(fromBlock);
        const to = parseInt(toBlock);
        const events: RawEvent[] = [];

        try {
            const filter = {
                fromBlock: from,
                toBlock: to,
            };

            const logs = await this.provider.getLogs(filter);

            // Group logs by block to fetch block timestamps
            const blockCache = new Map<number, ethers.Block>();

            for (const log of logs) {
                let block = blockCache.get(log.blockNumber);

                if (!block) {
                    block = (await this.provider.getBlock(log.blockNumber)) || undefined;
                    if (block) {
                        blockCache.set(log.blockNumber, block);
                    }
                }

                if (block) {
                    events.push({
                        chain_id: this.chainId,
                        block_number: log.blockNumber.toString(),
                        block_hash: log.blockHash!,
                        tx_hash: log.transactionHash!,
                        log_index: log.index,
                        contract_address: log.address.toLowerCase(),
                        topics: [...log.topics] as string[],
                        data: log.data,
                        block_timestamp: new Date(block.timestamp * 1000),
                    });
                }
            }
        } catch (error) {
            this.logger.warn(`Failed to fetch logs for range ${from}-${to}: ${error.message}. Falling back to block-by-block.`);
            // Fallback: fetch block by block
            for (let i = from; i <= to; i++) {
                try {
                    const blockLogs = await this.provider.getLogs({
                        fromBlock: i,
                        toBlock: i
                    });

                    const block = await this.provider.getBlock(i);
                    if (!block) continue;

                    for (const log of blockLogs) {
                        events.push({
                            chain_id: this.chainId,
                            block_number: i.toString(),
                            block_hash: block.hash!,
                            tx_hash: log.transactionHash!,
                            log_index: log.index,
                            contract_address: log.address.toLowerCase(),
                            topics: [...log.topics] as string[],
                            data: log.data,
                            block_timestamp: new Date(block.timestamp * 1000),
                        });
                    }
                } catch (innerError) {
                    this.logger.error(`Failed to fetch logs for single block ${i}: ${innerError.message}`);
                }
            }
        }

        this.logger.log(`Fetched ${events.length} events from blocks ${fromBlock} to ${toBlock}`);
        return events;
    }

    async fetchTransactions(blockNumber: string): Promise<RawTransaction[]> {
        const blockNum = parseInt(blockNumber);
        const block = await this.provider.getBlock(blockNum, true);

        if (!block) {
            throw new Error(`Block ${blockNumber} not found`);
        }

        const transactions: RawTransaction[] = [];

        for (const txHash of block.transactions) {
            const tx = typeof txHash === 'string'
                ? await this.provider.getTransaction(txHash)
                : txHash;

            if (tx) {
                transactions.push({
                    chain_id: this.chainId,
                    block_number: block.number.toString(),
                    block_hash: block.hash!,
                    tx_hash: tx.hash,
                    from_address: tx.from.toLowerCase(),
                    to_address: tx.to ? tx.to.toLowerCase() : null,
                    value: tx.value.toString(),
                    input_data: tx.data,
                    timestamp: new Date(block.timestamp * 1000),
                });
            }
        }

        return transactions;
    }

    async fetchBlockMetadata(blockNumber: string): Promise<{ hash: string; parentHash: string; timestamp: Date }> {
        const blockNum = parseInt(blockNumber);
        const block = await this.provider.getBlock(blockNum);
        if (!block) throw new Error(`Block ${blockNumber} not found`);
        return {
            hash: block.hash!,
            parentHash: block.parentHash,
            timestamp: new Date(block.timestamp * 1000),
        };
    }

    async getLatestBlockNumber(): Promise<string> {
        const blockNumber = await this.provider.getBlockNumber();
        return blockNumber.toString();
    }

    async detectReorg(fromBlock: string): Promise<ReorgInfo | null> {
        // Implementation for reorg detection
        // Compare stored block hashes with current chain state
        const blockNum = parseInt(fromBlock);
        const currentBlock = await this.provider.getBlock(blockNum);

        if (!currentBlock) {
            return null;
        }

        // In a real implementation, you would compare with stored hashes
        // For now, this is a placeholder
        return null;
    }

    async verifyBlockHash(blockNumber: string, expectedHash: string): Promise<boolean> {
        const block = await this.provider.getBlock(parseInt(blockNumber));
        return block?.hash === expectedHash;
    }

    getChainId(): string {
        return this.chainId;
    }

    /**
     * Decode event using ABI
     */
    decodeEvent(log: ethers.Log, abi: any[]): any {
        try {
            const iface = new ethers.Interface(abi);
            const parsed = iface.parseLog({
                topics: log.topics as string[],
                data: log.data,
            });

            return parsed;
        } catch (error) {
            this.logger.warn(`Failed to decode log: ${error.message}`);
            return null;
        }
    }
}
