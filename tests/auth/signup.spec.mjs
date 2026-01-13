import { test, expect } from '@playwright/test';

test.describe('Signup Page', () => {
  test('shows signup form with all fields', async ({ page }) => {
    await page.goto('/signup');

    await expect(page.locator('h1')).toContainText('Create account');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input#password')).toBeVisible();
    await expect(page.locator('input#confirmPassword')).toBeVisible();
    await expect(page.locator('input[name="firstName"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText('Create Account');
  });

  test('login link navigates to login page', async ({ page }) => {
    await page.goto('/signup');

    await page.click('text=Log in');
    await expect(page).toHaveURL('/login');
  });

  test('email already exists shows real-time error', async ({ page }) => {
    await page.goto('/signup');

    // Use existing seeded user email - debounced check triggers as you type
    await page.fill('input[type="email"]', 'student@example.com');

    // Should show real-time error message after debounce
    await expect(page.locator('text=This email is already registered')).toBeVisible();
  });

  test('password too weak shows real-time error', async ({ page }) => {
    await page.goto('/signup');

    await page.fill('input#password', '123'); // Too short

    // Should show real-time validation message under the field
    await expect(page.locator('p.text-red-600:text("Password must be at least 8 characters")')).toBeVisible();
  });

  test('passwords do not match shows real-time error', async ({ page }) => {
    await page.goto('/signup');

    await page.fill('input#password', 'Password123!');
    await page.fill('input#confirmPassword', 'Different123!');

    // Should show real-time validation message
    await expect(page.locator('p.text-red-600:text("Passwords do not match")')).toBeVisible();
  });
});
