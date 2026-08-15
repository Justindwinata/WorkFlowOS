# WorkFlowOS Observability Guide

## Overview

This document describes WorkFlowOS observability capabilities: logging, health checks, metrics, and monitoring recommendations.

---

## 1. Logging

### Backend (NestJS)
WorkFlowOS uses NestJS Logger with custom structured logging:

```typescript
// Structured log output
LOG_LEVEL=info
[2026-08-15T10:00:00.000Z] INFO: GET /dashboard 245ms - 127.0.0.1 - Mozilla/5.0
[2026-08-15T10:00:01.000Z] INFO: POST /auth/login 120ms - 127.0.0.1 - Mozilla/5.0
[2026-08-15T10:00:02.000Z] WARN: SECURITY: Failed login attempt - userId=1
```

**Key features**:
- ✅ Request/response logging with duration
- ✅ Method, URL, IP, user-agent captured
- ✅ Error stack traces (dev only)
- ✅ Security events logged (auth failures)
- ✅ No secrets/passwords logged
- ✅ NODE_ENV-aware debug logging

### Frontend (Browser)
- ✅ Browser console for development
- ✅ ErrorBoundary catches runtime errors
- ✅ TanStack Query errors logged

---

## 2. Health Checks

### Liveness (`GET /health`)
Returns 200 if the service is running:
```json
{
  "status": "ok",
  "service": "workflowos-api",
  "timestamp": "2026-08-15T10:00:00.000Z",
  "uptime": 12345
}
```

### Readiness (`GET /readiness`)
Returns 200 when dependencies are ready, 503 otherwise:
```json
{
  "status": "ready",
  "checks": {
    "database": "up"
  },
  "timestamp": "2026-08-15T10:00:00.000Z"
}
```

### Docker Healthchecks
- PostgreSQL: `pg_isready -U workflowos`
- Redis: `redis-cli ping`

---

## 3. Monitoring Recommendations

### APM (Application Performance Monitoring)
| Tool | Purpose | Setup Effort |
|------|---------|-------------|
| Datadog APM | Traces, metrics, logs | Medium |
| New Relic | APM, browser monitoring | Medium |
| Sentry | Error tracking | Low |
| OpenTelemetry | Open-source tracing | High |

### Uptime Monitoring
- UptimeRobot (free tier)
- Pingdom
- Datadog Synthetic

### Log Aggregation
- ELK Stack (Elasticsearch + Logstash + Kibana)
- Loki + Grafana (lightweight)
- Datadog Logs

### Alerting
- PagerDuty
- OpsGenie
- Slack integration

---

## 4. Key Metrics to Track

### Backend
- Request rate (req/sec)
- Error rate (5xx/4xx)
- Response time (p50, p95, p99)
- Database query time
- Active connections
- JWT refresh rate

### Frontend
- Page load time
- First Contentful Paint (FCP)
- Time to Interactive (TTI)
- Error rate
- API call latency

### Business
- Tasks created/day
- Requests submitted/day
- Incidents resolved/day
- SLA breach rate
- Approval time (median)

---

## 5. Debugging Guide

### Backend
```bash
# Enable debug logging
LOG_LEVEL=debug npm run dev

# View API request logs
curl http://localhost:3001/api/logs

# Health check
curl http://localhost:3001/health
```

### Frontend
```bash
# Enable debug logging in console
localStorage.setItem('DEBUG', 'true')
```

---

## 6. Production Runbook

### On Incident
1. Check `/health` and `/readiness`
2. Review logs for `[2026-08-15T...]` entries
3. Check database status (`pg_isready`)
4. Restart affected service
5. Verify recovery

### On SLA Breach
1. Review SLA enforcement logs
2. Check incident/request timeline
3. Verify notification delivery
4. Escalate if needed

---

## 7. Implementation Status

| Feature | Status |
|---------|--------|
| Structured logging | ✅ Implemented |
| Liveness endpoint | ✅ Implemented |
| Readiness endpoint | ✅ Implemented |
| Audit logging | ✅ Implemented |
| Error tracking | ⚠️ Basic (console) |
| Metrics collection | ⚠️ Not yet |
| Tracing | ⚠️ Not yet |
| Synthetic monitoring | ⚠️ Not yet |

---

## 8. Next Steps

1. Add Sentry/Datadog error tracking
2. Add OpenTelemetry instrumentation
3. Create Grafana dashboards
4. Set up uptime monitoring
5. Add structured access logs (nginx/Traefik)
6. Configure log retention policy