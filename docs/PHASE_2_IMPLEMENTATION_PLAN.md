# Phase 2 Implementation Plan

## Overview

Phase 2 transforms the Phase 1 foundation into a production-ready application with:
- Stable Next.js build
- Complete frontend-backend integration
- Deterministic demo data
- Multi-workspace support
- Real SLA enforcement
- Real-time notifications
- Comprehensive testing

## Blockers from Phase 1

| Blocker | Impact | Resolution Strategy |
|---------|--------|---------------------|
| Next.js build fails on ARM64 (SWC napi panic) | Cannot verify frontend build locally | Upgrade Next.js to 14.2.x with fixed SWC, or use `next-swc` binary compatibility layer |
| Frontend pages are placeholders | No real functionality | Connect all pages to API via TanStack Query |
| No database seed | No demo data for testing | Create comprehensive seed script |
| Soft delete missing | Audit trail gaps | Add `deletedAt` to core entities |
| Single workspace | Multi-tenant not supported | Add workspace membership many-to-many |
| No real-time | Notifications are polling only | Add WebSocket/SSE for live updates |
| SLA is passive | No enforcement | Background job + escalation logic |
| No E2E tests | Cannot verify flows | Implement Playwright tests for critical paths |

## Phase 2 Goals (32 commits minimum)

### 1. Build Stability (Commits 1-2)
- **Commit 1**: Document audit and plan
- **Commit 2**: Fix Next.js ARM64 build

### 2. Data Foundation (Commits 3-4)
- **Commit 3**: Deterministic seed script
- **Commit 4**: Seed validation and reset workflow

### 3. Schema Evolution (Commits 5-7)
- **Commit 5**: Soft delete (`deletedAt`) on core entities
- **Commit 6**: Multi-workspace foundation (UserWorkspace pivot)
- **Commit 7**: Workspace-aware RBAC guards

### 4. Frontend Data Layer (Commits 8-9)
- **Commit 8**: TanStack Query client, hooks, cache invalidation
- **Commit 9**: Connect auth UI (login, register, refresh, logout, restore)

### 5. Module Integration (Commits 10-19)
- **Commit 10**: Users management UI
- **Commit 11**: Teams management UI
- **Commit 12**: Projects management UI
- **Commit 13**: Tasks workflow UI (CRUD + assign + status + labels + comments)
- **Commit 14**: Requests workflow UI
- **Commit 15**: Incidents workflow UI
- **Commit 16**: Approvals workflow UI
- **Commit 17**: SLA management UI
- **Commit 18**: Notifications UI
- **Commit 19**: Audit Log UI

### 6. Dashboard & Cross-Cutting (Commits 20-24)
- **Commit 20**: Live Dashboard from API data
- **Commit 21**: Global search (users, tasks, projects, requests, incidents)
- **Commit 22**: Global filters (workspace, team, status, priority, assignee, date)
- **Commit 23**: Standardized forms (React Hook Form + Zod)
- **Commit 24**: Loading/empty/error/success states everywhere

### 7. Advanced Features (Commits 25-27)
- **Commit 25**: Improve authorization UX (backend denies + frontend respects)
- **Commit 26**: SLA enforcement engine (background job + escalation)
- **Commit 27**: Real-time notification foundation (SSE chosen for simplicity)

### 8. Testing (Commits 28-29)
- **Commit 28**: Backend integration tests for critical workflows
- **Commit 29**: Playwright E2E tests for required flows

### 9. Manual QA & Documentation (Commits 30-32)
- **Commit 30**: Manual QA findings resolved
- **Commit 31**: Documentation updates
- **Commit 32**: Final validation report

## Technical Decisions

### Next.js Build Fix
- Upgrade to Next.js 14.2.30+ with fixed SWC
- If still failing: use `@next/swc-darwin-arm64` 14.x compatible version
- Add `experimental: { turbo: { resolveAlias: {...} } }` if needed

### Multi-Workspace
- Add `UserWorkspace` pivot table (userId, workspaceId, roleId)
- Keep `User.workspaceId` as "current workspace" for backward compat
- Add `currentWorkspaceId` to JWT payload
- Middleware to validate workspace membership

### Soft Delete
- Add `deletedAt` DateTime? to: User, Team, Project, Task, Request, Incident
- Add `@@index([deletedAt])`
- Default queries exclude `deletedAt != null`
- Prisma middleware for cascading soft deletes where appropriate

### SLA Enforcement
- Background job (BullMQ or native setInterval) checking every 30s
- On breach: create notification, escalate to team lead
- Track: `responseAt`, `resolvedAt`, `escalatedAt` on Incident/Request

### Real-Time Notifications
- **Choice**: Server-Sent Events (SSE) over WebSocket
- **Reason**: Simpler, works over HTTP/2, auto-reconnect, less infrastructure
- Endpoint: `/notifications/stream`
- Frontend: EventSource with reconnect logic

### E2E Testing
- Playwright with `webServer` for dev server
- Test data seeded before each test run
- Critical paths: auth, task CRUD, request approval, incident, SLA breach, notifications

## Commit Rules
- 32 minimum meaningful commits
- Push after every commit
- No force push
- Each commit = one logical engineering increment
- Conventional commit format: `type(scope): message`

## Validation Gates (per commit)

| Gate | Command |
|------|---------|
| Backend build | `cd apps/api && npm run build` |
| Backend tests | `cd apps/api && npm run test` |
| Backend lint | `cd apps/api && npm run lint` |
| Frontend build | `cd apps/web && npm run build` |
| Frontend tests | `cd apps/web && npm run test` |
| Frontend lint | `cd apps/web && npm run lint` |
| Database | `cd apps/api && npx prisma migrate dev` |
| E2E | `cd apps/web && npm run test:e2e` |

## Timeline Estimate

| Phase | Commits | Days |
|-------|---------|------|
| Build + Data Foundation | 4 | 1-2 |
| Schema + Multi-workspace | 3 | 1-2 |
| Frontend Data Layer | 2 | 1 |
| Module Integration | 10 | 3-4 |
| Dashboard + Cross-cutting | 5 | 2 |
| Advanced Features | 3 | 2 |
| Testing + QA + Docs | 5 | 2 |
| **Total** | **32** | **12-15** |

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Next.js build still fails | Use x86 CI runner for verification; document ARM64 limitation |
| Seed script complex | Start minimal, expand iteratively |
| Soft delete migrations | Test on copy of dev DB first |
| SSE reconnection issues | Use proven library (`eventsouce-parser`) |
| E2E flakiness | Retry logic, explicit waits, test isolation |

## Success Criteria

1. `npm run build` passes for both frontend and backend
2. All backend tests pass (unit + integration)
3. Frontend tests pass
4. E2E tests pass for all required flows
5. Database seed produces working demo
5. Manual QA checklist 100% pass
6. `git diff --check` clean
7. 32+ meaningful commits
8. `main` synced with `origin/main` (0 divergence)