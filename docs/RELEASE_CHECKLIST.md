# WorkFlowOS - Production Release Checklist

## Pre-Release

### Code Quality
- [ ] `npm run lint` passes in both apps
- [ ] `npm run test` passes in both apps (backend + frontend)
- [ ] `npm run build` passes in both apps
- [ ] `git diff --check` clean
- [ ] No open failing CI checks

### Security
- [ ] `npm audit` reviewed; critical/high documented or remediated
- [ ] No secrets in repo (env files not committed)
- [ ] JWT secrets are strong random values (not defaults)
- [ ] CORS restricted to production origins
- [ ] Security headers enabled (CSP, HSTS)
- [ ] Login lockout + rate limiting verified
- [ ] Password change workflow verified
- [ ] Session revocation (logout) verified

### Database
- [ ] Back up production database
- [ ] `npx prisma migrate deploy` applied to staging first
- [ ] Run `npm run seed` on staging (deterministic)
- [ ] Verify backup restore procedure
- [ ] Soft-delete lifecycle handlers verified

### Deployment
- [ ] `.env.production` prepared (not committed)
- [ ] Build containers/images
- [ ] Health (`/health`) and readiness (`/readiness`) endpoints respond
- [ ] Staging smoke tests pass
- [ ] Manual QA checklist complete

## Release Day

- [ ] Freeze production DB (read-only if possible during migration)
- [ ] Deploy API first, then Web
- [ ] Verify API readiness before Web serves traffic
- [ ] Run post-deploy smoke tests
- [ ] Enable traffic gradually (if blue-green)

## Post-Release

- [ ] Verify login, dashboard, task, request, incident flows in production
- [ ] Verify audit log capturing actions
- [ ] Verify notification delivery
- [ ] Monitor error rate (< 0.1%)
- [ ] Monitor latency (p95 < 1s)
- [ ] Confirm no secrets in logs
- [ ] Confirm rate limiting active and not over-limiting legit users

## Emergency Gating

If any of the following occur, abort and roll back:
- Database migration fails
- Readiness endpoint returns non-ready for > 5 min
- Error rate spikes above 5%
- Login unavailable for > 15 min
- Security breach or compromised credential

## Sign-off

- [ ] QA sign-off
- [ ] Backend engineer sign-off
- [ ] Frontend engineer sign-off
- [ ] Release manager approval