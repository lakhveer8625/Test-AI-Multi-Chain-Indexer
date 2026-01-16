# Base stage with dependencies
FROM node:20-alpine AS base

# Install dependencies for native modules
RUN apk add --no-cache \
    openssl \
    libc6-compat

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm@latest

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy prisma schema
COPY prisma ./prisma/
COPY tsconfig.json ./

# Generate Prisma Client
RUN pnpm run db:generate

# Development stage
FROM base AS development

WORKDIR /app

# Copy source files
COPY src ./src/

# Build TypeScript
RUN pnpm run build

# Set environment
ENV NODE_ENV=development

# Expose port if needed
EXPOSE 3000

# Default command for development (migrations + seed)
CMD ["sh", "-c", "pnpm run db:migrate && pnpm run db:seed"]

# Production stage
FROM node:20-alpine AS production

RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@latest

# Copy package files and install production dependencies only
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

# Copy prisma schema and generated client
COPY --from=base /app/prisma ./prisma/
COPY --from=base /app/node_modules/.prisma ./node_modules/.prisma/
COPY --from=base /app/node_modules/@prisma ./node_modules/@prisma/

# Copy built files
COPY --from=development /app/dist ./dist/

ENV NODE_ENV=production

# Default command for production
CMD ["node", "dist/index.js"]

# Migration stage - useful for running migrations as a separate step
FROM base AS migration

WORKDIR /app

COPY src ./src/

ENV NODE_ENV=development

# This stage is used to run migrations only
CMD ["pnpm", "run", "db:migrate"]
