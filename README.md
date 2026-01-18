# Multi-Chain Event Indexer

Enterprise-grade multi-chain blockchain event indexing platform with monolithic architecture.

## 🎯 Features

- **Multi-Chain Support**: Ethereum, BSC, Polygon, Solana, and more
- **High Throughput**: Indexing 1000+ events per second
- **Fault Tolerant**: Reorg detection and handling
- **Monolithic Backend**: Single deployable service with internal modular boundaries
- **Modern Frontend**: Next.js with real-time updates
- **Production Ready**: Docker Compose for easy deployment

## 🏗️ Architecture

```
┌─────────────────┐
│  Blockchain     │
│  Networks       │
└────────┬────────┘
         │
┌────────▼────────────────────────────────┐
│  Backend (NestJS Monolith - Port 3000) │
│  ┌──────────────────────────────────┐  │
│  │  Chain Adapters (EVM, Solana)    │  │
│  ├──────────────────────────────────┤  │
│  │  Event Ingestion Pipeline        │  │
│  ├──────────────────────────────────┤  │
│  │  Indexer Workers                 │  │
│  ├──────────────────────────────────┤  │
│  │  Reorg Detection & Replay        │  │
│  ├──────────────────────────────────┤  │
│  │  Query Layer (REST + GraphQL)    │  │
│  └──────────────────────────────────┘  │
└────────┬────────────────────────────────┘
         │
    ┌────▼────┐
    │  MySQL  │
    │  Redis  │
    └────┬────┘
         │
┌────────▼────────────────────────────────┐
│  Frontend (Next.js - Port 3001)        │
│  - Real-time Event Stream               │
│  - Chain Analytics                      │
│  - Block Explorer                       │
└─────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 20+ (for local development)
- MySQL 8+
- Redis
- RabbitMQ

### Using Docker Compose (Recommended)

1. **Clone the repository**

```bash
git clone <repository-url>
cd multi-chain-indexer
```

2. **Configure environment variables**

Update the RPC URLs in `docker-compose.yml` with your API keys:

```yaml
ETH_MAINNET_RPC: https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY
ETH_SEPOLIA_RPC: https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
```

3. **Start all services**

```bash
docker-compose up -d
```

4. **Access the application**

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api/docs
- **GraphQL Playground**: http://localhost:3000/graphql

### Local Development

#### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run start:dev
```

#### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

## 📊 Database Schema

### Core Tables

- **chains**: Supported blockchain networks
- **blocks**: Indexed blocks with reorg handling
- **contracts**: Smart contracts metadata
- **raw_events**: Raw blockchain events (append-only)
- **indexed_events**: Normalized and decoded events
- **token_transfers**: Specialized ERC20/721/1155 transfers

## 🔌 API Endpoints

### REST API

- `GET /api/chains` - List all supported chains
- `GET /api/events` - Query indexed events
- `GET /api/blocks` - Query blocks
- `GET /api/events/:id` - Get specific event

### GraphQL

```graphql
query {
  events(chainId: "1", limit: 10) {
    events {
      id
      event_type
      from_address
      to_address
      value
    }
    total
  }
}
```

## 🧪 Testing

### Backend

```bash
cd backend
npm run test              # Unit tests
npm run test:e2e          # E2E tests
npm run test:cov          # Coverage
```

### Frontend

```bash
cd frontend
npm run test
npm run lint
```

## 📦 Deployment

### Production Build

```bash
# Backend
cd backend
npm run build
npm run start:prod

# Frontend
cd frontend
npm run build
npm start
```

### Docker Build

```bash
# Backend
docker build -t indexer-backend:latest ./backend

# Frontend
docker build -t indexer-frontend:latest ./frontend
```

## 🗂️ Project Structure

```
├── backend/                 # NestJS Monolithic Backend
│   ├── src/
│   │   ├── chain-adapters/  # Blockchain adapters
│   │   ├── ingestion/       # Event ingestion pipeline
│   │   ├── indexer/         # Event processing workers
│   │   ├── messaging/       # RabbitMQ messaging
│   │   ├── reorg/           # Reorg detection & handling
│   │   ├── query/           # REST & GraphQL APIs
│   │   ├── auth/            # Authentication
│   │   ├── rate-limit/      # Rate limiting
│   │   └── shared/          # Shared entities & modules
│   └── Dockerfile
│
├── frontend/                # Next.js Frontend
│   ├── src/
│   │   ├── app/            # Next.js 14 App Router
│   │   └── components/     # React components
│   └── Dockerfile
│
└── docker-compose.yml      # Full stack orchestration
```

## ⚙️ Configuration

### Backend Environment Variables

```env
# Server
NODE_ENV=production
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=indexer
DB_PASSWORD=your_password
DB_DATABASE=multi_chain_indexer

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Chain RPCs
ETH_MAINNET_RPC=https://...
POLYGON_MAINNET_RPC=https://...
SOLANA_MAINNET_RPC=https://...

# Workers
WORKER_CONCURRENCY=10
BATCH_SIZE=100
CONFIRMATION_DEPTH=12
```

### Frontend Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:3000/graphql
```

## 🔐 Security

- JWT-based authentication (ready for implementation)
- API rate limiting (ready for implementation)
- Input validation with class-validator
- CORS enabled for frontend communication
- Prepared statements for SQL injection prevention

## 📈 Performance

- **Indexing Speed**: ~1000 events/second
- **Query Performance**: Sub-second response times
- **Scalability**: Horizontal scaling via worker processes
- **Caching**: Redis for frequently accessed data
- **Database Optimization**: Indexed columns, partitioned tables

## 🛠️ Monitoring

- Health checks for all services
- Metrics endpoint (port 9090)
- Structured logging
- Error tracking ready

## 📝 License

MIT

## 👥 Contributing

Contributions are welcome! Please read our contributing guidelines first.

## 📞 Support

For issues and questions, please open a GitHub issue.

---

**Built with ❤️ using NestJS & Next.js**
🌐 Frontend (Next.js – Separate Service)
Tech Stack

Next.js (App Router)

Server Components

GraphQL Client

WebSockets

Tailwind

Features

Real-time event stream

Chain / token filters

Wallet explorer

Transaction explorer

Charts & analytics

Virtualized tables