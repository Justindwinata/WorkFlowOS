# WorkFlowOS Database Backup & Restore Guide

## Overview

This guide documents the backup and restore procedures for the WorkFlowOS PostgreSQL database.

## Backup Script

`scripts/backup-db.sh`

```bash
# Create a backup in ./backups
./scripts/backup-db.sh

# Create a backup in a specific directory
./scripts/backup-db.sh /path/to/dir
```

**Behavior**:
- Creates timestamped gzip dump: `workflowos_YYYYMMDD_HHMMSS.sql.gz`
- Writes a `.meta` sidecar with file details
- Enforces retention (default 14 backups, override with `BACKUP_RETENTION`)

## Restore Script

`scripts/restore-db.sh`

```bash
# Restore into isolated test DB
./scripts/restore-db.sh /path/to/workflowos_2026.sql.gz workflowos_restore
```

**Behavior**:
- Creates target DB if missing
- Restores gzip or plain SQL
- Leaves target DB intact (requires manual DROP for cleanup)

## Verify Script

`scripts/verify-backup.sh`

```bash
# Restore into isolated DB, check table counts, drop test DB
./scripts/verify-backup.sh /path/to/workflowos_2026.sql.gz
```

## Scheduled Backups (Cron)

```cron
# Daily at 02:00
0 2 * * * /path/to/WorkFlowOS/scripts/backup-db.sh /var/backups/workflowos >> /var/log/workflowos-backup.log 2>&1
```

## Production Backup Strategy

| Tier | Frequency | Retention | Location |
|------|-----------|-----------|----------|
| Daily full | 02:00 UTC | 14 days | Local + offsite (S3/GCS) |
| Weekly | Sunday 02:00 | 8 weeks | Offsite |
| Monthly | 1st 02:00 | 12 months | Cold storage |

## Testing the Backup

> A backup is only trustworthy if it can be **restored**.

Run at least weekly:
```bash
./scripts/verify-backup.sh latest_backup.gz
```

## Restoration Drill (Quarterly)

1. Provision isolated PostgreSQL instance
2. Run `scripts/restore-db.sh <backup> workflowos_drill`
3. Verify user/role/workspace counts
4. Point API at drill DB, run smoke test
5. Tear down drill DB

## Requirements

- `pg_dump` / `psql` (postgresql-client) OR Docker with running `workflowos-postgres`
- `DATABASE_URL` in `.env`
- Write access to backup directory

## NOT VERIFIED LOCALLY

As of Phase 5, PostgreSQL is not installed locally and Docker is unavailable. The scripts are provided and CI/cloud should execute the backup/restore/verify procedures. This limitation is documented honestly.