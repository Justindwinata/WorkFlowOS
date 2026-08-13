# WorkFlowOS - Authentication & Authorization

## Authentication System

### Overview
WorkFlowOS uses JWT-based authentication with access and refresh tokens. The system provides secure login, registration, token refresh, and current user endpoints.

### Registration Flow

```typescript
POST /auth/register
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}

Response:
{
  "user": {
    "id": "user-1",
    "email": "user@example.com",
    "username": "johndoe",
    "role": "member",
    "permissions": ["read", "create_task"]
  },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

### Login Flow

```typescript
POST /auth/login
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response:
{
  "user": { ... },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

### Token Refresh

```typescript
POST /auth/refresh
{
  "refreshToken": "eyJhbGc..."
}

Response:
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

### Token Structure

**Access Token Payload:**
```json
{
  "sub": "user-id",
  "email": "user@example.com",
  "username": "johndoe",
  "roleId": "role-id",
  "workspaceId": "workspace-id",
  "iat": 1234567890,
  "exp": 1234569690
}
```

**Token Configuration:**
```
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
```

## Authorization System

### Role-Based Access Control (RBAC)

Roles define sets of permissions. Users are assigned roles, and permissions are checked at the controller level.

**Predefined Roles:**
- **Admin**: Full access to all resources and operations
- **Manager**: Can manage team members, view reports, approve requests
- **Member**: Can view their own tasks, submit requests, comment on tasks
- **Viewer**: Read-only access to non-sensitive data

### Permission Examples

```
User Management:
- view_users
- manage_users
- delete_users

Task Management:
- create_task
- edit_task
- assign_task
- view_all_tasks

Approval:
- approve_requests
- reject_requests

Audit:
- view_audit_log
```

### Permission Checking

**Backend Guard Implementation:**

```typescript
@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions('manage_users', 'admin')
export class UsersController {
  @Patch(':id/role')
  async updateRole(@Param('id') id: string) {
    // Only users with 'manage_users' or 'admin' permission can access
  }
}
```

**How it works:**
1. `JwtAuthGuard` validates JWT token and extracts user
2. `@CurrentUser()` decorator injects user into controller
3. `PermissionsGuard` checks if user has required permissions
4. If authorized, request proceeds to service
5. If not authorized, returns 403 Forbidden

### Database Schema for RBAC

```
User → Role (many-to-one)
Role → Permission (many-to-many via role_permission table)
```

## Frontend Auth Implementation

### Auth Store (Zustand)

```typescript
useAuthStore().user              // Current user object
useAuthStore().isAuthenticated   // Boolean
useAuthStore().login()           // Login function
useAuthStore().register()        // Register function
useAuthStore().logout()          // Logout function
useAuthStore().refreshUser()     // Fetch current user
```

### API Client with JWT

The `api-client.ts` automatically handles:
- Adding JWT token to request headers
- Refreshing token on 401 response
- Retrying failed requests with new token
- Redirecting to login on permanent auth failure

### Protected Components

```typescript
// DashboardLayout redirects to login if not authenticated
if (!isAuthenticated) {
  redirect('/login');
}

// useAuth hook for permission checks
const { user } = useAuth();
if (!user?.permissions.includes('manage_users')) {
  return <AccessDenied />;
}
```

## Security Best Practices

1. **Password Hashing**: 
   - Algorithm: bcryptjs
   - Salt rounds: 10
   - Never store plain text passwords

2. **Token Security**:
   - Tokens stored in localStorage (or sessionStorage for higher security)
   - Short access token expiration (15 minutes)
   - Refresh tokens for longer sessions
   - Separate secrets for access and refresh tokens

3. **CORS**:
   - Frontend and backend on same origin in production
   - CORS policies configured in NestJS

4. **Input Validation**:
   - Email validation
   - Password minimum length (8 characters)
   - Username format validation
   - Backend validation of all inputs

5. **Rate Limiting**:
   - Foundation in place via @nestjs/throttler
   - Ready for implementation per endpoint

## Current User Endpoint

```typescript
GET /auth/me
Authorization: Bearer {accessToken}

Response:
{
  "id": "user-1",
  "email": "user@example.com",
  "username": "johndoe",
  "firstName": "John",
  "lastName": "Doe",
  "role": "member",
  "permissions": ["read", "create_task", "view_all_tasks"],
  "createdAt": "2026-08-13T10:00:00Z",
  "updatedAt": "2026-08-13T16:53:00Z"
}
```

## Session Management

- No server-side sessions; stateless JWT authentication
- Client-side token refresh using refresh endpoint
- Automatic logout on token expiration
- Manual logout clears tokens from localStorage

## Multi-Workspace Support

Currently, each user is assigned to a single workspace. The `workspaceId` is stored in the JWT payload for workspace-scoped queries.

Future enhancement: Users can be assigned to multiple workspaces with different roles per workspace.
