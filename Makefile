.PHONY: help setup dev dev-api dev-web build test lint format clean docker-up docker-down docker-ps db-migrate db-seed db-reset db-status health doctor

## WorkFlowOS Development Commands

help:
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Setup & Health:'
	@echo '  setup        First-time setup (install, migrations, seed)'
	@echo '  doctor       Check PostgreSQL and Redis readiness'
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
	@echo '  health       Check API/Web health endpoints'
	@echo ''
	@echo 'Build & Test:'
	@echo '  build        Build all applications'
	@echo '  test         Run all unit tests'
	@echo '  lint         Run linter across all packages'
	@echo '  format       Format code with Prettier'
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
	npm run setup

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
	npm run dev

dev-api:
	npm run dev:api

dev-web:
	npm run dev:web

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