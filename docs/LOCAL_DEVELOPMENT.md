# WorkFlowOS - Local Development Guide

## Prerequisites

- Node.js 20+ and npm 9+
- PostgreSQL 15 (or Docker)
- Git

## Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/Justindwinata/WorkFlowOS.git
cd WorkFlowOS
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment

```bash
cp .env.example .env
```

Edit `.env` with your database URL and secrets:

```
DATABASE_URL="postgresql://workflowos:workflowos_dev@localhost:5432/workflowos"
REDIS_URL="redis://localhost:6379"
JWT_ACCESS_SECRET="dev-access-secret-change-in-production"
JWT_REFRESH_SECRET="dev-refresh-secret-change-in-production"
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

### 4. Start Infrastructure

```bash
docker-compose up -d
```

Verify containers are running:
```bash
docker-compose ps
```

### 5. Setup Database

```bash
cd apps/api
npx prisma migrate dev --name init
npx prisma db seed  # Optional: seed with demo data
```

### 6. Start Development Servers

**Terminal 1 - Backend API:**
```bash
cd apps/api
npm run dev
# API running at http://localhost:3001
# API docs at http://localhost:3001/api
```

**Terminal 2 - Frontend:**
```bash
cd apps/web
npm run dev
# Frontend running at http://localhost:3000
```

### 7. Access Application

- Frontend: http://localhost:3000
- API: http://localhost:3001
- API Documentation: http://localhost:3001/api

## Test Credentials

Default test user created during migration:

```
Email: test@example.com
Username: testuser
Password: TestPass123!
Role: Admin
```

## Available Commands

### Root Level

```bash
npm run dev          # Start all dev servers (turbo)
npm run build        # Build all apps
npm run test         # Run all tests
npm run lint         # Lint all apps
npm run clean        # Clean build artifacts
npm run format       # Format code with Prettier
```

### Backend (apps/api)

```bash
npm run dev          # Start dev server with watch
npm run build        # Build TypeScript
npm run start        # Start production build
npm run lint         # ESLint with auto-fix
npm run test         # Run Jest tests
npm run test:watch   # Run tests in watch mode
npm run test:cov     # Generate coverage report
```

### Frontend (apps/web)

```bash
npm run dev          # Start Next.js dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run Vitest
npm run test:ui      # Run tests with UI
npm run test:e2e     # Run Playwright E2E tests
```

## Database

### Migrations

Create new migration:
```bash
cd apps/api
npx prisma migrate dev --name add_new_feature
```

View database:
```bash
npx prisma studio
```

Reset database (development only):
```bash
npx prisma migrate reset
```

### Schema Changes

1. Edit `apps/api/prisma/schema.prisma`
2. Run `npx prisma migrate dev --name descriptive_name`
3. Prisma generates migration files and updates types

## Testing

### Backend Tests

```bash
cd apps/api
npm run test          # Run all tests once
npm run test:watch    # Run in watch mode
npm run test:cov      # Generate coverage report
```

Tests located in `src/**/__tests__/*.spec.ts`

### Frontend Tests

```bash
cd apps/web
npm run test          # Run Vitest
npm run test:ui       # Interactive test UI
npm run test:e2e      # Run Playwright E2E tests
```

## Debugging

### Backend

Add breakpoints in VS Code:

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Launch API",
      "program": "${workspaceFolder}/apps/api/node_modules/.bin/nest",
      "args": ["start", "--watch"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

### Frontend

Next.js debug in VS Code:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Launch Web",
  "program": "${workspaceFolder}/apps/web/node_modules/next/dist/bin/next",
  "args": ["dev"],
  "console": "integratedTerminal"
}
```

## Common Issues

### Port Already in Use

If port 3000 or 3001 is already in use:

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

### Database Connection Error

Check PostgreSQL is running:
```bash
docker-compose ps postgres
docker-compose logs postgres
```

Verify DATABASE_URL in .env

### Build Errors

Clear cache and reinstall:
```bash
npm run clean
rm -rf node_modules
npm install
npm run build
```

## Architecture Notes

- **Monorepo**: Uses npm workspaces and Turbo for build orchestration
- **Database**: Prisma ORM with PostgreSQL
- **API**: NestJS with modular architecture
- **Frontend**: Next.js 14 with App Router
- **Auth**: JWT-based with refresh tokens
- **Testing**: Jest (backend), Vitest (frontend), Playwright (E2E)

## Next Steps

1. Read [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) for detailed design
2. Read [AUTHENTICATION.md](./AUTHENTICATION.md) for auth implementation
3. Check API docs at http://localhost:3001/api
4. Explore test examples in `apps/api/src/**/__tests__/`
5. Review database schema at `apps/api/prisma/schema.prisma`

## Resources

- [NestJS Docs](https://docs.nestjs.com)
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [TypeScript Docs](https://www.typescriptlang.org/docs)
