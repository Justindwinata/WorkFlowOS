# WorkFlowOS - Contributing Guide

## Development Setup

1. Fork and clone the repository
2. Install dependencies: `npm install`
3. Copy environment files: `cp apps/api/.env.example apps/api/.env && cp apps/web/.env.example apps/web/.env`
4. Start services: `docker-compose up -d`
5. Run migrations: `cd apps/api && npx prisma migrate dev`
6. Start development: `npm run dev`

## Commit Guidelines

- Use conventional commit format: `type(scope): description`
- Types: feat, fix, docs, style, refactor, test, chore
- Example: `feat(auth): add JWT refresh token support`

## Pull Request Process

1. Create feature branch from `develop`
2. Write tests for new features
3. Ensure all tests pass: `npm run test`
4. Run linting: `npm run lint`
5. Update documentation if needed
6. Submit PR to `develop` branch

## Code Style

- TypeScript strict mode enabled
- ESLint + Prettier for formatting
- Run `npm run format` before committing

## Testing

- Backend: Jest unit tests in `__tests__` folders
- Frontend: Vitest for unit, Playwright for E2E
- Maintain 80%+ coverage for new code

## Branch Strategy

- `main` - Production releases
- `develop` - Integration branch
- `feature/*` - Feature development
- `fix/*` - Bug fixes
- `release/*` - Release preparation
