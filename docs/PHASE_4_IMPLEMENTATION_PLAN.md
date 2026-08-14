# Phase 4 Implementation Plan

## Overview

Phase 4 focuses on production hardening, UI/UX refinement using the approved Stitch design, comprehensive testing, and deployment validation. This phase transforms the deploy-ready prototype into a production-ready enterprise application.

## Baseline (Phase 3 Completion)

- **HEAD**: dc8d30a
- **Commits**: 53
- **Status**: Deploy-ready prototype with known ARM64 build limitation
- **Known Issues**: Next.js production build fails on ARM64 due to SWC napi panic

## Phase 4 Objectives

1. **Production Build Stability** - Fix ARM64 build, pin versions, reproducible environment
2. **Frontend Quality** - Component testing, E2E execution, visual QA
3. **UI/UX Refinement** - Align with Stitch design, accessibility, responsive, cross-browser
4. **Security Hardening** - JWT lifecycle, RBAC, workspace isolation, input validation
5. **Observability** - Health endpoints, structured logging, SLA reliability
5. **Deployment Validation** - Docker, CI/CD, manual QA, documentation

## Phase 4 Commit Plan (38 Commits)

| # | Commit | Description |
|---|--------|-------------|
| 01 | docs: audit phase 4 production gaps | Create implementation plan |
| 02 | fix: resolve nextjs production build | Fix ARM64 SWC issue |
| 03 | chore: pin frontend toolchain versions | Lock Next.js, Node, Turbo versions |
| 04 | test: establish frontend component testing | Vitest foundation |
| 05 | test: add authentication component tests | Login, register, session restore |
| 06 | test: add task component tests | Create, edit, assign, status, priority |
| 07 | test: add request incident component tests | Request/Incident forms |
| 08 | test: add dashboard component tests | Loading, empty, error, permission states |
| 09 | test: add approval sla component tests | Approval workflow, SLA cards |
| 10 | test: add management component tests | Users, teams, notifications, audit log |
| 10 | test: execute workflowos e2e suite | Run Playwright suite |
| 11 | test: expand workflowos e2e workflows | Full user journeys |
| 11 | test: add e2e debugging artifacts | Screenshots, videos, traces |
| 11 | ci: add workflowos browser e2e | GitHub Actions with Playwright |
| 12 | fix: harden authentication lifecycle | JWT, refresh, rotation, 401 handling |
| 12 | security: harden authentication security | Password, rate limit, CORS, validation |
| 12 | test: expand rbac regression coverage | Admin, Manager, Member, Viewer |
| 12 | test: verify workspace isolation | Cross-workspace data isolation |
| 12 | feat: improve multi workspace seed data | Multi-workspace role seeding |
| 12 | fix: harden database transactions | Prisma transactions, rollback |
| 12 | feat: add sla business hours | Working days, hours, timezone, holidays |
| 12 | test: add sla escalation coverage | SLA breach, warning, escalation |
| 12 | fix: harden realtime notifications | SSE reconnect, dedup, read/unread |
| 12 | feat: add service health endpoints | /health, /readiness |
| 12 | feat: add structured api logging | Request ID, user, route, duration |
| 12 | fix: improve frontend runtime recovery | Error boundary, retry UX |
| 12 | perf: optimize frontend data fetching | TanStack Query cache, dedup |
| 12 | perf: optimize workflowos database queries | Prisma indexes, query optimization |
| 12 | style: align frontend with stitch source | Visual QA against UIDESIGN |
| 12 | fix: improve workflowos accessibility | WCAG, keyboard, ARIA, contrast |
| 12 | style: harden responsive experience | 1440, 1280, 1024, 768, 430, 390, 375 |
| 12 | test: verify cross browser compatibility | Chrome, Safari, Firefox |
| 12 | docs: complete phase 4 manual qa | Full manual QA checklist |
| 12 | fix: resolve phase 4 qa findings | Fix all findings |
| 12 | ci: validate workflowos docker stack | Docker compose build/up |
| 12 | fix: stabilize final release build | All builds pass |
| 12 | docs: document production readiness | Security, deployment, observability |
| 12 | docs: finalize phase 4 validation | Final validation report |

## Known Limitations (Phase 3 Carryover)

1. **Next.js ARM64 Build**: Production build fails on ARM64 due to SWC napi panic
2. **Frontend Tests**: Vitest configured but no component tests implemented
3. **E2E Tests**: Playwright configured but not executed
4. **Docker**: Not available locally for validation
5. **Soft Delete**: Not implemented on all entities (Approval, Notification, AuditLog)
6. **Multi-workspace**: No seed for multi-workspace roles
6. **SLA**: No business hours/calendar support
7. **Notifications**: No email/SMS channels
8. **Email**: No email notifications

## Validation Gates

Each commit must pass:
- Backend: `npm test`, `npm run lint`, `npm run build`
- Frontend: `npm test`, `npm run lint`, `npm run build` (when fixed)
- E2E: `npm run test:e2e`
- Database: `npx prisma generate`, `npx prisma migrate`, `npx prisma db seed`
- Git: `git diff --check`

## Success Criteria

- 38+ new commits after dc8d30a
- All commits pushed to origin/main
- Frontend build passes (local or CI)
- All tests pass (unit, integration, E2E)
- CI browser workflow executes
- Manual QA completed
- Stitch visual QA completed
- Cross-browser QA completed
- Responsive QA completed
- Documentation complete
- Clean repository (0 divergence)

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| ARM64 build fails | Cannot verify prod build locally | Use CI x86 runner, document limitation |
| Docker unavailable | Cannot validate containers | Document limitation, validate in CI |
| Tests fail | Delay in commit | Fix incrementally, don't batch |
| Visual drift | UI doesn't match Stitch | Continuous visual QA per commit |

## Timeline Estimate

| Phase | Commits | Est. Days |
|-------|---------|-----------|
| Build & Tooling | 3 | 2 |
| Component Tests | 7 | 5 |
| E2E Tests | 4 | 3 |
| Security/RBAC/Workspace | 5 | 4 |
| SLA/Notifications/Health | 5 | 4 |
| Performance/Optimization | 3 | 2 |
| Visual/Accessibility/Responsive | 4 | 3 |
| QA/Docs/Validation | 4 | 3 |
| **Total** | **38** | **~29** |

## Next Step

Start with Commit 01: Create implementation plan document.