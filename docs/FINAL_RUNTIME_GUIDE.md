# WorkFlowOS Final Runtime Guide

## Overview

This guide covers the final runtime configuration for WorkFlowOS, including startup, health checks, and operational procedures.

## Application Architecture

- **API**: NestJS on port 3001
- **Web**: Next.js on port 3000
- **Database**: PostgreSQL 15
- **Cache**: Redis 7

## Startup Process

### Production
```bash
# API
cd apps/api
npm run build
npm run start

# Web
cd apps/web
npm run build
npm run start
```

### Development
```bash
# Start all services with health checks
npm run dev
# or
make dev
```

## Health Check Endpoints

| Endpoint | Purpose | Expected Response |
|----------|---------|-------------------|
| `GET /health` | Liveness probe | `200 OK` with service info |
| `GET /readiness` | Readiness probe | `200 OK` if DB & Redis ready |
| `GET /startup` | Startup probe | `200 OK` if dependencies available |

### Health Response Example
```json
{
  "status": "ok",
  "service": "workflowos-api",
  "version": "0.1.0",
  "nodeVersion": "v20.x.x",
  "timestamp": "2026-08-18T20:55:55.165Z",
  "uptime": 11.467,
  "memory": {
    "rss": 136151040,
    "heapTotal": 68288512,
    "heapUsed": 34485112
  }
}
```

### Readiness Response Example
```json
{
  "status": "ready",
  "checks": {
    "database": "up",
    "schema": "1 migrations applied",
    "redis": "up"
  },
  "timestamp": "2026-08-18T20:55:59.770Z"
}
```

## Operational Commands

### Database
```bash
# Check migration status
make db-status

# Run migrations
make db-migrate

# Seed database
make db-seed

# Reset and re-seed
make db-reset
```

### Docker Operations
```bash
# Start services
docker compose up -d

# Stop services
docker compose down

# Check status
docker compose ps

# View logs
docker compose logs -f
```

## Monitoring

### Health Checks
- **Liveness**: `/health` - Returns 200 if process is alive
- **Readiness**: `/readiness` - Returns 200 if DB & Redis are ready
- **Startup**: `/startup` - Returns 200 if dependencies available

### Logging
- Structured JSON logging via NestJS
- Request/response logging with sanitization
- Error categorization (auth, authorization, rate_limit, etc.)

### Metrics
- HTTP request counters by method/status
- Request latency histograms
- Error rate by category

## Security

### Authentication
- JWT access tokens (15min expiry)
- JWT refresh tokens (7 day expiry)
- TOTP 2FA support

### Authorization
- RBAC with 4 roles: admin, manager, member, viewer
- Workspace isolation enforced
- Permission-based access control

### Security Headers
- Helmet CSP, HSTS, X-Frame-Options, X-Content-Type-Options
- CORS restricted to configured origins
- Rate limiting per user (60 req/min default)

## Troubleshooting

### API Won't Start
```bash
# Check logs
npm run start:dev

# Common issues:
# 1. Database not running
# 2. Port 3001 in use
# 3. Missing environment variables
```

### Database Connection Failed
```bash
# Verify PostgreSQL is running
pg_isready -U workflowos

# Check database exists
psql -U workflowos -h localhost -d workflowos -c "SELECT 1"
```

### Redis Connection Failed
```bash
# Verify Redis is running
redis-cli ping

# Check connection
redis-cli -h localhost -p 6379 ping
```

### Migration Errors
```bash
# Check migration status
npx prisma migrate status

# Reset and reapply (development only)
npx prisma migrate reset --force
```

## Backup & Recovery

### Database Backup
```bash
pg_dump -U workflowos -h localhost workflowos > backup_$(date +%Y%m%d).sql
```

### Database Restore
```bash
psql -U workflowos -h localhost workflowos < backup_20260818.sql
```

## Rollback Procedure

1. Stop application: `docker compose down` or `npm stop`
2. Restore database from backup
3. Deploy previous version
4. Start application: `docker compose up -d` or `npm run dev`
5. Verify health endpoints

## Support

For operational issues, check:
1. Application logs
2. Database logs: `docker logs workflowos-postgres`
3. Redis logs: `docker logs workflowos-redis`
4. Health endpoints for dependency status