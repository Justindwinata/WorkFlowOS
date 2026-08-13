# WorkFlowOS - Database ERD

## Entity Relationship Diagram

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│  Workspace   │────────<│     User     │>────────│     Role     │
│              │         │              │         │              │
│ id           │         │ id           │         │ id           │
│ name         │         │ email        │         │ name         │
│ slug         │         │ username     │         │ description  │
│ logo         │         │ password     │         │              │
└──────────────┘         │ firstName    │         └──────────────┘
                         │ lastName     │               │
                         │ roleId       │               │
                         │ workspaceId  │               │
                         │ status       │         ┌─────┴─────┐
                         └──────────────┘         │Permission │
                                │                 │           │
                                │                 │ id        │
                                │                 │ name      │
                                │                 └───────────┘
                ┌───────────────┼───────────────┐
                │               │               │
                ▼               ▼               ▼
         ┌──────────┐    ┌──────────┐   ┌──────────┐
         │   Team   │    │  Request │   │ Incident │
         │          │    │          │   │          │
         │ id       │    │ id       │   │ id       │
         │ name     │    │ title    │   │ title    │
         │ workspace│    │ type     │   │ severity │
         └──────────┘    │ status   │   │ status   │
              │          │ requester│   │ assignee │
              │          └──────────┘   └──────────┘
              │                 │
         ┌────┴────┐           │
         │TeamMbr  │           ▼
         │         │    ┌──────────┐
         │ userId  │    │ Approval │
         │ teamId  │    │          │
         │ role    │    │ id       │
         └─────────┘    │ status   │
              │         │ request  │
              │         │ approver │
              ▼         └──────────┘
         ┌──────────┐
         │ Project  │
         │          │
         │ id       │
         │ name     │
         │ teamId   │
         │ workspace│
         │ status   │
         └──────────┘
              │
              ▼
         ┌──────────┐
         │   Task   │
         │          │
         │ id       │
         │ title    │
         │ status   │
         │ priority │
         │ dueDate  │
         │ projectId│
         │ creatorId│
         └──────────┘
              │
      ┌───────┼───────┐
      ▼       ▼       ▼
┌──────────┐ ┌──────┐ ┌──────┐
│TaskAssign│ │Comment│ │Label │
│          │ │       │ │      │
│ taskId   │ │taskId │ │ id   │
│ userId   │ │author │ │ name │
└──────────┘ │content│ │color │
             └───────┘ └──────┘

┌──────────────┐         ┌──────────────┐
│ Notification │         │  AuditLog    │
│              │         │              │
│ id           │         │ id           │
│ title        │         │ action       │
│ message      │         │ entity       │
│ type         │         │ entityId     │
│ read         │         │ actorId      │
│ userId       │         │ summary      │
└──────────────┘         │ timestamp    │
                         └──────────────┘

┌──────────────┐
│     SLA      │
│              │
│ id           │
│ name         │
│ responseTime │
│ resolveTime  │
│ warnThreshold│
└──────────────┘
```

## Table Definitions

### User
Primary entity for authentication and authorization.

**Fields:**
- `id`: String (CUID)
- `email`: String (unique)
- `username`: String (unique)
- `password`: String (hashed with bcryptjs)
- `firstName`: String (nullable)
- `lastName`: String (nullable)
- `avatar`: String (nullable)
- `status`: String (default: "active")
- `roleId`: Foreign key to Role
- `workspaceId`: Foreign key to Workspace
- `createdAt`: DateTime
- `updatedAt`: DateTime

**Relationships:**
- Belongs to: Role, Workspace
- Has many: TeamMember, Task (as creator), TaskAssignment, TaskComment, Request, Approval, Incident (as assignee), Notification, AuditLog (as actor)

**Indexes:**
- `workspaceId`
- `roleId`

---

### Role
Defines user roles with associated permissions.

**Fields:**
- `id`: String (CUID)
- `name`: String (unique)
- `description`: String (nullable)
- `createdAt`: DateTime
- `updatedAt`: DateTime

**Relationships:**
- Has many: Users, Permissions (many-to-many)

**Predefined Roles:**
- Admin
- Manager
- Member
- Viewer

---

### Permission
Defines granular permissions assigned to roles.

**Fields:**
- `id`: String (CUID)
- `name`: String (unique)

**Relationships:**
- Belongs to many: Roles (many-to-many)

**Example Permissions:**
- `view_users`, `manage_users`, `delete_users`
- `create_task`, `edit_task`, `assign_task`
- `approve_requests`, `view_audit_log`

---

### Workspace
Organizational container for users, teams, and projects.

**Fields:**
- `id`: String (CUID)
- `name`: String
- `slug`: String (unique)
- `logo`: String (nullable)
- `createdAt`: DateTime
- `updatedAt`: DateTime

**Relationships:**
- Has many: Users, Teams, Projects

---

### Team
Groups users within a workspace.

**Fields:**
- `id`: String (CUID)
- `name`: String
- `description`: String (nullable)
- `workspaceId`: Foreign key to Workspace
- `createdAt`: DateTime
- `updatedAt`: DateTime

**Relationships:**
- Belongs to: Workspace
- Has many: TeamMembers, Projects

**Unique Constraint:**
- `(workspaceId, name)`

---

### TeamMember
Junction table for Team-User relationship with role.

**Fields:**
- `id`: String (CUID)
- `userId`: Foreign key to User
- `teamId`: Foreign key to Team
- `role`: String (default: "member")

**Relationships:**
- Belongs to: User, Team

**Unique Constraint:**
- `(userId, teamId)`

**Indexes:**
- `teamId`

---

### Project
Work container within a team.

**Fields:**
- `id`: String (CUID)
- `name`: String
- `description`: String (nullable)
- `status`: String (default: "active")
- `teamId`: Foreign key to Team
- `workspaceId`: Foreign key to Workspace
- `createdAt`: DateTime
- `updatedAt`: DateTime

**Relationships:**
- Belongs to: Team, Workspace
- Has many: Tasks

**Unique Constraint:**
- `(teamId, name)`

**Indexes:**
- `teamId`
- `workspaceId`

---

### Task
Work item within a project.

**Fields:**
- `id`: String (CUID)
- `title`: String
- `description`: String (nullable)
- `status`: String (default: "backlog")
- `priority`: String (default: "medium")
- `dueDate`: DateTime (nullable)
- `projectId`: Foreign key to Project
- `creatorId`: Foreign key to User
- `createdAt`: DateTime
- `updatedAt`: DateTime

**Relationships:**
- Belongs to: Project, User (creator)
- Has many: TaskAssignments, TaskComments, TaskLabels (many-to-many)

**Statuses:**
- backlog, todo, in_progress, review, done, cancelled

**Priorities:**
- low, medium, high, critical

**Indexes:**
- `projectId`
- `creatorId`
- `status`
- `priority`

---

### TaskAssignment
Junction table for Task-User assignments.

**Fields:**
- `id`: String (CUID)
- `taskId`: Foreign key to Task
- `userId`: Foreign key to User

**Relationships:**
- Belongs to: Task, User

**Unique Constraint:**
- `(taskId, userId)`

**Indexes:**
- `userId`

---

### TaskComment
Comments on tasks.

**Fields:**
- `id`: String (CUID)
- `content`: String
- `taskId`: Foreign key to Task
- `authorId`: Foreign key to User
- `createdAt`: DateTime
- `updatedAt`: DateTime

**Relationships:**
- Belongs to: Task, User (author)

**Indexes:**
- `taskId`
- `authorId`

---

### TaskLabel
Labels for categorizing tasks.

**Fields:**
- `id`: String (CUID)
- `name`: String (unique)
- `color`: String (nullable)

**Relationships:**
- Belongs to many: Tasks (many-to-many)

---

### Request
Internal requests (IT, HR, Finance, etc).

**Fields:**
- `id`: String (CUID)
- `title`: String
- `description`: String (nullable)
- `type`: String
- `status`: String (default: "draft")
- `priority`: String (default: "medium")
- `requesterId`: Foreign key to User
- `createdAt`: DateTime
- `updatedAt`: DateTime

**Relationships:**
- Belongs to: User (requester)
- Has many: Approvals

**Types:**
- it_access, laptop, software, procurement, hr, finance

**Statuses:**
- draft, submitted, approval, in_progress, completed, rejected

**Indexes:**
- `requesterId`
- `status`

---

### Approval
Approval workflow for requests.

**Fields:**
- `id`: String (CUID)
- `status`: String (default: "pending")
- `comment`: String (nullable)
- `requestId`: Foreign key to Request
- `approverId`: Foreign key to User
- `createdAt`: DateTime
- `updatedAt`: DateTime

**Relationships:**
- Belongs to: Request, User (approver)

**Statuses:**
- pending, approved, rejected, changes_requested

**Unique Constraint:**
- `(requestId, approverId)`

**Indexes:**
- `requestId`
- `approverId`

---

### Incident
Track operational incidents.

**Fields:**
- `id`: String (CUID)
- `title`: String
- `description`: String (nullable)
- `severity`: String (default: "medium")
- `priority`: String (default: "medium")
- `status`: String (default: "open")
- `affectedService`: String (nullable)
- `assigneeId`: Foreign key to User (nullable)
- `resolution`: String (nullable)
- `createdAt`: DateTime
- `updatedAt`: DateTime

**Relationships:**
- Belongs to: User (assignee, optional)

**Severities:**
- low, medium, high, critical

**Statuses:**
- open, investigating, escalated, resolved, closed

**Indexes:**
- `assigneeId`
- `status`
- `severity`

---

### SLA
Service Level Agreement configuration.

**Fields:**
- `id`: String (CUID)
- `name`: String (unique)
- `responseTarget`: Int (minutes)
- `resolutionTarget`: Int (minutes)
- `warningThreshold`: Int (minutes)
- `createdAt`: DateTime
- `updatedAt`: DateTime

**Example:**
- Critical: 15min response, 2hr resolution
- High: 30min response, 4hr resolution

---

### Notification
In-app notifications for users.

**Fields:**
- `id`: String (CUID)
- `title`: String
- `message`: String
- `type`: String
- `read`: Boolean (default: false)
- `userId`: Foreign key to User
- `createdAt`: DateTime

**Relationships:**
- Belongs to: User

**Types:**
- task_assigned, mention, approval_request, sla_warning, incident_escalation, status_change

**Indexes:**
- `userId`
- `read`

---

### AuditLog
Activity tracking for compliance and audit.

**Fields:**
- `id`: String (CUID)
- `action`: String
- `entity`: String
- `entityId`: String
- `actorId`: Foreign key to User
- `summary`: String (nullable)
- `timestamp`: DateTime (default: now)

**Relationships:**
- Belongs to: User (actor)

**Actions:**
- login, logout, create, update, delete, assignment, approval, escalation

**Indexes:**
- `actorId`
- `entityId`
- `timestamp`

---

## Relationships Summary

- **User** is the central entity, related to Role, Workspace, Teams, Tasks, Requests, Incidents, Approvals, Notifications, and AuditLogs
- **Role** and **Permission** implement RBAC via many-to-many relationship
- **Workspace** contains Users, Teams, and Projects
- **Team** organizes Users via TeamMember and contains Projects
- **Project** contains Tasks
- **Task** has Assignments (Users), Comments, and Labels
- **Request** flows through Approval workflow
- **Incident** can be assigned to User
- **Notification** sent to User for various events
- **AuditLog** tracks all significant actions by User

## Normalization

The schema follows 3NF (Third Normal Form):
- No transitive dependencies
- All foreign keys properly defined
- Junction tables for many-to-many relationships
- Unique constraints where appropriate
- Indexes on foreign keys and frequently queried fields
