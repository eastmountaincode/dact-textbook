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

  test('logged in user is redirected away from login page', async ({ page }) => {
    // 1. Log in as student
    await page.goto('/login');
    await page.fill('input[type="email"]', TEST_USERS.student.email);
    await page.fill('input[type="password"]', TEST_USERS.student.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/chapter/welcome', { timeout: 15000 });

    // 2. Try to go to login page while logged in
    await page.goto('/login');

    // 3. Should be redirected back to welcome (logged in users can't access login page)
    await expect(page).toHaveURL('/chapter/welcome', { timeout: 15000 });
  });

  test('first name is consistent in header after page reload', async ({ page }) => {
    // 1. Log in as student
    await page.goto('/login');
    await page.fill('input[type="email"]', TEST_USERS.student.email);
    await page.fill('input[type="password"]', TEST_USERS.student.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/chapter/welcome', { timeout: 15000 });

    // 2. Verify first name shows in header on textbook page (not email prefix)
    const headerName = page.locator('header').getByText(TEST_USERS.student.firstName);
    await expect(headerName).toBeVisible();

    // 3. Reload the page (simulates browser refresh)
    await page.reload();
    await page.waitForLoadState('networkidle');

    // 4. After full page reload, auth state should be restored from cookies
    // and profile should be fetched from database
    // First name should still be visible (profile.first_name from DB)
    await expect(headerName).toBeVisible({ timeout: 10000 });

    // 5. Ensure it's NOT showing the email prefix (lowercase "student")
    const emailPrefix = page.locator('header').getByText('student', { exact: true });
    await expect(emailPrefix).not.toBeVisible();
  });

  test('logout works from textbook page', async ({ page }) => {
    // 1. Log in as student
    await page.goto('/login');
    await page.fill('input[type="email"]', TEST_USERS.student.email);
    await page.fill('input[type="password"]', TEST_USERS.student.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/chapter/welcome', { timeout: 15000 });

    // 2. Click the account menu button
    await page.locator('header button').filter({ hasText: /Test|student/i }).click();

    // 3. Click Log Out
    await page.click('text=Log Out');

    // 4. Should be logged out - header should show Log In button
    await expect(page.locator('header a[href="/login"]')).toBeVisible({ timeout: 10000 });
  });

  test('logout state persists when navigating between pages', async ({ page }) => {
    // 1. Log in as student
    await page.goto('/login');
    await page.fill('input[type="email"]', TEST_USERS.student.email);
    await page.fill('input[type="password"]', TEST_USERS.student.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/chapter/welcome', { timeout: 15000 });

    // 2. Click the account menu button and log out
    await page.locator('header button').filter({ hasText: /Test|student/i }).click();
    await page.click('text=Log Out');

    // 3. Verify logged out - should be on login page with login button visible
    await expect(page).toHaveURL('/login', { timeout: 10000 });
    await expect(page.locator('header a[href="/login"]')).toBeVisible({ timeout: 10000 });

    // 4. Navigate to textbook area
    await page.goto('/chapter/welcome');

    // 5. Verify STILL logged out - header should show Log In button, not user name
    await expect(page.locator('header a[href="/login"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('header button').filter({ hasText: /Test|student/i })).not.toBeVisible();
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
