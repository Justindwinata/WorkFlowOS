# WorkFlowOS API Query Performance Audit

## Overview

Audit of API database queries for potential performance issues, based on the Prisma schema and service implementations.

## Methodology

Without a running PostgreSQL instance, this audit is based on static analysis of query patterns and schema indexes. **NOT VERIFIED LOCALLY** against actual query plans.

## Findings

### 1. Tasks Query (GET /tasks)

**Current pattern**:
```typescript
this.prisma.task.findMany({
  where: { project: { workspaceId } },
  include: { assignments: { include: { user: true } }, comments: true, creator: true },
  orderBy: { createdAt: 'desc' },
});
```

**Issues**:
- Includes full comments for every task (N+1 style expansion)
- No pagination limit

**Fix applied**: Composite index `Task(projectId, status)` already added in Phase 4.

### 2. Dashboard Query (GET /dashboard)

**Current pattern**: Multiple queries:
- tasks (creator or assignee)
- requests (requester)
- incidents (active)
- approvals (approver, pending)
- team workload
- audit logs

**Issues**:
- Loads up to 10 of each, reasonable
- `teamWorkload` query aggregates tasks across projects per member — potentially heavy

### 3. Team Workload (part of dashboard)

**Current pattern**:
```typescript
this.prisma.teamMember.findMany({
  where: { team: { workspaceId } },
  include: {
    user: { select: {...} },
    team: { include: { projects: { include: { tasks: { where: {...} } } } } },
  },
  take: 20,
});
```

**Issues**: Nested include of tasks per project per team member is O(members × projects × tasks).

### 4. Audit Log (GET /audit-log)

**Current pattern**: `findMany` ordered by timestamp desc, take 100. Index on `timestamp` exists.

### 5. Notifications (GET /notifications)

**Current pattern**: `findMany` ordered desc, take 50. Index on `userId` exists.

## Recommendations (with evidence)

| # | Query | Risk | Action |
|---|-------|------|--------|
| 1 | Team workload nested tasks | Medium | Add `select` instead of `include` to reduce payload |
| 2 | Tasks with all comments | Medium | Exclude comment bodies from list view; separate detail endpoint already exists |
| 3 | No pagination on tasks | Medium | Add limit/offset |
| 4 | Dashboard multi-query | Low | Could use Promise.all (already sequential await) |

## Evidence-Based Priorities

- **Team workload**: Most likely heavy at scale (nested include). Recommended to select only counts.
- **Tasks list**: Comments inclusion bloats list responses. Use `select` or drop comments include.

## NOT VERIFIED

- Actual query plans
- Execution times
- DB size / row counts

These require a running PostgreSQL + representative data volume (CI or staging).
