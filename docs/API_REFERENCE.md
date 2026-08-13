# WorkFlowOS - API Reference

## Base URL

```
Development: http://localhost:3001
Production: https://api.workflowos.example.com
```

## Authentication

All protected endpoints require JWT token in Authorization header:

```
Authorization: Bearer <access_token>
```

Get tokens from `/auth/login` or `/auth/register`.

## Response Format

### Success Response

```json
{
  "id": "entity-id",
  "field": "value",
  "createdAt": "2026-08-13T10:00:00Z"
}
```

### Error Response

```json
{
  "statusCode": 400,
  "message": "Validation error",
  "error": "Bad Request"
}
```

---

## Auth Endpoints

### Register User

```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response 201:**
```json
{
  "user": {
    "id": "user-1",
    "email": "user@example.com",
    "username": "johndoe",
    "firstName": "John",
    "lastName": "Doe",
    "role": "member",
    "permissions": ["read"]
  },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

**Errors:**
- 409 - Email or username already registered

---

### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response 200:**
```json
{
  "user": { ... },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

**Errors:**
- 401 - Invalid credentials

---

### Refresh Token

```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGc..."
}
```

**Response 200:**
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

---

### Get Current User

```http
GET /auth/me
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "id": "user-1",
  "email": "user@example.com",
  "username": "johndoe",
  "firstName": "John",
  "lastName": "Doe",
  "role": "member",
  "permissions": ["read", "create_task"]
}
```

---

## Users Endpoints

### List Users

```http
GET /users
Authorization: Bearer <token>
```

**Response 200:**
```json
[
  {
    "id": "user-1",
    "email": "user@example.com",
    "username": "johndoe",
    "firstName": "John",
    "lastName": "Doe",
    "status": "active",
    "role": { "id": "role-1", "name": "member" }
  }
]
```

---

### Get User

```http
GET /users/:id
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "id": "user-1",
  "email": "user@example.com",
  "username": "johndoe",
  "firstName": "John",
  "lastName": "Doe",
  "status": "active",
  "role": {
    "id": "role-1",
    "name": "member",
    "permissions": [{ "id": "perm-1", "name": "read" }]
  }
}
```

**Errors:**
- 404 - User not found

---

### Create User

```http
POST /users
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "newuser@example.com",
  "username": "newuser",
  "password": "SecurePass123!",
  "firstName": "New",
  "lastName": "User"
}
```

**Response 201:**
```json
{
  "id": "user-2",
  "email": "newuser@example.com",
  "username": "newuser",
  "role": "member"
}
```

---

### Update User

```http
PATCH /users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "Updated",
  "lastName": "Name"
}
```

**Response 200:**
```json
{
  "id": "user-1",
  "firstName": "Updated",
  "lastName": "Name"
}
```

---

### Update User Role

```http
PATCH /users/:id/role
Authorization: Bearer <token>
Content-Type: application/json

{
  "roleId": "role-2"
}
```

**Requires:** `manage_users` or `admin` permission

**Response 200:**
```json
{
  "id": "user-1",
  "role": "manager"
}
```

---

### Delete User

```http
DELETE /users/:id
Authorization: Bearer <token>
```

**Requires:** `delete_users` or `admin` permission

**Response 204:** No content

---

## Teams Endpoints

### List Teams

```http
GET /teams
Authorization: Bearer <token>
```

**Response 200:**
```json
[
  {
    "id": "team-1",
    "name": "Engineering",
    "description": "Engineering team",
    "members": [
      { "id": "tm-1", "user": { "id": "user-1", "username": "johndoe" }, "role": "lead" }
    ],
    "_count": { "projects": 3 }
  }
]
```

---

### Create Team

```http
POST /teams
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Engineering",
  "description": "Engineering team"
}
```

**Response 201:**
```json
{
  "id": "team-1",
  "name": "Engineering",
  "description": "Engineering team",
  "members": []
}
```

---

### Add Team Member

```http
POST /teams/:id/members
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "user-2",
  "role": "member"
}
```

**Response 201:**
```json
{
  "id": "tm-1",
  "userId": "user-2",
  "teamId": "team-1",
  "role": "member",
  "user": { "id": "user-2", "username": "janedoe" }
}
```

---

### Remove Team Member

```http
DELETE /teams/:id/members/:userId
Authorization: Bearer <token>
```

**Response 204:** No content

---

## Projects Endpoints

### List Projects

```http
GET /projects
Authorization: Bearer <token>
```

**Response 200:**
```json
[
  {
    "id": "proj-1",
    "name": "WorkFlowOS v1",
    "description": "Phase 1 development",
    "status": "active",
    "team": { "id": "team-1", "name": "Engineering" },
    "_count": { "tasks": 15 }
  }
]
```

---

### Create Project

```http
POST /projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "WorkFlowOS v1",
  "description": "Phase 1 development",
  "teamId": "team-1"
}
```

**Response 201:**
```json
{
  "id": "proj-1",
  "name": "WorkFlowOS v1",
  "status": "active"
}
```

---

## Tasks Endpoints

### List Tasks

```http
GET /tasks
GET /tasks?projectId=proj-1
Authorization: Bearer <token>
```

**Response 200:**
```json
[
  {
    "id": "task-1",
    "title": "Setup authentication",
    "description": "Implement JWT auth",
    "status": "in_progress",
    "priority": "high",
    "dueDate": "2026-08-20T00:00:00Z",
    "project": { "id": "proj-1", "name": "WorkFlowOS v1" },
    "creator": { "id": "user-1", "username": "johndoe" },
    "assignments": [
      { "id": "ta-1", "user": { "id": "user-1", "username": "johndoe" } }
    ]
  }
]
```

---

### Create Task

```http
POST /tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Setup authentication",
  "description": "Implement JWT auth",
  "projectId": "proj-1",
  "priority": "high",
  "dueDate": "2026-08-20T00:00:00Z",
  "assigneeIds": ["user-1", "user-2"]
}
```

**Response 201:**
```json
{
  "id": "task-1",
  "title": "Setup authentication",
  "status": "backlog",
  "priority": "high"
}
```

---

### Update Task Status

```http
PATCH /tasks/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "in_progress"
}
```

**Response 200:**
```json
{
  "id": "task-1",
  "status": "in_progress"
}
```

---

### Assign User to Task

```http
POST /tasks/:id/assign
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "user-3"
}
```

**Response 201:**
```json
{
  "id": "ta-2",
  "taskId": "task-1",
  "userId": "user-3"
}
```

---

## Requests Endpoints

### List Requests

```http
GET /requests
Authorization: Bearer <token>
```

**Response 200:**
```json
[
  {
    "id": "req-1",
    "title": "IT Access Request",
    "type": "it_access",
    "status": "pending",
    "priority": "medium",
    "requester": { "id": "user-1", "username": "johndoe" },
    "approvals": [
      { "id": "appr-1", "status": "pending", "approver": { "id": "user-2", "username": "manager" } }
    ]
  }
]
```

---

### Create Request

```http
POST /requests
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "IT Access Request",
  "description": "Need access to production database",
  "type": "it_access",
  "priority": "high"
}
```

**Response 201:**
```json
{
  "id": "req-1",
  "title": "IT Access Request",
  "status": "draft"
}
```

---

## Incidents Endpoints

### List Incidents

```http
GET /incidents
Authorization: Bearer <token>
```

**Response 200:**
```json
[
  {
    "id": "inc-1",
    "title": "Database connection timeout",
    "severity": "critical",
    "priority": "critical",
    "status": "investigating",
    "assignee": { "id": "user-1", "username": "johndoe" }
  }
]
```

---

### Create Incident

```http
POST /incidents
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Database connection timeout",
  "description": "Production DB not responding",
  "severity": "critical",
  "affectedService": "database"
}
```

**Response 201:**
```json
{
  "id": "inc-1",
  "title": "Database connection timeout",
  "status": "open",
  "severity": "critical"
}
```

---

### Assign Incident

```http
POST /incidents/:id/assign
Authorization: Bearer <token>
Content-Type: application/json

{
  "assigneeId": "user-1"
}
```

**Response 200:**
```json
{
  "id": "inc-1",
  "assignee": { "id": "user-1", "username": "johndoe" }
}
```

---

## Approvals Endpoints

### List Approvals

```http
GET /approvals
Authorization: Bearer <token>
```

### List Pending Approvals

```http
GET /approvals/pending
Authorization: Bearer <token>
```

**Response 200:**
```json
[
  {
    "id": "appr-1",
    "status": "pending",
    "request": {
      "id": "req-1",
      "title": "IT Access Request",
      "requester": { "id": "user-1", "username": "johndoe" }
    }
  }
]
```

---

### Create Approval

```http
POST /approvals
Authorization: Bearer <token>
Content-Type: application/json

{
  "requestId": "req-1",
  "comment": "Please review this request"
}
```

---

### Update Approval Status

```http
PATCH /approvals/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "approved",
  "comment": "Approved - access granted"
}
```

**Status Options:**
- approved
- rejected
- changes_requested

---

## Notifications Endpoints

### List Notifications

```http
GET /notifications
Authorization: Bearer <token>
```

**Response 200:**
```json
[
  {
    "id": "notif-1",
    "title": "Task assigned",
    "message": "You have been assigned to 'Setup authentication'",
    "type": "task_assigned",
    "read": false,
    "createdAt": "2026-08-13T10:00:00Z"
  }
]
```

---

### Mark Notification as Read

```http
PATCH /notifications/:id/read
Authorization: Bearer <token>
```

---

### Mark All as Read

```http
POST /notifications/mark-all-read
Authorization: Bearer <token>
```

---

## Audit Log Endpoints

### List Audit Logs

```http
GET /audit-log?limit=100
Authorization: Bearer <token>
```

**Requires:** `view_audit_log` or `admin` permission

**Response 200:**
```json
[
  {
    "id": "log-1",
    "action": "login",
    "entity": "user",
    "entityId": "user-1",
    "actor": {
      "id": "user-1",
      "email": "user@example.com"
    },
    "summary": "User logged in",
    "timestamp": "2026-08-13T10:00:00Z"
  }
]
```

---

## HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 204 | No Content (success, no response body) |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Duplicate resource |
| 500 | Internal Server Error |

---

## Rate Limiting

Rate limiting is configured via `@nestjs/throttler`. Default limits:
- 60 requests per minute per IP
- Configurable per endpoint

---

## OpenAPI Documentation

Interactive API documentation available at:
```
http://localhost:3001/api
```

Swagger UI provides:
- All endpoints with request/response schemas
- Try-it-out functionality
- Authentication support
- Export to OpenAPI JSON
