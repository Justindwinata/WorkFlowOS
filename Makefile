.PHONY: help build dev test lint clean docker-up docker-down db-migrate db-seed

## WorkFlowOS Development Commands

help:
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@echo '  dev          Start development servers'
	@echo '  build        Build all applications'
	@echo '  test         Run all unit tests'
	@echo '  lint         Run linter across all packages'
	@echo '  format       Format code with Prettier'
	@echo '  clean        Clean build artifacts'
	@echo '  docker-up    Start Docker services'
	@echo '  docker-down  Stop Docker services'
	@echo '  db-migrate   Run database migrations'

dev:
	npm run dev

build:
	npm run build

test:
	npm run test

lint:
	npm run lint

format:
	npx prettier --write "**/*.{ts,tsx,md}"

clean:
	rm -rf apps/*/dist apps/*/.next packages/*/dist

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

db-migrate:
	cd apps/api && npx prisma migrate deploy
