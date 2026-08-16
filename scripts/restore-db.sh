#!/usr/bin/env bash
set -euo pipefail

# WorkFlowOS - Database Restore Script
# Usage: ./scripts/restore-db.sh <backup_file.gz> [target_db]
# Restores a backup into an (ideally isolated) target database.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

if [ -z "${1:-}" ]; then
  echo "Usage: $0 <backup_file.gz> [target_db]" >&2
  exit 1
fi

BACKUP_FILE="$1"
TARGET_DB="${2:-workflowos_restore}"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "ERROR: Backup file not found: $BACKUP_FILE" >&2
  exit 1
fi

if [ -f "$ROOT_DIR/.env" ]; then
  set -a
  # shellcheck source=/dev/null
  source "$ROOT_DIR/.env"
  set +a
fi

DB_USER="${DB_USER:-workflowos}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_PASSWORD="${DB_PASSWORD:-}"

if [[ "$DATABASE_URL" =~ postgresql://([^:]+):([^@]+)@([^:/]+):?([0-9]*)/([^/?]+) ]]; then
  DB_USER="${BASH_REMATCH[1]}"
  DB_PASSWORD="${BASH_REMATCH[2]}"
  DB_HOST="${BASH_REMATCH[3]}"
  DB_PORT="${BASH_REMATCH[4]:-5432}"
fi

echo "Restoring '$BACKUP_FILE' into database '$TARGET_DB'"

# Create target database (ignore error if exists)
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres \
  -c "CREATE DATABASE $TARGET_DB" 2>/dev/null || echo "Database $TARGET_DB already exists"

# Restore (decompress if needed)
if [[ "$BACKUP_FILE" == *.gz ]]; then
  gunzip -c "$BACKUP_FILE" | PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$TARGET_DB"
else
  PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$TARGET_DB" < "$BACKUP_FILE"
fi

echo "Restore complete into database: $TARGET_DB"
echo "Verify: PGPASSWORD=... psql -d $TARGET_DB -c 'select count(*) from \"User\";'"