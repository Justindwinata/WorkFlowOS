# WorkFlowOS - System Architecture

## Overview

WorkFlowOS is a monorepo-based enterprise work management platform built with a modern, scalable tech stack. The system follows clean architecture principles with clear separation of concerns across frontend, backend, and shared packages.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Browser                          │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Next.js Frontend (Port 3000)                   │
│  ├─ Authentication Pages (Login/Register)                  │
│  ├─ Dashboard & Navigation                                 │
│  ├─ Module Pages (Users, Teams, Projects, etc)            │
│  └─ Shared UI Components                                   │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP/REST
                           ▼
┌─────────────────────────────────────────────────────────────┐
│            NestJS Backend API (Port 3001)                   │
│  ├─ Auth Module (JWT, Register, Login, Refresh)           │
│  ├─ Users Module (CRUD, Roles)                            │
│  ├─ Teams Module (Create, Manage Members)                 │
│  ├─ Projects Module                                        │
│  ├─ Tasks Module (Create, Assign, Update Status)          │
│  ├─ Requests Module (Submit, Track Workflow)              │
│  ├─ Incidents Module (Create, Assign, Resolve)            │
│  ├─ Approvals Module (Request Review, Approve/Reject)     │
│  ├─ Notifications Module (In-app Notifications)           │
│  ├─ Audit Log Module (Activity Tracking)                  │
│  └─ RBAC Guards & Decorators                              │
└──────────────────────────┬──────────────────────────────────┘
                           │ SQL/Prisma
                           ▼
┌─────────────────────────────────────────────────────────────┐
│         PostgreSQL Database                                 │
│  ├─ Users, Roles, Permissions                              │
│  ├─ Workspaces, Teams, TeamMembers                         │
│  ├─ Projects, Tasks, TaskAssignments                       │
│  ├─ Requests, Incidents, Approvals                         │
│  ├─ Notifications, AuditLogs                               │
│  └─ SLA Configuration                                       │
└─────────────────────────────────────────────────────────────┘
```

## Monorepo Structure

```
WorkFlowOS/
├── apps/
│   ├── web/                          # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/                  # Next.js app directory
│   │   │   │   ├── (auth)/           # Auth pages
│   │   │   │   ├── (dashboard)/      # Dashboard pages
│   │   │   │   └── layout.tsx
│   │   │   ├── components/
│   │   │   │   ├── layout/           # DashboardLayout, Sidebar, Topbar
│   │   │   │   ├── ui/               # UI components (Input, Button, Card)
│   │   │   │   ├── auth/             # AuthProvider
│   │   │   │   └── dashboard/        # Dashboard components
│   │   │   ├── hooks/
│   │   │   │   └── useAuth.ts        # Auth hook
│   │   │   ├── lib/
│   │   │   │   ├── auth-store.ts     # Zustand auth store
│   │   │   │   └── api-client.ts     # Axios API client
│   │   │   └── e2e/                  # Playwright E2E tests
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── tailwind.config.ts
│   │   └── next.config.mjs
│   │
│   └── api/                          # NestJS backend
│       ├── src/
│       │   ├── main.ts               # Entry point
│       │   ├── app.module.ts         # Root module
│       │   ├── auth/
│       │   │   ├── auth.controller.ts
│       │   │   ├── auth.service.ts
│       │   │   ├── token.service.ts
│       │   │   ├── auth.module.ts
│       │   │   ├── strategies/       # JWT strategy
│       │   │   ├── dto/              # DTOs
│       │   │   └── __tests__/        # Unit tests
│       │   ├── users/                # Users module
│       │   ├── teams/                # Teams module
│       │   ├── projects/             # Projects module
│       │   ├── tasks/                # Tasks module
│       │   ├── requests/             # Requests module
│       │   ├── incidents/            # Incidents module
│       │   ├── approvals/            # Approvals module
│       │   ├── notifications/        # Notifications module
│       │   ├── audit-log/            # Audit Log module
│       │   ├── prisma/               # Prisma service & module
│       │   └── common/
│       │       ├── decorators/       # @CurrentUser, @RequirePermissions
│       │       ├── guards/           # JwtAuthGuard, PermissionsGuard
│       │       └── filters/          # Exception filters
│       ├── prisma/
│       │   └── schema.prisma         # Database schema
│       ├── package.json
│       ├── tsconfig.json
│       ├── jest.config.js
│       └── .eslintrc.json
│
├── packages/
│   ├── ui/                           # Shared UI components
│   │   ├── src/
│   │   │   ├── components/           # Button, Card, etc
│   │   │   ├── lib/                  # Utilities (cn)
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── types/                        # Shared TypeScript types
│   │   ├── src/
│   │   │   └── index.ts              # User, Task, Request types
│   │   └── package.json
│   │
│   └── config/                       # Shared config
│       ├── src/
│       │   └── index.ts              # API_BASE_URL, ROUTES
│       └── package.json
│
├── docker-compose.yml                # PostgreSQL + Redis
├── .github/workflows/ci.yml          # GitHub Actions CI
├── .env.example
├── .gitignore
├── .prettierrc
├── turbo.json                        # Turbo configuration
├── package.json
└── README.md
```

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router, SSR/SSG)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: Zustand (auth) + TanStack Query (server state)
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios with JWT interceptors
- **Testing**: Vitest + Playwright E2E
- **Build**: Next.js bundler + ESLint

### Backend
- **Framework**: NestJS 10
- **Language**: TypeScript
- **Database**: PostgreSQL 15
- **ORM**: Prisma
- **Authentication**: JWT (Access + Refresh tokens)
- **Authorization**: RBAC with Guards & Decorators
- **API Docs**: OpenAPI/Swagger
- **Testing**: Jest
- **Linting**: ESLint

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Database**: PostgreSQL 15 (container)
- **Cache**: Redis 7 (container)
- **CI/CD**: GitHub Actions

### Monorepo
- **Workspace Manager**: npm workspaces
- **Build Orchestration**: Turbo
- **Code Formatting**: Prettier

## Key Design Patterns

### Backend

#### Layered Architecture
```
Controller (Request/Response)
    ↓
Service (Business Logic)
    ↓
Repository (Data Access)
    ↓
Database
```

#### Module-Based Organization
- Each feature (Auth, Users, Teams, etc) is a self-contained NestJS module
- Modules export services for consumption by other modules
- Clean dependencies with explicit imports

#### RBAC Implementation
- **Guards**: `JwtAuthGuard` (validate token), `PermissionsGuard` (check permissions)
- **Decorators**: `@CurrentUser()` (inject user), `@RequirePermissions()` (specify required permissions)
- Authorization happens at controller level before business logic

#### DTOs & Validation
- Data Transfer Objects define request/response shapes
- Class-validator decorators for input validation
- Zod for frontend validation

### Frontend

#### Store Pattern (Zustand)
- `useAuthStore`: Centralized auth state (user, tokens, login/logout)
- Server state managed by TanStack Query
- Minimal client state

#### API Client with Interceptors
- Centralized Axios instance in `api-client.ts`
- Request interceptor adds JWT token to Authorization header
- Response interceptor handles token refresh on 401

#### Protected Routes
- `DashboardLayout` checks `isAuthenticated` and redirects to login
- `useAuth()` hook provides auth context to components

## Data Models

### Core Entities

**User**
- id, email, username, password (hashed)
- firstName, lastName, avatar, status
- Relationships: role, workspace, teams, tasks, requests, approvals, notifications

**Role**
- id, name, description
- Relationships: permissions, users

**Permission**
- id, name (e.g., "manage_users", "admin")
- Relationships: roles

**Workspace**
- id, name, slug, logo
- Relationships: users, teams, projects

**Team**
- id, name, description, workspace
- Relationships: members, projects

**Project**
- id, name, description, status, team, workspace
- Relationships: tasks

**Task**
- id, title, description, status, priority, dueDate
- Relationships: project, creator, assignments, comments, labels

**Request**
- id, title, description, type, status, priority
- Relationships: requester, approvals

**Incident**
- id, title, description, severity, priority, status
- Relationships: assignee

**Approval**
- id, status, comment
- Relationships: request, approver

**Notification**
- id, title, message, type, read
- Relationships: user

**AuditLog**
- id, action, entity, entityId, timestamp
- Relationships: actor

## Authentication Flow

```
1. User submits credentials
2. Backend validates and returns JWT + refresh token
3. Frontend stores tokens in localStorage
4. Axios request interceptor adds "Authorization: Bearer {token}" header
5. Backend validates JWT in JwtAuthGuard
6. User object injected via @CurrentUser() decorator
7. PermissionsGuard checks if user has required permissions
8. Controller/Service processes request
9. On 401, response interceptor refreshes token and retries request
```

## API Endpoints

### Auth
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh access token
- `GET /auth/me` - Get current user

### Users
- `GET /users` - List all users
- `POST /users` - Create user
- `GET /users/:id` - Get user detail
- `PATCH /users/:id` - Update user
- `PATCH /users/:id/role` - Update user role
- `DELETE /users/:id` - Delete user

### Teams
- `POST /teams` - Create team
- `GET /teams` - List teams
- `PATCH /teams/:id` - Update team
- `POST /teams/:id/members` - Add member
- `DELETE /teams/:id/members/:userId` - Remove member
- `DELETE /teams/:id` - Delete team

### Projects, Tasks, Requests, Incidents, Approvals
- Similar CRUD patterns with domain-specific operations

## Security Considerations

1. **Password Hashing**: bcryptjs with 10 salt rounds
2. **JWT Tokens**: 
   - Access token: 15 minutes expiration
   - Refresh token: 7 days expiration
3. **RBAC**: Fine-grained permissions checked at controller level
4. **Input Validation**: DTOs with class-validator on backend, Zod on frontend
5. **CORS**: Configured in NestJS
6. **Environment Variables**: Secrets in .env (never committed)
7. **SQL Injection**: Parameterized queries via Prisma ORM

## Performance Optimizations

1. **Database Indexes**: Created on foreign keys and frequently queried fields
2. **Query Optimization**: Selective includes in Prisma queries
3. **Pagination**: Ready for frontend implementation
4. **Caching**: Redis available for future session/rate-limit storage
5. **Code Splitting**: Next.js automatic code splitting per route
6. **Tree Shaking**: Unused code eliminated in production builds

## Testing Strategy

### Backend
- Unit tests for services (Approvals, Tasks, Auth)
- Unit tests for guards (PermissionsGuard)
- Jest with mocked Prisma
- Current coverage: 13 tests passing

### Frontend
- Component tests with Vitest (structure in place)
- E2E tests with Playwright (configured)
- Not yet implemented, ready for expansion

## Deployment Readiness

- Docker Compose configuration for local development
- GitHub Actions CI pipeline runs on push
- Environment variables documented in .env.example
- Database migrations via Prisma
- No hardcoded secrets or credentials
