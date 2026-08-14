import { test, expect } from '@playwright/test';

test.describe('WorkFlowOS E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should login successfully', async ({ page }) => {
    await page.fill('input[name="email"]', 'integration@test.com');
    await page.fill('input[name="password"]', 'TestPass123!');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('should show error on invalid credentials', async ({ page }) => {
    await page.fill('input[name="email"]', 'wrong@test.com');
    await page.fill('input[name="password"]', 'wrongpass');
    await page.click('button[type="submit"]');

    await expect(page.locator('.text-destructive')).toBeVisible();
  });

  test('should navigate to users page after login', async ({ page }) => {
    await page.fill('input[name="email"]', 'integration@test.com');
    await page.fill('input[name="password"]', 'TestPass123!');
    await page.click('button[type="submit"]');

    await page.click('a[href="/users"]');
    await expect(page).toHaveURL('/users');
    await expect(page.locator('h1')).toContainText('Users');
  });

  test('should navigate to tasks page', async ({ page }) => {
    await page.fill('input[name="email"]', 'integration@test.com');
    await page.fill('input[name="password"]', 'TestPass123!');
    await page.click('button[type="submit"]');

    await page.click('a[href="/tasks"]');
    await expect(page).toHaveURL('/tasks');
    await expect(page.locator('h1')).toContainText('Tasks');
  });

  test('should create task', async ({ page }) => {
    await page.fill('input[name="email"]', 'integration@test.com');
    await page.fill('input[name="password"]', 'TestPass123!');
    await page.click('button[type="submit"]');

    await page.click('a[href="/tasks"]');
    await page.click('button:has-text("Buat Task")');
    // Task creation modal/form
    // Fill and submit
    // Verify task appears
  });

  test('should logout', async ({ page }) => {
    await page.fill('input[name="email"]', 'integration@test.com');
    await page.fill('input[name="password"]', 'TestPass123!');
    await page.click('button[type="submit"]');

    await page.click('button[title="Logout"]');
    await expect(page).toHaveURL('/login');
  });
});