#!/bin/bash

# Project Statistics Script
# Shows comprehensive statistics about the project

echo "📊 Multi-Chain Event Indexer - Project Statistics"
echo "=================================================="
echo ""

echo "📁 File Statistics:"
echo "-------------------"
echo "Backend TypeScript files: $(find backend/src -name '*.ts' | wc -l)"
echo "Frontend TypeScript files: $(find frontend/src -name '*.tsx' -o -name '*.ts' | wc -l)"
echo "Total code files: $(($(find backend/src -name '*.ts' | wc -l) + $(find frontend/src -name '*.tsx' -o -name '*.ts' | wc -l)))"
echo ""

echo "📦 Modules:"
echo "-----------"
echo "Backend modules: $(ls -d backend/src/*/ 2>/dev/null | wc -l)"
echo "Frontend components: $(ls frontend/src/components/*.tsx 2>/dev/null | wc -l)"
echo ""

echo "🐳 Docker Services:"
echo "-------------------"
grep "container_name:" docker-compose.yml | sed 's/.*container_name:/  -/'
echo ""

echo "📚 Documentation:"
echo "-----------------"
ls -1 *.md | sed 's/^/  - /'
echo ""

echo "🔧 Configuration Files:"
echo "-----------------------"
echo "  - backend/package.json"
echo "  - backend/tsconfig.json"
echo "  - backend/nest-cli.json"
echo "  - frontend/package.json"
echo "  - frontend/tsconfig.json"
echo "  - frontend/next.config.js"
echo "  - frontend/tailwind.config.js"
echo "  - docker-compose.yml"
echo ""

echo "✨ Key Features:"
echo "----------------"
echo "  ✅ Multi-chain support (Ethereum, BSC, Polygon, Solana)"
echo "  ✅ Monolithic NestJS backend"
echo "  ✅ Next.js 14 frontend with App Router"
echo "  ✅ REST + GraphQL APIs"
echo "  ✅ Real-time event indexing"
echo "  ✅ Reorg detection & handling"
echo "  ✅ Docker Compose deployment"
echo "  ✅ Premium UI with Tailwind CSS"
echo ""

echo "🚀 Ready to Deploy!"
echo "==================="
echo "Run: ./setup.sh to start all services"
echo ""
