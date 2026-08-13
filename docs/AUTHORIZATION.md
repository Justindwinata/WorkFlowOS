# WorkFlowOS - Authorization System

## Overview

WorkFlowOS implements a robust Role-Based Access Control (RBAC) authorization system at the backend level. Authorization decisions are made based on permissions associated with user roles, ensuring secure access to platform resources regardless of UI visibility.

## Architecture

```
User → Role → Permissions → Guard Validation → Controller Method
```

- **User**: Assigned to a single Role per Workspace
- **Role**: Contains a collection of Permissions
- **Permission**: Granular string representing an allowed action
- **Guard**: Intercepts requests and validates required permissions
- **Decorator**: Attaches required permissions metadata to controller handlers

## Core Components

### 1. Guards

#### `JwtAuthGuard`
Verifies JWT token validity and injects current user context into request object.

#### `PermissionsGuard`
Checks if current user possesses all or any required permissions for the endpoint.

```typescript
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!requiredPermissions) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user || !user.permissions) {
      throw new ForbiddenException('Anda tidak memiliki akses');
    }

    const hasPermission = requiredPermissions.some((permission) =>
      user.permissions.includes(permission)
    );

    if (!hasPermission) {
      throw new ForbiddenException('Anda tidak memiliki permission yang diperlukan');
    }

    return true;
  }
}
```

### 2. Decorators

#### `@RequirePermissions(...permissions: string[])`
Attaches permission metadata to controller handlers or classes.

```typescript
export const PERMISSIONS_KEY = 'permissions';
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
```

#### `@CurrentUser(key?: string)`
Extracts user or specific user property from request context.

```typescript
export const CurrentUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  }
);
```

## Predefined Roles & Permission Sets

### Admin
Full platform control. Default permissions:
- `manage_users`, `delete_users`, `view_users`
- `manage_teams`, `manage_projects`
- `create_task`, `edit_task`, `delete_task`, `assign_task`, `view_all_tasks`
- `manage_requests`, `approve_requests`
- `manage_incidents`, `resolve_incidents`
- `view_audit_log`, `manage_settings`

### Manager
Departmental leadership and team oversight. Default permissions:
- `view_users`
- `manage_teams` (assigned teams), `manage_projects`
- `create_task`, `edit_task`, `assign_task`, `view_all_tasks`
- `approve_requests`, `submit_requests`
- `manage_incidents`, `assign_incidents`
- `view_audit_log`

### Member
Standard operational user. Default permissions:
- `view_users`
- `create_task` (own projects), `edit_task` (assigned tasks), `view_all_tasks`
- `submit_requests`
- `report_incidents`, `resolve_incidents` (assigned incidents)

### Viewer
Auditor or read-only stakeholder. Default permissions:
- `view_users`
- `view_all_tasks`
- `view_requests`
- `view_incidents`

## Usage Examples

### Protected Controller Endpoint

```typescript
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  
  // Endpoint accessible by all authenticated users
  @Get()
  async findAll() { ... }

  // Endpoint protected by RBAC - requires 'manage_users' OR 'admin' permission
  @Patch(':id/role')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('manage_users', 'admin')
  async updateRole(
    @Param('id') id: string,
    @Body() dto: UpdateUserRoleDto,
  ) { ... }
}
```

### Context Injection

```typescript
@Post('tasks')
async createTask(
  @Body() dto: CreateTaskDto,
  @CurrentUser('id') userId: string,
  @CurrentUser('workspaceId') workspaceId: string,
) {
  return this.tasksService.create(dto, userId, workspaceId);
}
```

## Security Design Guarantees

1. **Backend Enforcement**: Authorization logic runs strictly on the server; UI visibility toggles are secondary.
2. **Fail-Closed Strategy**: Access is denied unless explicitly allowed by permission match.
3. **Workspace Isolation**: Database queries incorporate `workspaceId` extracted from validated JWT payload, preventing cross-tenant data leaks.
4. **Audit Coupling**: Administrative authorization events (role updates, permission changes) write immutable entries to `AuditLog`.
