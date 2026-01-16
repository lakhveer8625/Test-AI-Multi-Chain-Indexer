# Docker Deployment Guide

This guide explains how to build and run the Next.js frontend application using Docker.

## 📋 Prerequisites

- Docker (v20.10+)
- Docker Compose (v2.0+)

## 🚀 Quick Start

### Option 1: Using Docker Compose (Recommended)

```bash
# Build and start the container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

The application will be available at **http://localhost:3000**

### Option 2: Using Docker CLI

```bash
# Build the image
docker build -t lak-frontend:latest .

# Run the container
docker run -d \
  --name lak-frontend \
  -p 3000:3000 \
  lak-frontend:latest

# View logs
docker logs -f lak-frontend

# Stop the container
docker stop lak-frontend
docker rm lak-frontend
```

## 🔧 Environment Variables

To pass environment variables to the container:

### Using Docker Compose

Edit `docker-compose.yml` and add your variables under the `environment` section:

```yaml
environment:
  - NEXT_PUBLIC_API_URL=http://your-api-url
  - NEXT_PUBLIC_GRAPHQL_ENDPOINT=http://your-graphql-endpoint
```

### Using Docker CLI

```bash
docker run -d \
  --name lak-frontend \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://your-api-url \
  -e NEXT_PUBLIC_GRAPHQL_ENDPOINT=http://your-graphql-endpoint \
  lak-frontend:latest
```

## 🏗️ Multi-Stage Build Details

The Dockerfile uses a multi-stage build process:

1. **deps**: Installs production dependencies only
2. **builder**: Builds the Next.js application with all dependencies
3. **runner**: Creates minimal production runtime image

This approach:
- ✅ Reduces final image size (typically 100-200 MB)
- ✅ Improves security by running as non-root user
- ✅ Optimizes layer caching for faster rebuilds
- ✅ Uses Alpine Linux for minimal footprint

## 📦 Building for Production

### Standard Build

```bash
docker build -t lak-frontend:v1.0.0 .
```

### Build with Custom Registry

```bash
# Tag for your registry
docker build -t your-registry.com/lak-frontend:v1.0.0 .

# Push to registry
docker push your-registry.com/lak-frontend:v1.0.0
```

### Build with Build Arguments

```bash
docker build \
  --build-arg NODE_ENV=production \
  -t lak-frontend:latest \
  .
```

## 🔍 Troubleshooting

### Container exits immediately

Check logs:
```bash
docker logs lak-frontend
```

### Port already in use

Change the host port in docker-compose.yml:
```yaml
ports:
  - "3001:3000"  # Uses port 3001 on host
```

### Build fails

Clear Docker cache and rebuild:
```bash
docker-compose down
docker system prune -f
docker-compose up --build
```

### Check container status

```bash
# List running containers
docker ps

# List all containers
docker ps -a

# Inspect container
docker inspect lak-frontend
```

## 🔄 Development vs Production

### Development Mode

For development with hot-reload, use the standard npm command:
```bash
npm run dev
```

### Production Mode

For production deployment, use Docker:
```bash
docker-compose up -d
```

## 📊 Image Size Optimization

The multi-stage build produces a lean production image:

- **Full build size**: ~1.5 GB (includes build dependencies)
- **Final image size**: ~150-250 MB (standalone runtime only)

## 🔐 Security Features

- ✅ Runs as non-root user (`nextjs`)
- ✅ Uses official Node.js Alpine images
- ✅ Only includes production dependencies
- ✅ Minimal attack surface

## 🌐 Networking

The docker-compose setup creates a bridge network (`app-network`) that allows:
- Service-to-service communication
- Easy integration with backend services
- Isolated network environment

To connect with other services, add them to the same network in docker-compose.yml.

## 📝 Next Steps

1. Configure environment variables for your deployment
2. Set up CI/CD pipeline for automated builds
3. Configure reverse proxy (nginx/traefik) if needed
4. Set up monitoring and logging

## 🆘 Support

For issues or questions:
- Check the main README.md
- Review QUICK_START.md for development setup
- Examine Docker logs for error messages
