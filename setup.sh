#!/bin/bash

# Multi-Chain Event Indexer - Setup Script
# This script helps you set up the entire system

set -e

echo "🚀 Multi-Chain Event Indexer - Setup Script"
echo "============================================"
echo ""

# Check for Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check for Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

# Create environment files
echo "📝 Creating environment files..."

# Backend .env
if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env from template"
    echo "⚠️  Please update backend/.env with your RPC API keys!"
else
    echo "ℹ️  backend/.env already exists, skipping..."
fi

# Frontend .env.local
if [ ! -f frontend/.env.local ]; then
    cat > frontend/.env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:3000/graphql
EOF
    echo "✅ Created frontend/.env.local"
else
    echo "ℹ️  frontend/.env.local already exists, skipping..."
fi

echo ""
echo "🏗️  Building and starting services..."
echo ""

# Start services with Docker Compose
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check service health
echo ""
echo "🔍 Checking service status..."
docker-compose ps

echo ""
echo "✅ Setup complete!"
echo ""
echo "📊 Access your services:"
echo "  - Frontend:       http://localhost:3001"
echo "  - Backend API:    http://localhost:3000"
echo "  - API Docs:       http://localhost:3000/api/docs"
echo "  - GraphQL:        http://localhost:3000/graphql"
echo ""
echo "📝 Next steps:"
echo "  1. Update backend/.env with your RPC API keys"
echo "  2. Restart backend: docker-compose restart backend"
echo "  3. View logs: docker-compose logs -f"
echo ""
echo "🛠️  Useful commands:"
echo "  - Stop services:   docker-compose down"
echo "  - View logs:       docker-compose logs -f [service]"
echo "  - Rebuild:         docker-compose up -d --build"
echo ""
echo "Happy indexing! 🎉"
