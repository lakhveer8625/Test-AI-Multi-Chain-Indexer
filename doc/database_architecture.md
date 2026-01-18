# Database Architecture

This document details the MySQL database schema for the Multi-Chain Event Indexer.

## Professional Overview
The database is optimized for high-write throughput and complex querying. It uses an append-only strategy for raw data and a normalized strategy for processed events.

## Entity Relationship Diagram
```mermaid
erDiagram
    CH ||--o{ BL : contains
    BL ||--o{ TX : includes
    TX ||--o{ RE : generates
    RE ||--o1 IE : processed_to
    
    CH {
        string id PK
        string chain_id UK "Unique Chain ID (e.g. 1, 56, solana-mainnet)"
        string name
        string type "evm | solana"
        string rpc_url
        bigint latest_indexed_block
        boolean is_active
    }
    
    BL {
        string id PK
        string chain_id FK
        bigint block_number
        string block_hash UK
        string parent_hash
        datetime timestamp
        boolean is_canonical
    }
    
    TX {
        string id PK
        string tx_hash UK
        string chain_id FK
        bigint block_number
        string from_address
        string to_address
        string value
        text input_data
    }
    
    RE {
        string id PK "UUID"
        string chain_id FK
        bigint block_number
        integer log_index
        string tx_hash
        string contract_address
        text topics "JSON Array"
        text data "Hex String"
        boolean is_processed
        boolean is_canonical
    }
    
    IE {
        string id PK "UUID"
        string raw_event_id FK
        string event_type "Transfer | Approval | etc"
        string from_address
        string to_address
        string value
        text decoded_data "JSON"
    }

    EL {
        string id PK "UUID"
        string level "error | warn"
        string source "Context"
        text message
        text stack_trace
        json metadata
        datetime timestamp
    }
```

## Key Optimization Strategies

### 1. High-Write Throughput
- **Chunked Saves**: All ingestion and indexing operations use batching (50-100 items per chunk) to reduce I/O overhead.
- **Upsert Logic**: Uses `ON DUPLICATE KEY UPDATE` (via TypeORM `upsert`) to handle retries and re-insertions without primary key violations.

### 2. Indexes
- **Composite Indexes**: Most tables have composite indexes on `(chain_id, block_number)` to speed up temporal queries.
- **Log Indexing**: `raw_events` is indexed on `(chain_id, block_number, log_index)` for precise event identification.

### 3. BigInt Handling
- Block numbers and transaction values are stored as `BigInt` or `Decimal` but handled as **strings** in the application logic to prevent JavaScript precision loss.

### 4. Soft Deletes (Reorg Safety)
- The `is_canonical` flag is used across `blocks`, `transactions`, and `raw_events`. In the event of a chain reorganization, data is not deleted but marked `is_canonical = false`.
