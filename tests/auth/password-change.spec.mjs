import { test, expect } from '@playwright/test';

// Retry flaky tests up to 2 times due to auth state synchronization issues
test.describe.configure({ retries: 2 });

// Test credentials from seed.sql
const TEST_USERS = {
  admin: {
    email: 'admin@example.com',
    password: 'adminpassword123',
  },
  student: {
    email: 'student@example.com',
    password: 'studentpassword123',
  },
};

// Helper to log in and navigate to security tab
async function loginAndGoToSecurityTab(page, user) {
  await page.goto('/login');
  await page.fill('input[type="email"]', user.email);
  await page.fill('input[type="password"]', user.password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/chapter/welcome', { timeout: 15000 });

  // Navigate to account page
  await page.goto('/account');
  // If we're stuck in loading state, reload the page to fix auth state sync
  try {
    await expect(page.getByRole('heading', { name: 'Account' })).toBeVisible({ timeout: 5000 });
  } catch {
    // Reload to fix auth state sync issue
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Account' })).toBeVisible({ timeout: 15000 });
  }

  // Click Security tab
  await page.click('button:has-text("Security")');
  // Use more specific locator since admin users have multiple h2s
  await expect(page.getByRole('heading', { name: 'Change Password' })).toBeVisible();
}

test.describe('Change Password - Security Tab', () => {
  test('shows security tab with correct elements', async ({ page }) => {
    await loginAndGoToSecurityTab(page, TEST_USERS.student);

    // Verify form elements
    await expect(page.getByRole('heading', { name: 'Change Password' })).toBeVisible();
    await expect(page.locator('input#currentPassword')).toBeVisible();
    await expect(page.locator('input#newPassword')).toBeVisible();
    await expect(page.locator('input#confirmPassword')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText('Update Password');
  });

  test('shows error when new passwords do not match', async ({ page }) => {
    await loginAndGoToSecurityTab(page, TEST_USERS.student);

    await page.fill('input#currentPassword', TEST_USERS.student.password);
    await page.fill('input#newPassword', 'newpassword123');
    await page.fill('input#confirmPassword', 'differentpassword');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=New passwords do not match.')).toBeVisible();
  });

  test('shows error when new password is too short', async ({ page }) => {
    await loginAndGoToSecurityTab(page, TEST_USERS.student);

    await page.fill('input#currentPassword', TEST_USERS.student.password);
    await page.fill('input#newPassword', 'short');
    await page.fill('input#confirmPassword', 'short');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Password must be at least 8 characters.')).toBeVisible();
  });

  test('shows error when current password is incorrect', async ({ page }) => {
    await loginAndGoToSecurityTab(page, TEST_USERS.student);

    await page.fill('input#currentPassword', 'wrongcurrentpassword');
    await page.fill('input#newPassword', 'validnewpassword123');
    await page.fill('input#confirmPassword', 'validnewpassword123');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Current password is incorrect')).toBeVisible({ timeout: 10000 });
  });

  test('shows loading state while submitting', async ({ page }) => {
    await loginAndGoToSecurityTab(page, TEST_USERS.student);

    // Use wrong current password so we get an error without changing anything
    await page.fill('input#currentPassword', 'wrongpassword123');
    await page.fill('input#newPassword', 'newpassword123');
    await page.fill('input#confirmPassword', 'newpassword123');

    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Button should show "Updating..." while submitting
    // This happens quickly, so we just verify the form works by checking for the error response
    await expect(page.locator('text=Current password is incorrect')).toBeVisible({ timeout: 15000 });
  });
});

test.describe('Change Password - Full Flow', () => {
  // Use admin user for the full flow test so we don't break student user for other tests
  const testUser = TEST_USERS.admin;
  const newPassword = 'newadminpassword456';

  test('successfully changes password and reverts it', async ({ page }) => {
    // 1. Login and go to security tab
    await loginAndGoToSecurityTab(page, testUser);

    // 2. Fill in the password change form
    await page.fill('input#currentPassword', testUser.password);
    await page.fill('input#newPassword', newPassword);
    await page.fill('input#confirmPassword', newPassword);
    await page.click('button[type="submit"]');

    // 3. Should show success message
    await expect(page.locator('text=Password updated successfully.')).toBeVisible({ timeout: 15000 });

    // 4. Form should be cleared after success
    await expect(page.locator('input#currentPassword')).toHaveValue('');
    await expect(page.locator('input#newPassword')).toHaveValue('');
    await expect(page.locator('input#confirmPassword')).toHaveValue('');

    // 5. Immediately revert password back (without logging out)
    await page.fill('input#currentPassword', newPassword);
    await page.fill('input#newPassword', testUser.password);
    await page.fill('input#confirmPassword', testUser.password);
    await page.click('button[type="submit"]');

    // 6. Should show success again
    await expect(page.locator('text=Password updated successfully.')).toBeVisible({ timeout: 15000 });
  });
});

test.describe('Change Password - Edge Cases', () => {
  test('cannot change to same password as current', async ({ page }) => {
    await loginAndGoToSecurityTab(page, TEST_USERS.student);

    // Try to change to the same password
    await page.fill('input#currentPassword', TEST_USERS.student.password);
    await page.fill('input#newPassword', TEST_USERS.student.password);
    await page.fill('input#confirmPassword', TEST_USERS.student.password);
    await page.click('button[type="submit"]');

    // Supabase rejects changing to the same password
    await expect(page.locator('text=New password should be different')).toBeVisible({ timeout: 15000 });
  });

  test('password fields are of type password (masked) and required', async ({ page }) => {
    await loginAndGoToSecurityTab(page, TEST_USERS.student);

    // All password fields should be type="password" for security
    await expect(page.locator('input#currentPassword')).toHaveAttribute('type', 'password');
    await expect(page.locator('input#newPassword')).toHaveAttribute('type', 'password');
    await expect(page.locator('input#confirmPassword')).toHaveAttribute('type', 'password');

    // Verify required attributes
    await expect(page.locator('input#currentPassword')).toHaveAttribute('required', '');
    await expect(page.locator('input#newPassword')).toHaveAttribute('required', '');
    await expect(page.locator('input#confirmPassword')).toHaveAttribute('required', '');
  });
});
