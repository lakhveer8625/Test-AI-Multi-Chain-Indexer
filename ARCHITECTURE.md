# Architecture Documentation

## System Overview

The Multi-Chain Event Indexer is a **monolithic backend** with a separate frontend, designed to index blockchain events across multiple networks with high throughput and fault tolerance.

## Architecture Principles

1. **Monolithic Backend**: Single deployable service with clear internal module boundaries
2. **Event-Driven**: Reliable message distribution via RabbitMQ
3. **CQRS Pattern**: Separation of write (indexing) and read (querying) operations
4. **Chain-Agnostic**: Pluggable adapter pattern for different blockchains
5. **Replay-Safe**: Reorg detection and handling with soft deletes

## System Components

### 1. Backend (NestJS Monolith)

```
┌─────────────────────────────────────────────────────────┐
│                  Backend (Port 3000)                    │
│                                                         │
│  ┌────────────────────────────────────────────────┐   │
│  │         Chain Adapters Module                   │   │
│  │  - EVM Adapter (Ethereum, BSC, Polygon)        │   │
│  │  - Solana Adapter                              │   │
│  │  - Future: Cosmos, Substrate, etc.             │   │
│  └────────────────────────────────────────────────┘   │
│                         │                              │
│                         ▼                              │
│  ┌────────────────────────────────────────────────┐   │
│  │       Ingestion Pipeline Module                │   │
│  │  - Block Tracker (polls chains)                │   │
│  │  - Deduplicator (prevents duplicates)          │   │
│  │  - Event Publisher (to processing queue)       │   │
│  └────────────────────────────────────────────────┘   │
│                         │                              │
│                         ▼                              │
│  ┌────────────────────────────────────────────────┐   │
│  │         Indexer Workers Module                  │   │
│  │  - Event Normalizer (decodes events)           │   │
│  │  - Event Enricher (adds metadata)              │   │
│  │  - Publishes to RabbitMQ for consumers         │   │
│  └────────────────────────────────────────────────┘   │
│                         │                              │
│                         ▼                              │
│  ┌────────────────────────────────────────────────┐   │
│  │         Reorg Detection Module                  │   │
│  │  - Monitor block hashes                        │   │
│  │  - Soft delete non-canonical events            │   │
│  │  - Replay missed blocks                        │   │
│  └────────────────────────────────────────────────┘   │
│                         │                              │
│                         ▼                              │
│  ┌────────────────────────────────────────────────┐   │
│  │            Query Layer Module                   │   │
│  │  - REST API (simple queries)                   │   │
│  │  - GraphQL API (complex queries)               │   │
│  │  - Optimized with Redis caching                │   │
│  └────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
         ┌──────────────────────────────┐
         │    Data Layer                │
         │  - MySQL (Hot Storage)       │
         │  - Redis (Cache)             │
         │  - S3 (Cold Archive - Future)│
         └──────────────────────────────┘
```

### 2. Frontend (Next.js)

```
┌─────────────────────────────────────────────────────────┐
│                  Frontend (Port 3001)                   │
│                                                         │
│  ┌────────────────────────────────────────────────┐   │
│  │              Pages (App Router)                 │   │
│  │  - Dashboard (/)                               │   │
│  │  - Events Explorer (/events)                   │   │
│  │  - Block Explorer (/blocks)                    │   │
│  │  - Chain Stats (/chains)                       │   │
│  └────────────────────────────────────────────────┘   │
│                         │                              │
│  ┌────────────────────────────────────────────────┐   │
│  │              React Components                   │   │
│  │  - StatsCards (real-time metrics)              │   │
│  │  - RecentEvents (event stream)                 │   │
│  │  - ChainStats (chain analytics)                │   │
│  └────────────────────────────────────────────────┘   │
│                         │                              │
│  ┌────────────────────────────────────────────────┐   │
│  │            Data Fetching Layer                  │   │
│  │  - Apollo Client (GraphQL)                     │   │
│  │  - TanStack Query (REST)                       │   │
│  │  - Real-time updates (polling)                 │   │
│  └────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Data Flow

### Write Path (Indexing)

```
Blockchain → Chain Adapter → Block Tracker → Deduplicator
                                                  │
                                                  ▼
                                           Raw Events Table
                                                  │
                                                  ▼
                                    Normalizer → Enricher
                                                  │
                                                  ▼
                                         Indexed Events Table
                                                  │
                                                  ▼
                                           RabbitMQ Exchange
                                           (event.transfer, etc.)
```

### Read Path (Querying)

```
Frontend → Query Layer → Redis Cache (if hit)
              │                     │
              │                     ▼
              │              Return Cached Data
              │
              ▼ (cache miss)
         MySQL Query → Cache Result → Return to Frontend
```

## Database Design

### Key Design Decisions

1. **Append-Only**: Raw events are never updated, only marked non-canonical
2. **Partitioning**: Large tables partitioned by time or chain
3. **Indexing Strategy**: Comprehensive indexes on query columns
4. **Soft Deletes**: `is_canonical` flag instead of hard deletes

### Schema

```sql
chains
  - id (PK)
  - chain_id (UNIQUE)
  - name
  - type (evm, solana, etc.)
  - rpc_url
  - latest_indexed_block
  - is_active

blocks
  - id (PK)
  - chain_id, block_number (UNIQUE)
  - block_hash
  - parent_hash
  - timestamp
  - is_canonical
  - event_count

raw_events (append-only)
  - id (UUID PK)
  - chain_id, block_number, log_index (UNIQUE)
  - tx_hash
  - contract_address
  - topics (JSON)
  - data
  - is_canonical
  - is_processed

indexed_events (normalized)
  - id (UUID PK)
  - raw_event_id (FK)
  - chain_id
  - event_type (Transfer, Approval, etc.)
  - from_address
  - to_address
  - value
  - decoded_data (JSON)
  - is_canonical
```

## Module Descriptions

### Chain Adapters Module

**Responsibility**: Connect to blockchains and fetch raw event data

**Components**:
- `ChainAdapter` interface
- `EvmAdapter` (Ethereum-compatible chains)
- `SolanaAdapter` (Solana)
- Future adapters...

**Key Functions**:
- Connect to RPC/WebSocket
- Fetch blocks and logs
- Detect reorgs
- Normalize to common format

### Ingestion Module

**Responsibility**: Coordinate the ingestion of blockchain data

**Components**:
- `BlockTrackerService`: Polls chains for new blocks
- `DeduplicatorService`: Prevents duplicate event indexing
- `IngestionService`: Main orchestrator

**Key Features**:
- Configurable batch sizes
- Confirmation depth handling
- Automatic backfilling

### Indexer Module

**Responsibility**: Process raw events into normalized indexed events

**Components**:
- `IndexerService`: Main worker coordinator
- `EventNormalizerService`: Decode event data
- `EventEnricherService`: Add metadata

**Processing Pipeline**:
1. Decode event signature
2. Extract parameters
3. Enrich with contract metadata
4. Save to indexed_events table

### Reorg Module

**Responsibility**: Detect and handle blockchain reorganizations

**Components**:
- `ReorgService`: Monitor and handle reorgs

**Workflow**:
1. Periodically verify recent block hashes
2. If mismatch detected, mark events as non-canonical
3. Reindex affected blocks
4. Update canonical state

### Query Module

**Responsibility**: Serve event data to clients

**APIs**:
- **REST**: Simple, standard HTTP endpoints
- **GraphQL**: Complex queries with filtering

**Optimizations**:
- Redis caching for frequent queries
- Pre-aggregated tables for analytics
- Pagination support

## Scaling Strategy

### Horizontal Scaling

1. **Worker Scaling**: Increase `WORKER_CONCURRENCY` env var
2. **Database Scaling**: MySQL read replicas
3. **Caching**: Redis cluster for distributed cache
4. **Messaging**: RabbitMQ exchange for multi-consumer event streaming

### Vertical Scaling

1. Increase container resources in `docker-compose.yml`
2. Optimize batch sizes
3. Database tuning (buffer pool, connections)

## Monitoring & Observability

### Metrics (Future)

- Events indexed per second
- Query latency
- Reorg frequency
- Worker queue depth

### Logging

- Structured logs via NestJS Logger
- Different levels per environment
- Request/response logging

### Health Checks

- HTTP health endpoints
- Database connectivity
- RPC endpoint status

## Security Considerations

### Authentication (Ready for Implementation)

- JWT-based auth module prepared
- API key support for machine clients

### Rate Limiting (Ready for Implementation)

- Per-IP rate limiting
- Per-API-key quotas

### Input Validation

- Class-validator decorators
- SQL injection prevention (TypeORM)
- XSS protection

## Future Enhancements

1. **More Chains**: Cosmos, Substrate, Aptos
2. **Real-time WebSockets**: Live event streaming
3. **Advanced Analytics**: On-chain metrics
4. **Cold Storage**: Archive old events to S3
5. **Multi-Region**: Deploy across regions
6. **Custom Indexing**: User-defined event filters

---

For implementation details, see the source code in `/backend/src/` and `/frontend/src/`.
