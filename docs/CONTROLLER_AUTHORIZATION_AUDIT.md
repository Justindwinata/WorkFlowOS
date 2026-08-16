# WorkFlowOS Controller Authorization Audit

## Purpose

Verify every controller enforces authorization at the backend, and that UI hiding is never the only protection.

## Audit Method

Reviewed each module controller for:
1. `@UseGuards(JwtAuthGuard)` presence
2. `@RequirePermissions` / `PermissionsGuard` on sensitive operations
3. Workspace scoping in service queries

## Findings

| Controller | JwtAuthGuard | PermissionsGuard | Notes |
|------------|-------------|------------------|-------|
| AuthController | ✅ (me, logout, change-password) | N/A | Public: register, login, refresh |
| UsersController | ✅ | Partial (role update, delete) | Create/list open to authed users |
| TeamsController | ✅ | ❌ | All team ops authed-only; workspace-scoped |
| ProjectsController | ✅ | ❌ | Workspace-scoped |
| TasksController | ✅ | ❌ | Workspace-scoped via project |
| RequestsController | ✅ | ❌ | Scoped by requester |
| IncidentsController | ✅ | ❌ | Not workspace-scoped |
| ApprovalsController | ✅ | Partial (approval ownership) | Approve/Reject checks approverId |
| SlaController | ✅ | ❌ | Global definitions |
| NotificationsController | ✅ | N/A | Scoped by user |
| AuditLogController | ✅ | ✅ (view_audit_log) | Admin permission required |
| WorkspacesController | ✅ | N/A | Membership-checked |
| DashboardController | ✅ | N/A | Scoped by workspace |
| HealthController | Public | N/A | Liveness/readiness only |
| MetricsController | Public | N/A | Operational metrics (consider restricting) |

## Risks

| # | Risk | Severity | Recommendation |
|---|------|----------|----------------|
| 1 | IncidentsController not workspace-scoped | Medium | Add workspaceId to Incident or scope via assignee team |
| 2 | SlaController definitions global | Low | Consider workspace-scoping SLA config |
| 3 | MetricsController public | Low | Restrict to internal network/Admin |
| 4 | Teams/Projects/Tasks lack PermissionsGuard | Low | Authed users are workspace members; acceptable for Phase 5 |

## Conclusion

Authorization is enforced at the backend for all authenticated routes. UI hiding is never the sole protection — all controllers require a valid JWT, and sensitive actions (user role change, delete, approval) have additional permission/ownership checks.

Residual: workspace scoping for Incident/SLA should be completed for multi-tenant production (documented).