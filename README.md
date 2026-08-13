# WorkFlowOS

Enterprise Work Management & Service Operations Platform

## Overview

WorkFlowOS is a comprehensive enterprise platform designed to centralize company work, tasks, requests, incidents, approvals, workflows, SLA monitoring, notifications, and audit activities.

## Target Users

- Employees
- Team Leads
- Managers
- Operations Teams
- IT Teams
- HR
- Finance
- Administrators

## Core Features

- **Dashboard**: Centralized view of work, tasks, incidents, and SLA status
- **Task Management**: Create, assign, track, and manage tasks with comments and labels
- **Request Management**: Internal requests (IT, HR, Finance, Procurement)
- **Incident Management**: Track and resolve incidents with SLA monitoring
- **Approval Workflows**: Configurable approval processes
- **Team & Project Management**: Organize work by teams and projects
- **Notifications**: Real-time in-app notifications
- **Audit Log**: Complete activity tracking
- **RBAC**: Role-based access control

## Tech Stack

### Frontend
- Next.js 14
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod
- TanStack Query

### Backend
- NestJS
- TypeScript
- REST API
- OpenAPI/Swagger

### Database
- PostgreSQL
- Prisma ORM

### Infrastructure
- Docker
- Docker Compose

## Architecture

```
apps/
  web/          # Next.js frontend
  api/          # NestJS backend

packages/
  ui/           # Shared UI components
  config/       # Shared configurations
  types/        # Shared TypeScript types

docker/         # Docker configurations
docs/           # Documentation
scripts/        # Utility scripts
```

## Getting Started

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15+

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/Justindwinata/WorkFlowOS.git
cd WorkFlowOS
```

2. Install dependencies:
```bash
npm install
```

3. Start infrastructure:
```bash
docker-compose up -d
```

4. Run migrations:
```bash
cd apps/api
npx prisma migrate dev
```

5. Start development servers:
```bash
# Terminal 1 - API
cd apps/api
npm run dev

# Terminal 2 - Web
cd apps/web
npm run dev
```

6. Access the application:
- Frontend: http://localhost:3000
- API: http://localhost:3001
- API Docs: http://localhost:3001/api

## Documentation

- [Product Requirements](./docs/PRODUCT_REQUIREMENTS.md)
- [System Architecture](./docs/SYSTEM_ARCHITECTURE.md)
- [Database ERD](./docs/ERD.md)
- [API Reference](./docs/API_REFERENCE.md)
- [Authentication](./docs/AUTHENTICATION.md)
- [Authorization](./docs/AUTHORIZATION.md)
- [Workflow Engine](./docs/WORKFLOW_ENGINE.md)
- [Testing](./docs/TESTING.md)

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

## License

MIT

## Repository

https://github.com/Justindwinata/WorkFlowOS.git
