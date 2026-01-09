import { test, expect } from '@playwright/test';

// Test credentials from seed.sql
const TEST_USERS = {
  admin: {
    email: 'admin@example.com',
    password: 'adminpassword123',
    firstName: 'Admin',
  },
  student: {
    email: 'student@example.com',
    password: 'studentpassword123',
    firstName: 'Test',
  },
  unconfirmed: {
    email: 'unconfirmed@example.com',
    password: 'unconfirmedpassword123',
    firstName: 'Unconfirmed',
  },
};

test.describe('Login Page', () => {
  test('shows login form', async ({ page }) => {
    await page.goto('/login');

    await expect(page.locator('h1')).toContainText('Log in to your account');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText('Log In');
  });

  test('successful login redirects to welcome page (student)', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[type="email"]', TEST_USERS.student.email);
    await page.fill('input[type="password"]', TEST_USERS.student.password);
    await page.click('button[type="submit"]');

    // Wait for either redirect or error
    await Promise.race([
      expect(page).toHaveURL('/chapter/welcome', { timeout: 15000 }),
      page.waitForSelector('text=Incorrect email or password', { timeout: 15000 }).then(() => {
        throw new Error('Login failed - check that database is seeded with test users (run: supabase db reset)');
      }),
    ]);
  });

  test('successful login redirects to welcome page (admin)', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[type="email"]', TEST_USERS.admin.email);
    await page.fill('input[type="password"]', TEST_USERS.admin.password);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/chapter/welcome', { timeout: 15000 });

    // Check that the user is logged in as admin
    await expect(page.locator('text=Admin')).toBeVisible();
  });

  test('wrong password shows error message', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[type="email"]', TEST_USERS.student.email);
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('text=Incorrect email or password')).toBeVisible({ timeout: 5000 });

    // Should stay on login page
    await expect(page).toHaveURL('/login');
  });

  test('non-existent email shows error message', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[type="email"]', 'nonexistent@example.com');
    await page.fill('input[type="password"]', 'somepassword');
    await page.click('button[type="submit"]');

    // Should show error (same message as wrong password for security)
    await expect(page.locator('text=Incorrect email or password')).toBeVisible({ timeout: 5000 });

    // Should stay on login page
    await expect(page).toHaveURL('/login');
  });

  test('unconfirmed email shows confirmation required message', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[type="email"]', TEST_USERS.unconfirmed.email);
    await page.fill('input[type="password"]', TEST_USERS.unconfirmed.password);
    await page.click('button[type="submit"]');

    // Should show email not confirmed error with resend option
    await expect(page.locator('text=Please check your email')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Resend confirmation email')).toBeVisible();

    // Should stay on login page
    await expect(page).toHaveURL('/login');
  });

  test('forgot password link is visible and navigates correctly', async ({ page }) => {
    await page.goto('/login');

    const forgotLink = page.locator('a[href="/forgot-password"]');
    await expect(forgotLink).toBeVisible();
    await forgotLink.click();

    await expect(page).toHaveURL('/forgot-password');
  });

  test('create account link navigates to signup', async ({ page }) => {
    await page.goto('/login');

    await page.click('text=Create account');
    await expect(page).toHaveURL('/signup');
  });
});

// each test gets a fresh browser context
test.describe('Protected Routes', () => {
  test('account page redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/account');

    // Should redirect to login
    await expect(page).toHaveURL('/login', { timeout: 5000 });
  });
});
