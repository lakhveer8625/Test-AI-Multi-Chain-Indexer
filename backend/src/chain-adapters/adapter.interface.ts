export interface RawEvent {
    chain_id: string;
    block_number: string;
    block_hash: string;
    tx_hash: string;
    log_index: number;
    contract_address: string;
    topics: string[];
    data: string;
    block_timestamp: Date;
}

export interface RawTransaction {
    chain_id: string;
    block_number: string;
    block_hash: string;
    tx_hash: string;
    from_address: string;
    to_address: string | null;
    value: string;
    input_data: string;
    timestamp: Date;
}

export interface ReorgInfo {
    chainId: string;
    fromBlock: string;
    toBlock: string;
    affectedBlocks: string[];
}

export interface ChainAdapter {
    /**
     * Initialize and start the adapter
     */
    start(): Promise<void>;

    /**
     * Stop the adapter gracefully
     */
    stop(): Promise<void>;

    /**
     * Fetch events from a specific block
     */
    fetchBlock(blockNumber: string): Promise<RawEvent[]>;

    /**
     * Fetch events from a range of blocks
     */
    fetchBlockRange(fromBlock: string, toBlock: string): Promise<RawEvent[]>;

    /**
     * Fetch transactions from a specific block
     */
    fetchTransactions(blockNumber: string): Promise<RawTransaction[]>;

    /**
     * Get the latest block number
     */
    getLatestBlockNumber(): Promise<string>;

    /**
     * Detect blockchain reorganizations
     */
    detectReorg(fromBlock: string): Promise<ReorgInfo | null>;

    /**
     * Verify block hash at a specific height
     */
    verifyBlockHash(blockNumber: string, expectedHash: string): Promise<boolean>;

    /**
     * Get chain information
     */
    getChainId(): string;

    /**
     * Fetch block metadata (hash, parentHash, timestamp)
     */
    fetchBlockMetadata(blockNumber: string): Promise<{
        hash: string;
        parentHash: string;
        timestamp: Date;
    }>;
}
