# WorkFlowOS - Testing Guide

## Testing Strategy

WorkFlowOS uses a multi-layered testing approach:

1. **Unit Tests** - Backend services and guards
2. **Integration Tests** - API endpoints (ready for implementation)
3. **E2E Tests** - Frontend user flows (configured, ready for implementation)

## Backend Testing

### Framework
- **Jest** - Test runner and assertion library
- **@nestjs/testing** - NestJS testing utilities

### Running Tests

```bash
cd apps/api

# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:cov

# Run specific test file
npm run test -- auth.service.spec.ts
```

### Test Structure

Tests are located alongside the source code in `__tests__` directories:

```
apps/api/src/
├── auth/__tests__/
│   └── auth.service.spec.ts
├── approvals/__tests__/
│   └── approvals.service.spec.ts
├── tasks/__tests__/
│   └── tasks.service.spec.ts
└── common/__tests__/
    └── permissions.guard.spec.ts
```

### Example: Service Test

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from '../tasks.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('TasksService', () => {
  let service: TasksService;

  const mockPrisma = {
    task: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  it('should create task', async () => {
    mockPrisma.task.create.mockResolvedValue({
      id: 'task-1',
      title: 'Test Task',
    });

    const result = await service.create({ title: 'Test Task' }, 'user-1', 'ws-1');
    expect(result.id).toBe('task-1');
  });
});
```

### Example: Guard Test

```typescript
import { PermissionsGuard } from '../guards/permissions.guard';
import { Reflector } from '@nestjs/core';

describe('PermissionsGuard', () => {
  let guard: PermissionsGuard;

  it('should allow access when user has permission', () => {
    const context = mockContext({ permissions: ['manage_users'] });
    reflector.getAllAndOverride.mockReturnValue(['manage_users']);
    
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw when user lacks permission', () => {
    const context = mockContext({ permissions: ['view_only'] });
    reflector.getAllAndOverride.mockReturnValue(['manage_users']);
    
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
```

### Current Test Coverage

```
Test Suites: 4 passed, 4 total
Tests:       13 passed, 13 total
```

**Covered:**
- `AuthService` - Register, login, token generation
- `TasksService` - Create task with project validation
- `ApprovalsService` - Create approval with validation
- `PermissionsGuard` - Permission checking logic

**Not Yet Covered:**
- UsersService
- TeamsService
- ProjectsService
- RequestsService
- IncidentsService
- NotificationsService
- AuditLogService

### Mocking Prisma

Always mock PrismaService in unit tests:

```typescript
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  // ... other models
};
```

## Frontend Testing

### Framework
- **Vitest** - Unit tests for components and hooks
- **Playwright** - E2E tests for user flows

### Running Tests

```bash
cd apps/web

# Run unit tests
npm run test

# Run tests in watch mode
npm run test:ui

# Run E2E tests
npm run test:e2e
```

### Configuration

**Vitest** (`vitest.config.ts`):
```typescript
{
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  }
}
```

**Playwright** (`playwright.config.ts`):
```typescript
{
  testDir: './src/e2e',
  use: {
    baseURL: 'http://localhost:3000',
  },
  webServer: {
    command: 'npm run dev',
    port: 3000,
  }
}
```

### Example: Component Test (Ready to Implement)

```typescript
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Click</Button>);
    screen.getByText('Click').click();
    expect(onClick).toHaveBeenCalled();
  });
});
```

### Example: E2E Test (Ready to Implement)

```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should login successfully', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'TestPass123!');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('should show error on invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[name="email"]', 'wrong@example.com');
    await page.fill('input[name="password"]', 'wrongpass');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('.text-destructive')).toBeVisible();
  });
});
```

## Integration Tests (API)

Integration tests verify API endpoints with actual HTTP requests (not yet implemented, structure ready).

**Setup:**
```typescript
// test/setup.ts
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';

let app: INestApplication;

beforeAll(async () => {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleRef.createNestApplication();
  await app.init();
});

afterAll(async () => {
  await app.close();
});

export { app, request };
```

**Example Test:**
```typescript
import { app, request } from '../setup';

describe('POST /auth/login', () => {
  it('should return tokens on valid credentials', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'TestPass123!',
      })
      .expect(200);

    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
    expect(response.body.user.email).toBe('test@example.com');
  });

  it('should return 401 on invalid credentials', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'wrong@example.com',
        password: 'wrongpass',
      })
      .expect(401);
  });
});
```

## Test Coverage Goals

### Backend
- [ ] 80%+ coverage for services
- [ ] 100% coverage for guards
- [ ] Integration tests for all API endpoints
- [ ] Error case testing

### Frontend
- [ ] 70%+ coverage for components
- [ ] 90%+ coverage for hooks and utilities
- [ ] E2E tests for critical user flows:
  - [ ] Login/Logout
  - [ ] Create task
  - [ ] Assign task
  - [ ] Submit request
  - [ ] Approve/Reject request
  - [ ] Create incident

## Best Practices

1. **Isolate Tests**: Mock external dependencies (database, APIs)
2. **Test Behavior**: Test what the code does, not how it does it
3. **Use Descriptive Names**: `should create task when project exists`
4. **Arrange-Act-Assert**: Structure tests clearly
5. **One Assertion Per Test**: Keep tests focused
6. **Test Edge Cases**: Invalid inputs, missing data, authorization failures
7. **Keep Tests Fast**: Mock database calls, avoid actual I/O
8. **Clean Up**: Reset mocks between tests

## Continuous Integration

Tests run automatically on every push via GitHub Actions:

```yaml
# .github/workflows/ci.yml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install dependencies
        run: npm ci
      - name: Run API tests
        run: cd apps/api && npm run test
      - name: Run API lint
        run: cd apps/api && npm run lint
      - name: Build API
        run: cd apps/api && npm run build
```

## Debugging Tests

### VSCode Configuration

```json
// .vscode/launch.json
{
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Jest Tests",
      "program": "${workspaceFolder}/apps/api/node_modules/.bin/jest",
      "args": ["--runInBand"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

### Running Individual Tests

```bash
# Run specific test file
npm run test -- auth.service.spec.ts

# Run tests matching pattern
npm run test -- --testNamePattern="should create task"

# Run with verbose output
npm run test -- --verbose
```

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
