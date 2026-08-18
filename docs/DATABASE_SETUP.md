# WorkFlowOS Database Setup

## PostgreSQL Setup

### macOS (Homebrew)
```bash
# Install PostgreSQL 15
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Create database and user
psql postgres -c "CREATE USER workflowos WITH PASSWORD 'workflowos_dev';"
psql postgres -c "CREATE DATABASE workflowos OWNER workflowos;"
psql postgres -c "ALTER ROLE workflowos CREATEDB;"
```

### Ubuntu/Debian
```bash
sudo apt update && sudo apt install postgresql-15 postgresql-client-15

sudo -u postgres psql -c "CREATE USER workflowos WITH PASSWORD 'workflowos_dev';"
sudo -u postgres psql -c "CREATE DATABASE workflowos OWNER workflowos;"
sudo -u postgres psql -c "ALTER ROLE workflowos CREATEDB;"
```

### Docker
```bash
docker run -d \
  --name workflowos-postgres \
  -e POSTGRES_USER=workflowos \
  -e POSTGRES_PASSWORD=workflowos_dev \
  -e POSTGRES_DB=workflowos \
  -p 5432:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:15-alpine
```

## Redis Setup

### macOS (Homebrew)
```bash
brew install redis
brew services start redis
```

### Ubuntu/Debian
```bash
sudo apt install redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

### Docker
```bash
docker run -d \
  --name workflowos-redis \
  -p 6379:6379 \
  -v redis_data:/data \
  redis:7-alpine
```

## Database Initialization

```bash
# Run migrations
cd apps/api
npx prisma migrate deploy

# Seed database
npm run seed
```

## Verification

```bash
# Check database connectivity
psql -U workflowos -h localhost -d workflowos -c "SELECT 1"

# Check migrations
cd apps/api && npx prisma migrate status

# Check tables
psql -U workflowos -h localhost -d workflowos -c "\dt"
```