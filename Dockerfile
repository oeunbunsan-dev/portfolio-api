# ==========================================
# Multi-Stage Production Dockerfile for Bun & ElysiaJS
# ==========================================

# Stage 1: Base image
FROM oven/bun:1.4-alpine AS base
WORKDIR /app

# Stage 2: Install dependencies and generate Prisma client
FROM base AS dependencies
WORKDIR /app

COPY package.json bun.lock* ./
COPY prisma ./prisma/

# Install all dependencies including devDependencies for Prisma generate
RUN bun install --frozen-lockfile || bun install
RUN bun x prisma generate

# Stage 3: Runner
FROM base AS runner
WORKDIR /app

# Install openssl for Prisma query engine on alpine
RUN apk add --no-cache openssl ca-certificates

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Copy node_modules and Prisma generated client
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/prisma ./prisma
COPY package.json tsconfig.json ./
COPY src ./src

# Create and switch to non-root user
USER bun

EXPOSE 3000

# Container healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD bun -e "fetch('http://localhost:3000/api/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

# Start the application
CMD ["sh", "-c", "bun x prisma db push && bun run prisma/seed.ts && bun run src/index.ts"]
