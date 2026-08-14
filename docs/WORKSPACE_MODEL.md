# WorkFlowOS - Workspace Model

## Overview

WorkFlowOS supports multi-workspace architecture where users can belong to multiple workspaces with different roles per workspace.

## Data Model

### UserWorkspace Pivot

```prisma
model UserWorkspace {
  id        String   @id @default(cuid())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId    String
  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  workspaceId String
  role      Role     @relation(fields: [roleId], references: [id])
  roleId    String
  current   Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId, workspaceId])
  @@index([userId])
  @@index([workspaceId])
}
```

### Workspace Switching

Each user has a "current workspace" stored in:
- `User.workspaceId` (current workspace)
- `User.roleId` (current role in current workspace)
- `UserWorkspace.current` (boolean flag)

When switching:
1. Set all user's memberships `current = false`
2. Set target membership `current = true`
3. Update `User.workspaceId` and `User.roleId` to match

## API Endpoints

### List User Workspaces

```http
GET /workspaces
Authorization: Bearer <token>

Response:
[
  {
    "id": "ws-1",
    "name": "Acme Corp",
    "slug": "acme-corp",
    "role": "admin",
    "current": true
  }
]
```

### Switch Workspace

```http
POST /workspaces/switch
Authorization: Bearer <token>
Content-Type: application/json

{
  "workspaceId": "ws-2"
}
```

### Get Workspace Details

```http
GET /workspaces/:id
Authorization: Bearer <token>
```

### Create Workspace

```http
POST /workspaces
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Company",
  "slug": "new-company"
}
```

## Authorization

The `WorkspacePermissionsGuard` ensures:
1. User is member of requested workspace
2. User has required permissions in that workspace

```typescript
@UseGuards(WorkspacePermissionsGuard)
@RequirePermissions('manage_users')
@Post('users')
async createUser(@CurrentUser('workspaceId') workspaceId: string) { ... }
```

## JWT Token

Current workspace and role included in JWT payload:
```json
{
  "sub": "user-id",
  "email": "user@example.com",
  "username": "username",
  "roleId": "role-id",
  "workspaceId": "workspace-id"
}
```

## Data Isolation

All queries automatically filter by workspaceId from JWT:
- Users only see users in their workspace
- Tasks only from projects in their workspace
- Requests only from their workspace

## Seed Data

On user registration:
1. Create/get default workspace
2. Create UserWorkspace with current=true
3. Assign member role

## Future Enhancements

- Workspace invitations
- Workspace-level settings
- Cross-workspace reporting (admin)
- SAML/SSO per workspace