import { test, expect } from '@playwright/test';

test.describe('WorkFlowOS Authentication', () => {
  test('register a new user', async ({ page }) => {
    await page.goto('/register');

    await page.fill('input[name="firstName"]', 'E2E');
    await page.fill('input[name="lastName"]', 'Tester');
    await page.fill('input[name="username"]', 'e2etester');
    await page.fill('input[name="email"]', 'e2e@test.com');
    await page.fill('input[name="password"]', 'TestPass123!');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard', { timeout: 15000 });
  });

  test('login successfully', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="email"]', 'admin@workflowos.id');
    await page.fill('input[name="password"]', 'Admin123!');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard', { timeout: 15000 });
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('show error on invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="email"]', 'wrong@test.com');
    await page.fill('input[name="password"]', 'wrongpass');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Login gagal')).toBeVisible({ timeout: 10000 });
  });

  test('logout', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@workflowos.id');
    await page.fill('input[name="password"]', 'Admin123!');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard', { timeout: 15000 });

    await page.click('button[title="Logout"]');
    await expect(page).toHaveURL('/login');
  });
});

test.describe('WorkFlowOS Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@workflowos.id');
    await page.fill('input[name="password"]', 'Admin123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard', { timeout: 15000 });
  });

  test('loads dashboard KPIs', async ({ page }) => {
    await expect(page.locator('text=Tugas Saya')).toBeVisible();
    await expect(page.locator('text=SLA At Risk')).toBeVisible();
  });
});

test.describe('WorkFlowOS Tasks', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@workflowos.id');
    await page.fill('input[name="password"]', 'Admin123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard', { timeout: 15000 });
  });

  test('navigates to tasks and views list', async ({ page }) => {
    await page.goto('/tasks');
    await expect(page.locator('h1')).toContainText('Tasks');
  });

  test('view task detail', async ({ page }) => {
    await page.goto('/tasks');
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();
    await expect(page.locator('text=Description')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('WorkFlowOS Requests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@workflowos.id');
    await page.fill('input[name="password"]', 'Admin123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard', { timeout: 15000 });
  });

  test('navigates to requests', async ({ page }) => {
    await page.goto('/requests');
    await expect(page.locator('h1')).toContainText('Requests');
  });
});

test.describe('WorkFlowOS Incidents', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@workflowos.id');
    await page.fill('input[name="password"]', 'Admin123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard', { timeout: 15000 });
  });

  test('navigates to incidents', async ({ page }) => {
    await page.goto('/incidents');
    await expect(page.locator('h1')).toContainText('Incidents');
  });
});

test.describe('WorkFlowOS Approvals', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@workflowos.id');
    await page.fill('input[name="password"]', 'Admin123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard', { timeout: 15000 });
  });

  test('navigates to approvals', async ({ page }) => {
    await page.goto('/approvals');
    await expect(page.locator('h1')).toContainText('Approvals');
  });
});

test.describe('WorkFlowOS SLA', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@workflowos.id');
    await page.fill('input[name="password"]', 'Admin123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard', { timeout: 15000 });
  });

  test('navigates to SLA monitoring', async ({ page }) => {
    await page.goto('/sla');
    await expect(page.locator('h1')).toContainText('SLA');
  });
});

test.describe('WorkFlowOS Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@workflowos.id');
    await page.fill('input[name="password"]', 'Admin123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard', { timeout: 15000 });
  });

  test('navigates to users', async ({ page }) => {
    await page.goto('/users');
    await expect(page.locator('h1')).toContainText('Users');
  });

  test('navigates to teams', async ({ page }) => {
    await page.goto('/teams');
    await expect(page.locator('h1')).toContainText('Teams');
  });

  test('navigates to notifications', async ({ page }) => {
    await page.goto('/notifications');
    await expect(page.locator('h1')).toContainText('Notifications');
  });

  test('navigates to audit log', async ({ page }) => {
    await page.goto('/audit-log');
    await expect(page.locator('h1')).toContainText('Audit Log');
  });
});
