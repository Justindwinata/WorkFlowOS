FROM node:20-alpine AS base

RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies separately for layer caching
FROM base AS deps
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/ui/package.json packages/ui/package.json
COPY packages/config/package.json packages/config/package.json
COPY packages/types/package.json packages/types/package.json
RUN npm ci

# Build the API
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY .
RUN cd apps/api && npx prisma generate && npm run build

# Production image
FROM node:20-alpine AS production
RUN apk add --no-cache libc6-compat && addgroup -S nodeuser && adduser -S nodeuser -G nodeuser
WORKDIR /app

ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json

# Remove dev dependencies to minimize attack surface
RUN npm prune --omit=dev --workspace=api 2>/dev/null || true

USER nodeuser
EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3001/health || exit 1

CMD ["node", "apps/api/dist/main"]