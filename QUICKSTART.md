# Quick Start Guide

## Option 1: Docker Compose (Recommended for Production)

### Prerequisites
- Docker 20.10+
- Docker Compose 1.29+

### Steps

1. **Run the setup script:**
   ```bash
   ./setup.sh
   ```

2. **Configure RPC endpoints** (IMPORTANT):
   Edit `backend/.env` and add your API keys:
   ```env
   ETH_MAINNET_RPC=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
   ETH_SEPOLIA_RPC=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
   POLYGON_MAINNET_RPC=https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY
   ```

3. **Restart the backend:**
   ```bash
   docker-compose restart backend
   ```

4. **Access the application:**
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:3000
   - API Docs: http://localhost:3000/api/docs
   - GraphQL: http://localhost:3000/graphql

## Option 2: Local Development

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run start:dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

### Database

You'll need MySQL 8+ and Redis running locally:

```bash
# Using Docker
docker run -d -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=multi_chain_indexer \
  -e MYSQL_USER=indexer \
  -e MYSQL_PASSWORD=indexer_password \
  mysql:8.0

docker run -d -p 6379:6379 redis:7-alpine
```

## Verification

Check if everything is running:

```bash
# Check Docker services
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Test API
curl http://localhost:3000/api/chains
```

## Troubleshooting

### Backend won't start
- Check if MySQL and Redis are running
- Verify RPC endpoints in `.env`
- Check logs: `docker-compose logs backend`

### Frontend shows errors
- Ensure backend is running on port 3000
- Check `.env.local` has correct API URLs
- Clear browser cache

### Database connection errors
- Verify MySQL is running
- Check DB credentials in `docker-compose.yml`
- Wait a few seconds for MySQL to initialize

## Next Steps

1. **Monitor Indexing**: Watch the logs to see events being indexed
2. **Explore the UI**: Navigate to http://localhost:3001
3. **Query API**: Try the GraphQL playground
4. **Add More Chains**: Update the chain configuration in backend

## Useful Commands

```bash
# Stop everything
docker-compose down

# Stop and remove volumes (fresh start)
docker-compose down -v

# Rebuild services
docker-compose up -d --build

# View specific service logs
docker-compose logs -f [backend|frontend|mysql|redis]

# Execute commands in backend container
docker-compose exec backend npm run typeorm migration:run

# Access MySQL
docker-compose exec mysql mysql -u indexer -p multi_chain_indexer
```

## Performance Tuning

### For Higher Throughput

Edit `backend/.env`:

```env
WORKER_CONCURRENCY=20      # Increase workers
BATCH_SIZE=200             # Larger batches
CONFIRMATION_DEPTH=6       # Reduce for faster indexing (less safe)
```

### For Lower Resource Usage

```env
WORKER_CONCURRENCY=5
BATCH_SIZE=50
```

## Getting Help

- Check the main README.md for architecture details
- Review API documentation at `/api/docs`
- Open an issue on GitHub

---

Happy indexing! 🚀
