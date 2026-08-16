# WorkFlowOS - Staging Deployment Guide

## Overview

This document describes how to deploy WorkFlowOS to a staging environment for user acceptance testing (UAT).

## Architecture

```
[ Client ] → [ Web: port 3000 ] → [ API: port 3001 ] → [ PostgreSQL 15 ]
```

## Prerequisites

- Node.js 20+ (or Docker)
- PostgreSQL 15
- Access to staging server/host
- Environment secrets

## Deployment Steps

### 1. Prepare the environment

```bash
cp apps/api/.env.staging.example apps/api/.env.staging
cp apps/web/.env.staging.example apps/web/.env.staging
# Set real secrets (database URL, JWT secrets, web URL)
```

### 2. Install dependencies

```bash
npm ci
```

### 3. Run migrations

```bash
cd apps/api
npx prisma generate
npx prisma migrate deploy
```

### 4. Seed the database (first staging deploy)

```bash
npm run seed
```

### 5. Build the applications

```bash
# API
cd apps/api && npm run build

# Web
cd apps/web && npm run build
```

### 6. Verify health check

```bash
curl http://localhost:3001/health
# {"status":"ok",...}

curl http://localhost:3001/readiness
# {"status":"ready","checks":{"database":"up"}}
```

### 7. Start the applications

```bash
# API (production mode)
NODE_ENV=staging node apps/api/dist/main

# Web (production mode)
node apps/web/.next/standalone/server.js
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection string | postgresql://user:pass@host:5432/workflowos |
| JWT_ACCESS_SECRET | Access token signing secret | 64-char random |
| JWT_REFRESH_SECRET | Refresh token signing secret | 64-char random |
| WEB_URL | Allowed CORS origins | https://staging.workflowos.example.com |
| NODE_ENV | Environment mode | staging |
| API_PORT | API port | 3001 |
| WEB_PORT | Web port | 3000 |
| THROTTLE_TTL | Rate limit window (ms) | 60000 |
| THROTTLE_LIMIT | Max requests per window | 60 |

## Database Migration Policy

- **Always** run `npx prisma migrate deploy` (never `migrate dev`) in staging
- Back up the database before applying migrations
- Verify schema version after migration
- Test rollback path (see ROLLBACK.md)

## Seed Policy

- Seed only on **first** staging deploy
- Use `npm run seed` (deterministic)
- Never reseed over user-entered data

## Health Checks

- `/health` - process liveness
- `/readiness` - database connectivity
- Use these in orchestrator/load-balancer health probes

## Rollback

See `docs/DEPLOYMENT_ROLLBACK.md`

## Backup

See `scripts/backup-db.*` and `docs/DEPLOYMENT_BACKUP.md`

## Verification Checklist

- [ ] `/health` and `/readiness` return 200
- [ ] Login works with seeded admin account
- [ ] Dashboard loads real data
- [ ] Security headers present (CSP, HSTS, X-Content-Type-Options)
- [ ] CORS restricted to WEB_URL
- [ ] Rate limiting active (60 req/min)
- [ ] Include `X-Request-ID` in API responses
- [ ] Logs contain requestId, no secrets