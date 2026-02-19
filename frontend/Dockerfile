# Frontend Dockerfile for 30ReportManager - Multi-stage build
FROM node:20-slim AS base

# Install dependencies stage
FROM base AS deps
WORKDIR /app

COPY package*.json ./
RUN npm ci

# Builder stage
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment for build - API URL must be set at build time for Next.js
ARG NEXT_PUBLIC_API_URL=http://localhost:3025
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_CUBEJS_API_URL=http://localhost:4000/cubejs-api/v1
ENV NEXT_PUBLIC_CUBEJS_API_URL=$NEXT_PUBLIC_CUBEJS_API_URL
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Production stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3050

ENV PORT=3050
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
