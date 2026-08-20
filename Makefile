.PHONY: help setup env dev stop dev-api dev-web build test lint format clean docker-up docker-down docker-ps db-migrate db-seed db-reset db-status health doctor validate

## WorkFlowOS Development Commands

help:
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Setup & Health:'
	@echo '  setup        First-time setup (install, migrations, seed)'
	@echo '  env          Initialize local environment file'
	@echo '  doctor       Check PostgreSQL, Redis, Node, and environment'
	@echo '  health       Check API/Web health endpoints'
	@echo '  db-migrate   Run database migrations'
	@echo '  db-seed      Run database seed'
	@echo '  db-reset     Reset database and re-seed'
	@echo '  db-status    Check database migration status'
	@echo ''
	@echo 'Development:'
	@echo '  dev          Start API + Web servers with health checks'
	@echo '  dev-api      Start only API server'
	@echo '  dev-web      Start only Web server'
	@echo '  stop         Stop all dev processes cleanly'
	@echo ''
	@echo 'Build & Test:'
	@echo '  build        Build all applications'
	@echo '  test         Run all unit tests'
	@echo '  lint         Run linter across all packages'
	@echo '  format       Format code with Prettier'
	@echo '  validate     Validate env, build, and run tests'
	@echo ''
	@echo 'Docker:'
	@echo '  docker-up    Start Docker services (Postgres, Redis)'
	@echo '  docker-down  Stop Docker services'
	@echo '  docker-ps    Show Docker service status'
	@echo ''
	@echo 'Cleanup:'
	@echo '  clean        Clean build artifacts'

# === Setup ===

setup:
	@echo "🚀 Running first-time setup..."
	node scripts/ensure-env.js
	@make doctor
	npm ci
	@echo "🗄️  Running database migrations..."
	cd apps/api && npx prisma generate && npx prisma migrate deploy
	@echo "🌱  Seeding database..."
	cd apps/api && npm run seed
	@echo "\n✨ WorkFlowOS setup complete!"
	@echo '   Run "make dev" to start development servers.'

db-migrate:
	@echo "🗄️  Running database migrations..."
	npm run db:migrate

db-seed:
	@echo "🌱  Seeding database..."
	npm run db:seed

db-reset:
	@echo "🔄  Resetting database..."
	npm run db:reset

db-status:
	@echo "📊  Checking migration status..."
	cd apps/api && npx prisma migrate status

# === Development ===

dev:
	@echo "🚀 Starting WorkFlowOS development servers..."
	node scripts/dev.js

env:
	@echo "🔧 Initializing local environment file..."
	node scripts/ensure-env.js
	@echo "🔍 Validating environment..."
	node scripts/validate-env.js

dev-api:
	npm run dev:api

dev-web:
	npm run dev:web

stop:
	@echo "🛑 Stopping WorkFlowOS dev processes..."
	@pkill -f "npm run start:dev" 2>/dev/null && echo "  ✅ API stopped" || echo "  ℹ️  API not running"
	@pkill -f "next dev" 2>/dev/null && echo "  ✅ Web stopped" || echo "  ℹ️  Web not running"
	@pkill -f "node scripts/dev.js" 2>/dev/null && echo "  ✅ Orchestrator stopped" || echo "  ℹ️  Orchestrator not running"
	@lsof -ti:3001 | xargs kill -9 2>/dev/null && echo "  ✅ Port 3001 freed" || true
	@lsof -ti:3000 | xargs kill -9 2>/dev/null && echo "  ✅ Port 3000 freed" || true
	@rm -f scripts/.dev.lock
	@echo "✅ All WorkFlowOS processes stopped"

health:
	@echo "🏥  Checking API health..."
	@curl -sf http://localhost:3001/health | jq . || echo "❌ API not healthy"
	@echo "🏥  Checking Web..."
	@curl -sf http://localhost:3000/health | jq . || echo "❌ Web not healthy"

doctor:
	@echo "🔍 Checking local infrastructure readiness..."
	@command -v pg_isready >/dev/null 2>&1 || { echo "❌ pg_isready not found (brew install postgresql@15)"; exit 1; }
	@command -v redis-cli >/dev/null 2>&1 || { echo "❌ redis-cli not found (brew install redis)"; exit 1; }
	@pg_isready -h localhost -p 5432 >/dev/null 2>&1 && echo "✅ PostgreSQL ready (localhost:5432)" || { echo "❌ PostgreSQL not ready — brew services start postgresql@15"; exit 1; }
	@redis-cli ping 2>/dev/null | grep -q PONG && echo "✅ Redis ready (localhost:6379)" || { echo "❌ Redis not ready — brew services start redis"; exit 1; }
	@command -v node >/dev/null 2>&1 || { echo "❌ Node.js not found (install Node 20+)"; exit 1; }
	@node -v 2>/dev/null | grep -qE '^v(2[0-9]|[3-9][0-9])' || { echo "❌ Node.js 20+ required (current: $$(node -v))"; exit 1; }
	@node scripts/validate-env.js --strict
	@echo ""

# === Build & Test ===

build:
	npm run build

test:
	npm run test

lint:
	npm run lint

format:
	npm run format

# === Docker ===

docker-up:
	@echo "🐳 Starting PostgreSQL and Redis..."
	docker compose up -d
	@echo "⏳ Waiting for services to be healthy..."
	@sleep 5
	@docker compose ps

docker-down:
	docker compose down

docker-ps:
	docker compose ps

# === Cleanup ===

clean:
	rm -rf apps/*/dist apps/*/.next packages/*/dist node_modules