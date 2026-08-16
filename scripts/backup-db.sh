#!/usr/bin/env bash
set -euo pipefail

# WorkFlowOS - Database Backup Script
# Usage: ./scripts/backup-db.sh [output_dir]
# Creates a timestamped PostgreSQL dump in output_dir (default: ./backups)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

# Load DATABASE_URL if .env exists
if [ -f "$ROOT_DIR/.env" ]; then
  set -a
  # shellcheck source=/dev/null
  source "$ROOT_DIR/.env"
  set +a
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: DATABASE_URL not set" >&2
  exit 1
fi

# Parse DATABASE_URL (postgresql://user:pass@host:port/db)
DB_USER="${DB_USER:-workflowos}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-workflowos}"
DB_PASSWORD="${DB_PASSWORD:-}"

# Allow override via DATABASE_URL components
if [[ "$DATABASE_URL" =~ postgresql://([^:]+):([^@]+)@([^:/]+):?([0-9]*)/([^/?]+) ]]; then
  DB_USER="${BASH_REMATCH[1]}"
  DB_PASSWORD="${BASH_REMATCH[2]}"
  DB_HOST="${BASH_REMATCH[3]}"
  DB_PORT="${BASH_REMATCH[4]:-5432}"
  DB_NAME="${BASH_REMATCH[5]}"
fi

OUTPUT_DIR="${1:-$ROOT_DIR/backups}"
mkdir -p "$OUTPUT_DIR"

TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
BACKUP_FILE="$OUTPUT_DIR/workflowos_$TIMESTAMP.sql"
GZIP_FILE="$BACKUP_FILE.gz"

echo "Backing up database '$DB_NAME' @ $DB_HOST:$DB_PORT"

if command -v pg_dump >/dev/null 2>&1; then
  PGPASSWORD="$DB_PASSWORD" pg_dump \
    -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
    --clean --if-exists --no-owner | gzip > "$GZIP_FILE"
elif command -v docker >/dev/null 2>&1; then
  # Fallback: dump via running postgres container
  docker exec workflowos-postgres pg_dump \
    -U "$DB_USER" -d "$DB_NAME" \
    --clean --if-exists --no-owner | gzip > "$GZIP_FILE"
else
  echo "ERROR: pg_dump not found and no Docker fallback" >&2
  exit 1
fi

SIZE=$(du -h "$GZIP_FILE" | cut -f1)
echo "Backup created: $GZIP_FILE ($SIZE)"

# Write a metadata sidecar
cat > "$GZIP_FILE.meta" <<EOF
created_at: $TIMESTAMP
database: $DB_NAME
file: $(basename "$GZIP_FILE")
size: $SIZE
EOF

# Keep only last N backups (default 14)
KEEP="${BACKUP_RETENTION:-14}"
COUNT=$(ls "$OUTPUT_DIR"/workflowos_*.sql.gz 2>/dev/null | wc -l | tr -d ' ')
if [ "$COUNT" -gt "$KEEP" ]; then
  ls -t "$OUTPUT_DIR"/workflowos_*.sql.gz | tail -n +$((KEEP + 1)) | xargs rm -f
  echo "Pruned old backups, keeping last $KEEP"
fi

echo "Backup complete"