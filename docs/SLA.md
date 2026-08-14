# WorkFlowOS - SLA Management

## Overview

WorkFlowOS implements a comprehensive Service Level Agreement (SLA) system for tracking and enforcing response and resolution targets for incidents and requests.

## SLA Definitions

Each SLA has:
- **Name**: e.g., Critical, High, Medium, Low
- **Response Target**: Time (minutes) to first response
- **Resolution Target**: Time (minutes) to full resolution
- **Warning Threshold**: Time (minutes) before breach to trigger warning

### Default SLA Tiers

| Tier | Response Target | Resolution Target | Warning Threshold |
|------|----------------|-------------------|-------------------|
| Critical | 15 minutes | 120 minutes (2 hours) | 60 minutes |
| High | 30 minutes | 240 minutes (4 hours) | 120 minutes |
| Medium | 60 minutes | 480 minutes (8 hours) | 240 minutes |
| Low | 120 minutes | 960 minutes (16 hours) | 480 minutes |

## SLA Enforcement

### Background Monitoring

A background job runs every 60 seconds checking all active incidents and requests against their SLA targets.

### Breach Detection

For each active incident/request:
1. Calculate elapsed time since creation
2. Look up SLA definition by severity/priority
3. Compare elapsed minutes against targets
4. Trigger alerts if warning threshold or breach reached

### Escalation Flow

```
Active Incident/Request
         ��
   Background Check (every 60s)
         ��
   Warning Threshold Reached
         ��
   Notification: "SLA Warning"
         ��
   Breach Threshold Reached
         ��
   Status: "escalated" (incidents) / Notification (requests)
         ��
   Notification: "SLA Breach"
```

### SLA Check API

```http
GET /sla/{name}/check
Content-Type: application/json

{
  "elapsedMinutes": 30
}

Response:
{
  "warning": false,
  "breached": false
}
```

### SLA Creation

```http
POST /sla
Content-Type: application/json

{
  "name": "Urgent",
  "responseTarget": 10,
  "resolutionTarget": 60,
  "warningThreshold": 5
}
```

## Dashboard Integration

The dashboard displays:
- SLA At Risk count
- List of SLA-at-risk items with elapsed time
- Warning vs breach status

## Configuration

SLA tiers are seeded on first run. Can be customized via API:

```bash
# Create custom SLA
curl -X POST http://localhost:3001/sla \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Emergency", "responseTarget": 5, "resolutionTarget": 30, "warningThreshold": 2}'
```

## Monitoring

SLA enforcement runs as background job with 60-second interval. Check logs for:
- SLA breach detections
- Notification creations
- Escalation events

## Limitations

- SLA tied to severity/priority, not request type
- No per-customer SLA yet
- No business hours calendar (24/7 enforcement)
- No SLA reporting/analytics yet