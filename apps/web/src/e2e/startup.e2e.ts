import { test, expect } from '@playwright/test';

test.describe('WorkFlowOS Startup Flow', () => {
  test('unauthenticated user lands on splash, then redirects to login', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.locator('text=Memverifikasi sesi...')).toBeVisible({ timeout: 5000 });
    await expect(page).toHaveURL('/login', { timeout: 15000 });
  });

  test('authenticated user lands on splash, then redirects to dashboard', async ({ page, context }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@workflowos.id');
    await page.fill('input[name="password"]', 'Admin123!');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/dashboard', { timeout: 15000 });
    
    await page.goto('/');
    await expect(page.locator('text=Mengalihkan...')).toBeVisible({ timeout: 5000 });
    await expect(page).toHaveURL('/dashboard', { timeout: 15000 });
  });

  test('authenticated user cannot access login page (redirected to dashboard)', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@workflowos.id');
    await page.fill('input[name="password"]', 'Admin123!');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/dashboard', { timeout: 15000 });
    
    await page.goto('/login');
    await expect(page).toHaveURL('/dashboard', { timeout: 15000 });
  });

  test('authenticated user cannot access register page (redirected to dashboard)', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@workflowos.id');
    await page.fill('input[name="password"]', 'Admin123!');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/dashboard', { timeout: 15000 });
    
    await page.goto('/register');
    await expect(page).toHaveURL('/dashboard', { timeout: 15000 });
  });

  test('session persists after page refresh', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@workflowos.id');
    await page.fill('input[name="password"]', 'Admin123!');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/dashboard', { timeout: 15000 });
    
    await page.reload();
    await expect(page).toHaveURL('/dashboard', { timeout: 15000 });
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('logout clears session and redirects to login', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@workflowos.id');
    await page.fill('input[name="password"]', 'Admin123!');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/dashboard', { timeout: 15000 });
    
    await page.click('button[title="Logout"]');
    await expect(page).toHaveURL('/login', { timeout: 10000 });
    
    await page.goto('/');
    await expect(page).toHaveURL('/login', { timeout: 15000 });
  });
});