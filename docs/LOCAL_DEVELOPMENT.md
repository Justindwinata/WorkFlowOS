# WorkFlowOS Local Development Setup

## Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Redis 7+

## Quick Start

```bash
# First-time setup (installs dependencies, runs migrations, seeds database)
make setup

# Or use npm directly
npm run setup

# Daily development
make dev

# Or use npm directly
npm run dev
```

## Manual Commands

```bash
# Install dependencies
npm ci

# Run database migrations
make db-migrate
# or
npm run db:migrate

# Seed database with demo data
make db-seed
# or
npm run db:seed

# Reset database and re-seed
make db-reset
# or
npm run db:reset

# Check migration status
make db-status
```

## Environment Variables

Copy `.env.example` to `.env` in `apps/api/`:

```bash
cp apps/api/.env.example apps/api/.env
```

Required variables:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_ACCESS_SECRET` - Secret for access tokens (min 32 chars in production)
- `JWT_REFRESH_SECRET` - Secret for refresh tokens (min 32 chars in production)
- `REDIS_URL` - Redis connection (optional, defaults to redis://localhost:6379)

## Running the Application

### Using Make (recommended)
```bash
make dev
```

### Using npm
```bash
npm run dev
```

This starts:
- API server on http://localhost:3001
- Web server on http://localhost:3000

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@workflowos.id | Admin123! |
| Manager | manager@workflowos.id | Admin123! |
| Member | user@workflowos.id | Admin123! |

## API Endpoints

- Health: `GET /health`
- Readiness: `GET /readiness`
- Startup: `GET /startup`
- API Documentation: `GET /api`

## Docker (Production)

```bash
docker compose -f docker-compose.prod.yml up -d
```

## Troubleshooting

### Database Connection Failed
```bash
# Check PostgreSQL is running
brew services start postgresql@15

# Check database exists
psql -U workflowos -h localhost -d workflowos -c "SELECT 1"
```

### Redis Connection Failed
```bash
# Check Redis is running
brew services start redis
redis-cli ping
```

### Port Already in Use
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```