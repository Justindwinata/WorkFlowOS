import { test, expect } from '@playwright/test';

test.describe('Real Runtime User Flow Verification', () => {
  test('root redirects unauthenticated user to login', async ({ page }) => {
    await page.goto('/');
    
    // Brief startup state shown, then redirects to login
    await expect(page).toHaveURL(/.*login/, { timeout: 20000 });
    
    // Login form actually visible
    await expect(page.locator('input[name="email"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input[name="password"]')).toBeVisible({ timeout: 10000 });
  });

  test('full login flow reaches dashboard', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/.*login/, { timeout: 20000 });

    await page.fill('input[name="email"]', 'admin@workflowos.id');
    await page.fill('input[name="password"]', 'Admin123!');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*dashboard/, { timeout: 20000 });
    await expect(page.locator('text=Tugas Saya')).toBeVisible({ timeout: 15000 });
  });

  test('session persists across refresh', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@workflowos.id');
    await page.fill('input[name="password"]', 'Admin123!');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*dashboard/, { timeout: 20000 });

    await page.reload();
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 20000 });
    await expect(page.locator('text=Tugas Saya')).toBeVisible({ timeout: 15000 });
  });

  test('logout clears session and returns to login', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@workflowos.id');
    await page.fill('input[name="password"]', 'Admin123!');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*dashboard/, { timeout: 20000 });

    await page.click('button[title="Logout"]');
    await expect(page).toHaveURL(/.*login/, { timeout: 15000 });
  });

  test('protected routes redirect logged-out users to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*login/, { timeout: 15000 });

    await page.goto('/tasks');
    await expect(page).toHaveURL(/.*login/, { timeout: 15000 });
  });

  test('authenticated user cannot access login page', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@workflowos.id');
    await page.fill('input[name="password"]', 'Admin123!');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*dashboard/, { timeout: 20000 });

    await page.goto('/login');
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });
  });
});