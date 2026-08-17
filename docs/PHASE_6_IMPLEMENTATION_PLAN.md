# Phase 6 Implementation Plan

## Overview

Phase 6 carries over remaining Phase 5 gaps and improves WorkFlowOS toward product maturity: functional reliability, workflow UX, Stitch UI consistency, performance, accessibility, and testing.

## Baseline

- **HEAD**: 32e4aff
- **Total commits**: 121
- **Status**: Deploy-ready prototype; repo clean, synced.

## Phase 5 Carry-Over Assessment

| Issue | Status | Evidence |
|-------|--------|----------|
| npm audit vulnerabilities | Partial | 36 remain; all require major breaking upgrades. Safe `file-type` fix applied. jsdom pinned (frontend test runtime bug fixed). |
| Docker runtime verification | NOT VERIFIED LOCALLY | Docker not installed in this environment. |
| Real Playwright execution | NOT EXECUTED LOCALLY | Requires API + PostgreSQL; CI workflow configured. |
| Workspace scoping | Fixed | Added `workspaceId` to Incident + Request, scoped queries, migration + seed. |
| Refresh-token security | Fixed | Refresh token moved to httpOnly, secure, sameSite cookie. Frontend uses withCredentials. |
| TOTP integration | Backend done | totpSecret, setup/enable/disable/verify; frontend flow pending. |
| Field-level PII protection | Documented | PII_CLASSIFICATION.md; encryption roadmap documented (not implemented). |
| Per-user rate limiting | Fixed | UserThrottlerGuard keyed by user ID / IP. |

## Phase 6 Commit Plan (30+)

1. docs: phase 6 implementation plan
2. feat: add API unavailable state UX
3. style: align tables/badges with Stitch
4. feat: dashboard "needs attention" section
5. fix: task status transition validation
6. feat: my-work filter (overdue / assigned)
7. style: responsive table improvements
8. fix: frontend session-restore race
9. feat: notification unread badge sync
10. perf: dedupe dashboard queries
11. fix: incident/request workspace filter UX
12. feat: global 2FA settings UI
13. style: empty/error state alignment
14. test: backend workflow regression
15. test: frontend component coverage add
16. docs: manual QA
17. docs: final validation
... (continue to 30+)

## Engineering Priority

1. Phase 5 verification/fixes (done above)
2. Functional reliability
3. Workflow UX (business questions)
4. UI consistency with Stitch
5. Performance
6. Accessibility
7. Testing
8. Final QA
9. Documentation

## Final Validation

- Backend: `npm test`, `npm run lint`, `npm run build`
- Frontend: `npm test`, `npm run lint`, `npm run build`
- E2E: `npm run test:e2e` (NOT VERIFIED LOCALLY without DB)
- Database: `npx prisma generate`
- Git: `git diff --check`

## Honesty Constraints

- Do not claim Docker/E2E passed without execution evidence.
- State NOT VERIFIED LOCALLY where applicable.
- Final repo must be main, clean, 0/0 divergence.