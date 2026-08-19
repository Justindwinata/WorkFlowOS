# WorkFlowOS

Enterprise Work Management & Service Operations Platform

## Overview

WorkFlowOS is a comprehensive enterprise platform designed to centralize company work, tasks, requests, incidents, approvals, workflows, SLA monitoring, notifications, and audit activities.

## Current Status

Release Candidate - Enterprise work management platform with:

- Monorepo architecture (Next.js + NestJS)
- PostgreSQL + Prisma ORM
- JWT Authentication + Refresh tokens + TOTP 2FA
- RBAC (Admin / Manager / Member / Viewer)
- Multi-workspace isolation
- Soft delete for core entities
- SLA enforcement engine + business calendar
- Real-time notifications (SSE)
- TanStack Query data layer
- Complete frontend modules
- Live dashboard, global search, filters, pagination
- 232 automated tests (154 backend + 78 frontend)
- Playwright E2E configured (Chromium, Firefox, WebKit)
- Health/Readiness/Startup probes
- Structured logging + security headers + CORS + rate limiting
- Production Dockerfiles + staging config

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui-style components
- React Hook Form + Zod
- TanStack Query
- Zustand (auth state)
- Axios with JWT interceptors + 401 refresh retry
- Vitest (unit) + Playwright (E2E)

### Backend
- NestJS 10
- TypeScript
- PostgreSQL 15
- Prisma ORM (deploy migrations, deterministic seed)
- JWT (access 15m + refresh 7d, httpOnly cookie)
- TOTP (speakeasy, QR enrollment)
- RBAC + workspace-isolation guards
- Per-user throttling (60 req/min default)
- Helmet + CORS + structured logging
- Jest

### Infrastructure
- Docker Compose (PostgreSQL, Redis)
- GitHub Actions CI (lint, typecheck, tests, build, Docker config)
- Turbo monorepo
- Vercel (web) + standalone API container

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL 15+ running locally (or Docker)
- Redis 7+ running locally (or Docker)
- npm 9+

### Quick Start (Recommended)

```bash
# Clone
git clone https://github.com/Justindwinata/WorkFlowOS.git
cd WorkFlowOS

# First-time setup: install deps, run migrations, seed
make setup

# Daily development: start API + Web with health-check orchestration
make dev
```

`make setup` is idempotent and safe to re-run; it ensures dependencies are installed,
the database is migrated, and seed data is present.

`make dev` starts the API on `:3001` and Web on `:3000`, waits for the API
`/health` endpoint, then launches the web server.

### Access

- Frontend: http://localhost:3000
- API:      http://localhost:3001
- API Docs: http://localhost:3001/api
- Health:   http://localhost:3001/health
- Readiness: http://localhost:3001/readiness

### Default Credentials (seeded)

```
Email:    admin@workflowos.id
Username: admin
Password: Admin123!
Role:     Admin
```

A second workspace (Beta Corp) and additional users are seeded to exercise
multi-workspace isolation and RBAC.

### Manual Setup (without `make`)

```bash
npm ci
cp apps/api/.env.example apps/api/.env  # if not already present
cd apps/api && npx prisma migrate deploy && npm run seed
cd ../.. && npm run dev
```

## Project Structure

```
WorkFlowOS/
├── apps/
│   ├── web/                    # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/            # Next.js App Router
│   │   │   │   ├── (auth)/     # Login/Register
│   │   │   │   └── (dashboard)/# Protected dashboard pages
│   │   │   ├── components/     # UI components
│   │   │   ├── hooks/          # Custom hooks
│   │   │   ├── lib/            # API client, auth store, query client
│   │   │   └── e2e/            # Playwright tests
│   │   └── ...
│   │
│   └── api/                     # NestJS backend
│       ├── src/
│       │   ├── auth/           # Authentication module
│       │   ├── users/          # Users management
│       │   ├── teams/          # Teams management
│       │   ├── projects/       # Projects management
│       │   ├── tasks/          # Tasks workflow
│       │   ├── requests/       # Internal requests
│       │   ├── incidents/      # Incident management
│       │   ├── approvals/      # Approval workflow
│       │   ├── sla/            # SLA definitions + enforcement
│       │   ├── notifications/  # Notifications + SSE
│       │   ├── audit-log/      # Audit trail
│       │   ├── workspaces/     # Multi-workspace
│       │   ├── dashboard/      # Dashboard API
│       │   ├── common/         # Guards, decorators, filters
│       │   └── prisma/         # Prisma service
│       └── prisma/
│           ├── schema.prisma   # Database schema
│           ├── seed.ts         # Seed script
│           └── migrations/
│
├── packages/
│   ├── ui/                     # Shared UI components
│   ├── config/                 # Shared config
│   └── types/                  # Shared TypeScript types
│
├── docker-compose.yml
├── turbo.json
├── package.json
��── README.md
```

## Features

### Core Modules

| Module | Description |
|--------|-------------|
| **Dashboard** | Live stats, my tasks, team workload, SLA risk, recent activity |
| **Users** | CRUD, roles, permissions, workspace membership |
| **Teams** | Team CRUD, member management |
| **Projects** | Project CRUD, task containers |
| **Tasks** | CRUD, assign, status (backlog→todo→in_progress→review→done), priority, labels, comments |
| **Requests** | Internal requests (IT, HR, Finance), approval workflow |
| **Incidents** | Severity/priority, assignment, SLA tracking |
| **Approvals** | Pending approvals, approve/reject/request changes |
| **SLA** | Definitions (Critical/High/Medium/Low), breach checking, enforcement engine |
| **Notifications** | In-app + SSE real-time, mark read, types (task, approval, SLA, incident) |
| **Audit Log** | Full activity trail (create, update, delete, login, etc.) |
| **Settings** | Profile, notifications, appearance, security |

### Security
- JWT with 15min access / 7d refresh tokens
- bcrypt password hashing (10 rounds)
- RBAC with granular permissions
- Workspace isolation
- Rate limiting (60 req/min)
- Helmet security headers
- CORS configuration

### SLA Enforcement
- Background job (60s interval)
- Severity-based tiers (Critical/High/Medium/Low)
- Warning thresholds + breach detection
- Automatic escalation
- Real-time notifications

### Real-time Notifications
- Server-Sent Events (SSE)
- Unread count streaming
- Automatic reconnection

## Development

### Commands

```bash
# Root level (via turbo)
make dev           # Start API + Web with health checks (recommended)
make setup         # First-time install + migrate + seed
npm run dev        # Start all dev servers (alias for make dev)
npm run build      # Build all apps
npm run test       # Run all unit tests (232 tests)
npm run lint       # Lint all apps
npm run format     # Format with Prettier
npm run clean      # Clean build artifacts

# Database
make db-migrate    # Run migrations (npx prisma migrate deploy)
make db-seed       # Seed database
make db-reset      # Reset DB + migrate + seed
make db-status     # Check migration status

# API
cd apps/api
npm run dev        # Dev server with watch
npm run build      # Build
npm run test       # Unit tests (154 tests)
npm run test:watch # Watch mode
npm run test:cov   # Coverage
npm run lint       # ESLint
npm run seed       # Seed database
npm run seed:validate # Validate seed

# Web
cd apps/web
npm run dev        # Next.js dev server
npm run build      # Production build
npm run test       # Vitest (78 tests)
npm run test:e2e   # Playwright E2E
npm run lint       # ESLint
```

### Database Commands
```bash
cd apps/api
npx prisma migrate dev --name migration_name
npx prisma studio
npx prisma generate
npx prisma migrate deploy
```

## Testing

### Backend
```bash
cd apps/api
npm run test         # 18 unit tests passing
npm run test:cov     # Coverage report
```

### Frontend
```bash
cd apps/web
npm run test         # Vitest
npm run test:e2e     # Playwright E2E
```

## API Documentation

Interactive Swagger UI at `http://localhost:3001/api`

### Main Endpoints

| Module | Endpoints |
|--------|-----------|
| Auth | `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `GET /auth/me` |
| Users | `GET/POST /users`, `GET/PATCH/DELETE /users/:id`, `PATCH /users/:id/role` |
| Teams | `GET/POST /teams`, `PATCH/DELETE /teams/:id`, `POST/DELETE /teams/:id/members` |
| Projects | `GET/POST /projects`, `GET/PATCH/DELETE /projects/:id` |
| Tasks | `GET/POST /tasks`, `GET/PATCH/DELETE /tasks/:id`, `POST /tasks/:id/assign` |
| Requests | `GET/POST /requests`, `GET/PATCH/DELETE /requests/:id`, `PATCH /requests/:id/status` |
| Incidents | `GET/POST /incidents`, `GET/PATCH/DELETE /incidents/:id`, `POST /incidents/:id/assign` |
| Approvals | `GET /approvals`, `GET /approvals/pending`, `PATCH /approvals/:id` |
| SLA | `GET/POST /sla`, `GET /sla/:name/check` |
| Notifications | `GET /notifications`, `GET /notifications/unread`, `PATCH /notifications/:id/read`, `GET /notifications/stream` (SSE) |
| Audit Log | `GET /audit-log`, `GET /audit-log/entity/:entity/:entityId` |
| Workspaces | `GET /workspaces`, `POST /workspaces/switch` |
| Dashboard | `GET /dashboard` |

## Documentation

- [System Architecture](docs/SYSTEM_ARCHITECTURE.md)
- [Authentication](docs/AUTHENTICATION.md)
- [Authorization](docs/AUTHORIZATION.md)
- [Database ERD](docs/ERD.md)
- [API Reference](docs/API_REFERENCE.md)
- [Local Development](docs/LOCAL_DEVELOPMENT.md)
- [Testing](docs/TESTING.md)
- [SLA Management](docs/SLA.md)
- [Workspace Model](docs/WORKSPACE_MODEL.md)
- [E2E Testing](docs/E2E_TESTING.md)
- [Known Limitations](docs/KNOWN_LIMITATIONS.md)

## Known Limitations

See [KNOWN_LIMITATIONS.md](docs/KNOWN_LIMITATIONS.md)

## Deployment

### Docker (Production)
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Vercel (Frontend) + Railway/Render (Backend)
- Configure environment variables
- Connect PostgreSQL database
- Set JWT secrets

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)

## Security

See [SECURITY.md](SECURITY.md)

## License

MIT

## Repository

https://github.com/Justindwinata/WorkFlowOS.git