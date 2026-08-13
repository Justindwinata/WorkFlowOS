# WorkFlowOS - Known Limitations

## Current Limitations

1. **Frontend Build**: Web build hangs during `next build` in current environment.
2. **Docker**: Not installed; docker-compose config not validated locally.
3. **Frontend Tests**: Vitest config present but no component tests implemented yet.
4. **E2E Tests**: Playwright configured but no tests written yet.
5. **Seeding**: No database seed script; manual test data only.
6. **RBAC Seeding**: Roles and permissions not auto-seeded with predefined sets.
7. **Rate Limiting**: Throttler guard configured but not enabled globally.
8. **Multi-workspace**: Users assigned to single workspace only.
9. **Soft Delete**: Schema uses hard deletes; soft delete strategy to be implemented.
10. **Email**: No email-based notifications; in-app only.

## Security Limitations

1. **Tokens**: Stored in localStorage (consider httpOnly cookies for production)
2. **CORS**: Default wide-open; tighten in production
3. **Session Revocation**: No server-side token blacklist for logout
4. **Input Sanitization**: Class-validator present; XSS sanitization layer pending
5. **Audit Trail**: Not all mutation operations logged yet

## Performance Limitations

1. No query result caching beyond Redis availability
2. No pagination on list endpoints
3. No background job queue for long-running operations

## Next Milestone Recommendations

1. Implement soft-delete across all entities
2. Add server-side rate limiting middleware
3. Build SLA enforcement engine with real-time alerts
4. Create BPMN-style workflow designer UI
5. Add integration hub (Slack, Jira, Okta SSO)
6. Implement comprehensive E2E test suite
7. Add email/SMS notification channels
