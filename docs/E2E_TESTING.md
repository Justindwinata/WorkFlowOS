# WorkFlowOS - E2E Testing

## Overview

End-to-end tests using Playwright to verify critical user flows.

## Test Structure

```
apps/web/src/e2e/
├── workflow.e2e.ts      # Main workflow tests
```

## Test Coverage

### Authentication Flow
- Login with valid credentials
- Login with invalid credentials (error display)
- Register new user
- Session restore on page reload
- Logout

### Navigation
- Dashboard → Users
- Dashboard → Tasks
- Dashboard → Projects
- Dashboard → Requests
- Dashboard → Incidents
- Dashboard → Approvals
- Dashboard → SLA
- Dashboard → Notifications
- Dashboard → Audit Log
- Dashboard → Settings

### Task Workflow
- Create task
- Assign task to user
- Change task status (backlog → todo → in_progress → review → done)
- Add comment to task
- Add label to task

### Request Workflow
- Create request (IT Access, Laptop, Software, etc.)
- Submit for approval
- Approve/Reject request
- View approval history

### Incident Workflow
- Create incident
- Assign incident
- Update severity/priority
- Resolve/close incident
- SLA breach notification

### Approval Workflow
- View pending approvals
- Approve request
- Reject request
- Request changes

### SLA Enforcement
- View SLA definitions
- Check SLA breach status
- View SLA-at-risk items on dashboard

### Notifications
- View notifications
- Mark as read
- Mark all as read
- Real-time SSE stream

### Audit Log
- View audit log
- Filter by entity/action

## Running Tests

### Prerequisites
- Backend running on `http://localhost:3001`
- Database seeded with test data
- Frontend built and running on `http://localhost:3000`

### Run E2E Tests
```bash
cd apps/web
npm run test:e2e
```

### Run with UI
```bash
cd apps/web
npx playwright test --ui
```

### Debug Mode
```bash
cd apps/web
npx playwright test --debug
```

## Test Data Setup

Tests require seeded database:
```bash
cd apps/api
npm run seed
```

Test users created:
- `admin@workflowos.id` / `Admin123!` (Admin)
- `manager@workflowos.id` / `Admin123!` (Manager)
- `user@workflowos.id` / `Admin123!` (Member)

## CI Integration

GitHub Actions runs E2E tests on pull requests:
```yaml
- name: Run E2E Tests
  run: |
    cd apps/web
    npm run test:e2e
```

## Best Practices

1. **Test Independence**: Each test can run independently
2. **Data Cleanup**: Tests clean up created data
3. **Explicit Waits**: Use `waitForSelector` instead of arbitrary waits
4. **Page Object Pattern**: For complex pages (optional)
5. **Retry Logic**: Built-in retry on CI