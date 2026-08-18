# WorkFlowOS Deployment Checklist

## Pre-Deployment

- [ ] All tests passing (`npm test` in both apps)
- [ ] Lint passing (`npm run lint` in both apps)
- [ ] Build successful (`npm run build` in both apps)
- [ ] No TypeScript errors
- [ ] Database migrations ready (`npx prisma migrate deploy --dry-run`)
- [ ] Environment variables validated
- [ ] Secrets configured in production environment

## Environment Variables Required

### Backend (API)
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_ACCESS_SECRET` - Secret for access tokens (min 32 chars)
- `JWT_REFRESH_SECRET` - Secret for refresh tokens (min 32 chars)
- `API_PORT` - API server port (default: 3001)
- `WEB_URL` - Frontend URL for CORS
- `REDIS_URL` - Redis connection (optional, for caching)

### Frontend (Web)
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NODE_ENV` - Environment (production/development)

## Deployment Steps

### 1. Database Setup
```bash
cd apps/api
npx prisma generate
npx prisma migrate deploy
npm run seed
```

### 2. Backend Deployment
```bash
cd apps/api
npm ci --omit=dev
npm run build
NODE_ENV=production npm run start
```

### 3. Frontend Deployment
```bash
cd apps/web
npm ci --omit=dev
npm run build
NODE_ENV=production npm run start
```

### 4. Docker Deployment (Alternative)
```bash
docker compose -f docker-compose.prod.yml up -d
```

## Post-Deployment Verification

- [ ] Health endpoint returns 200: `GET /health`
- [ ] Readiness endpoint returns 200: `GET /readiness`
- [ ] Startup endpoint returns 200: `GET /startup`
- [ ] Login works
- [ ] Dashboard loads
- [ ] Tasks can be created and viewed
- [ ] Search and filters work
- [ ] 2FA login works for enabled users
- [ ] Logout revokes session

## Rollback Plan

1. Keep previous container images tagged
2. Database migrations should be backward compatible
3. Environment variables should be versioned
4. Monitor logs for errors after deployment

## Monitoring

- Check `/health` endpoint every 30s
- Check `/readiness` endpoint on startup
- Monitor error rates in logs
- Track API response times
- Monitor database connection pool

## Security Checklist

- [ ] No hardcoded secrets in code
- [ ] HTTPS enabled in production
- [ ] CORS properly configured
- [ ] Rate limiting active
- [ ] Security headers present (Helmet)
- [ ] Input validation enabled
- [ ] Authentication working
- [ ] RBAC enforced
- [ ] Workspace isolation verified
