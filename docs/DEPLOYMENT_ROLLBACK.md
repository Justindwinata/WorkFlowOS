# WorkFlowOS - Deployment Rollback

## Overview

This document describes how to roll back a faulty WorkFlowOS deployment. Rollback should be fast, testable, and repeatable.

## Rollback Triggers

- Database migration fails
- Readiness endpoint non-ready after 5 minutes
- Error rate > 5%
- Login unavailable
- Security incident

## Rollback Strategies

### 1. Application Code Rollback (No DB Migration)

If code was deployed but no schema changed:

```bash
# Redeploy previous release image/tag
git checkout <previous-release-tag>
npm ci
cd apps/api && npm run build
cd apps/web && npm run build
# Restart services
```

**Time**: ~15 minutes

### 2. Database Rollback (Migration Applied)

If a schema migration was applied and caused issues:

```bash
# 1. Restore from backup to isolated DB
psql $DATABASE_URL_RESTORE < scripts/backup-latest.sql

# 2. Or use Prisma down-migration (if defined)
cd apps/api
npx prisma migrate resolve --rolled-back <migration_name>
```

**Important**: Never edit migrations. Create a new corrective migration.

### 3. Full Stack Rollback

```bash
# Stop current services
docker compose -f docker-compose.prod.yml down

# Restore DB from backup
./scripts/restore-db.sh <backup-file>

# Deploy previous release
git checkout <previous-release-tag>

# Restart
docker compose -f docker-compose.prod.yml up -d
```

**Time**: ~30 minutes

## Backups Required

- Latest DB backup (before deploy)
- Backup of `.env.production`
- Previous release tag/container image

## Verification After Rollback

```bash
curl http://localhost:3001/health
# {"status":"ok"}

curl http://localhost:3001/readiness
# {"status":"ready","checks":{"database":"up"}}

# Verify login, dashboard, a CRUD flow
```

## Testing the Rollback Path

> Rollback is only trustworthy if it has been **tested**.

- Schedule a staging rollback drill quarterly
- Verify backup restore into an isolated DB (see TESTING.md)
- Document the exact commands used in the drill

## Recovery Time Objectives (Recommended)

| RTO | Description |
|-----|-------------|
| 15 min | Application code rollback |
| 30 min | Full stack rollback with DB restore |
| 1 hour | Disaster recovery from zero |

## Disaster Recovery

If the primary environment is lost:

1. Provision new PostgreSQL from latest backup
2. Provision Redis
3. Deploy API + Web from tagged release
4. Apply `.env.production` values
5. Run `npm run migrate deploy`
6. Verify health/readiness

## Contact & Escalation

- **Owner**: Maintainers
- **Escalation**: Oncall rotation
- **Incident log**: Document in repository after resolution