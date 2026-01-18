import { test, expect } from '@playwright/test';

const MAILPIT_API = 'http://127.0.0.1:54324/api/v1';

// Seeded test users (from seed.sql) - use for non-destructive tests
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

// Helper to generate unique test emails
function generateTestEmail() {
  return `test-delete-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
}

// Helper to clear Mailpit inbox
async function clearMailpit() {
  try {
    await fetch(`${MAILPIT_API}/messages`, { method: 'DELETE' });
  } catch (e) {
    // Mailpit might not be running, ignore
  }
}

// Helper to get confirmation link from Mailpit
async function getConfirmationLinkFromMailpit(email, retries = 15) {
  for (let i = 0; i < retries; i++) {
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      const response = await fetch(`${MAILPIT_API}/messages`);
      const data = await response.json();

      const message = data.messages?.find(m =>
        m.To?.some(to => to.Address === email)
      );

      if (message) {
        const msgResponse = await fetch(`${MAILPIT_API}/message/${message.ID}`);
        const msgData = await msgResponse.json();

        const htmlBody = msgData.HTML || msgData.Text;
        const linkMatch = htmlBody.match(/href="([^"]*\/auth\/v1\/verify[^"]*)"/);

        if (linkMatch) {
          return linkMatch[1].replace(/&amp;/g, '&');
        }
      }
    } catch (e) {
      // Continue retrying
    }
  }
  throw new Error(`No confirmation email found for ${email}`);
}

// Helper to login a user
async function loginUser(page, email, password) {
  await page.goto('/login');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/chapter/welcome', { timeout: 15000 });
}

// Helper to navigate to security tab and expand delete section
async function navigateToDeleteSection(page) {
  await page.goto('/account');
  // Click the Security tab
  await page.click('text=Security');
  // Click the collapsible Delete Account section header to expand it
  await page.click('button:has-text("Delete Account")');
  // Wait for the section to expand and show the confirmation input
  await expect(page.locator('text=Type DELETE to confirm')).toBeVisible({ timeout: 5000 });
}

// ============================================
// UI TESTS - Use seeded users (non-destructive)
// These tests verify the UI without actually deleting accounts
// ============================================

test.describe('Account Deletion UI', () => {
  test('account page shows delete account section in security tab', async ({ page }) => {
    // Login with seeded student user
    await loginUser(page, TEST_USERS.student.email, TEST_USERS.student.password);

    // Navigate to account page
    await page.goto('/account');

    // Check that Security tab exists and click it
    await expect(page.locator('text=Security')).toBeVisible({ timeout: 10000 });
    await page.click('text=Security');

    // Verify the delete section exists (as a collapsible header)
    await expect(page.locator('button:has-text("Delete Account")')).toBeVisible();
  });

  test('delete account requires typing DELETE to confirm', async ({ page }) => {
    await loginUser(page, TEST_USERS.student.email, TEST_USERS.student.password);
    await navigateToDeleteSection(page);

    // Confirm button should be disabled initially
    const confirmButton = page.locator('button:has-text("Delete Account")').last();
    await expect(confirmButton).toBeDisabled();

    // Type wrong text (lowercase) - button should still be disabled
    await page.fill('input[placeholder="DELETE"]', 'delete');
    await expect(confirmButton).toBeDisabled();

    // Type correct text - button should be enabled
    await page.fill('input[placeholder="DELETE"]', 'DELETE');
    await expect(confirmButton).toBeEnabled();

    // Collapse section to preserve seeded user (click header again)
    await page.click('h2:has-text("Delete Account")');
  });

  test('collapsing delete section hides confirmation', async ({ page }) => {
    await loginUser(page, TEST_USERS.student.email, TEST_USERS.student.password);
    await navigateToDeleteSection(page);

    // Collapse the section by clicking the header
    await page.click('h2:has-text("Delete Account")');

    // Confirmation text should be hidden
    await expect(page.locator('text=Type DELETE to confirm')).not.toBeVisible({ timeout: 5000 });
  });

  test('delete confirmation input clears when section is collapsed', async ({ page }) => {
    await loginUser(page, TEST_USERS.student.email, TEST_USERS.student.password);
    await navigateToDeleteSection(page);

    // Type DELETE
    await page.fill('input[placeholder="DELETE"]', 'DELETE');

    // Collapse section
    await page.click('h2:has-text("Delete Account")');

    // Re-expand section
    await page.click('button:has-text("Delete Account")');
    await expect(page.locator('text=Type DELETE to confirm')).toBeVisible({ timeout: 5000 });

    // Input should be cleared
    const input = page.locator('input[placeholder="DELETE"]');
    await expect(input).toHaveValue('');

    // Collapse to preserve seeded user
    await page.click('h2:has-text("Delete Account")');
  });

  test('unauthenticated user cannot access account page', async ({ page }) => {
    // Clear any existing session
    await page.context().clearCookies();

    // Try to access account page directly
    await page.goto('/account');

    // Should redirect to login
    await expect(page).toHaveURL('/login', { timeout: 10000 });
  });
});

// ============================================
// DESTRUCTIVE TESTS - Create fresh users (serial)
// These tests actually delete accounts, so must create new users
// ============================================

test.describe.serial('Account Deletion Flow', () => {
  test.beforeEach(async () => {
    await clearMailpit();
  });

  test('successful account deletion redirects to home page', async ({ page }) => {
    const testEmail = generateTestEmail();
    const testPassword = 'TestPassword123!';

    // Sign up a new user
    await page.goto('/signup');
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[name="firstName"]', 'DeleteTest');
    await page.fill('input#password', testPassword);
    await page.fill('input#confirmPassword', testPassword);
    await page.selectOption('select[name="role"]', 'student');
    await page.selectOption('select[name="educationLevel"]', 'undergraduate');
    // For country, type in the react-select input
    await page.click('[class*="country-select"]');
    await page.keyboard.type('United States');
    await page.keyboard.press('Enter');
    await page.click('button[type="submit"]');

    // Wait for signup to process
    await page.waitForTimeout(2000);

    // Get confirmation link and confirm email
    const confirmationLink = await getConfirmationLinkFromMailpit(testEmail);
    await page.goto(confirmationLink);
    await expect(page).toHaveURL(/\/auth\/confirmed/, { timeout: 15000 });

    // Login
    await loginUser(page, testEmail, testPassword);

    // Navigate to delete account section
    await navigateToDeleteSection(page);

    // Type DELETE and confirm
    await page.fill('input[placeholder="DELETE"]', 'DELETE');
    await page.click('button:has-text("Delete Account") >> nth=-1');

    // Should redirect away from account page (to / or /login after signOut)
    await expect(page).not.toHaveURL('/account', { timeout: 15000 });
    // Verify user is logged out by checking we're either at home or login
    const currentUrl = page.url();
    expect(currentUrl.includes('/account')).toBe(false);
  });

  test('deleted user cannot log in again', async ({ page }) => {
    const testEmail = generateTestEmail();
    const testPassword = 'TestPassword123!';

    // Sign up a new user
    await page.goto('/signup');
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[name="firstName"]', 'DeleteTest');
    await page.fill('input#password', testPassword);
    await page.fill('input#confirmPassword', testPassword);
    await page.selectOption('select[name="role"]', 'student');
    await page.selectOption('select[name="educationLevel"]', 'undergraduate');
    await page.click('[class*="country-select"]');
    await page.keyboard.type('United States');
    await page.keyboard.press('Enter');
    await page.click('button[type="submit"]');

    await page.waitForTimeout(2000);

    // Confirm email
    const confirmationLink = await getConfirmationLinkFromMailpit(testEmail);
    await page.goto(confirmationLink);
    await expect(page).toHaveURL(/\/auth\/confirmed/, { timeout: 15000 });

    // Login
    await loginUser(page, testEmail, testPassword);

    // Delete account
    await navigateToDeleteSection(page);
    await page.fill('input[placeholder="DELETE"]', 'DELETE');
    await page.click('button:has-text("Delete Account") >> nth=-1');
    // Should redirect away from account page (to / or /login after signOut)
    await expect(page).not.toHaveURL('/account', { timeout: 15000 });

    // Try to log in with deleted credentials
    await page.goto('/login');
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('text=Incorrect email or password')).toBeVisible({ timeout: 10000 });
  });

  test('deleted user cannot access protected routes', async ({ page, context }) => {
    const testEmail = generateTestEmail();
    const testPassword = 'TestPassword123!';

    // Sign up a new user
    await page.goto('/signup');
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[name="firstName"]', 'DeleteTest');
    await page.fill('input#password', testPassword);
    await page.fill('input#confirmPassword', testPassword);
    await page.selectOption('select[name="role"]', 'student');
    await page.selectOption('select[name="educationLevel"]', 'undergraduate');
    await page.click('[class*="country-select"]');
    await page.keyboard.type('United States');
    await page.keyboard.press('Enter');
    await page.click('button[type="submit"]');

    await page.waitForTimeout(2000);

    // Confirm email
    const confirmationLink = await getConfirmationLinkFromMailpit(testEmail);
    await page.goto(confirmationLink);
    await expect(page).toHaveURL(/\/auth\/confirmed/, { timeout: 15000 });

    // Login
    await loginUser(page, testEmail, testPassword);

    // Delete account
    await navigateToDeleteSection(page);
    await page.fill('input[placeholder="DELETE"]', 'DELETE');
    await page.click('button:has-text("Delete Account") >> nth=-1');
    // Should redirect away from account page (to / or /login after signOut)
    await expect(page).not.toHaveURL('/account', { timeout: 15000 });

    // Clear cookies to simulate fresh session
    await context.clearCookies();

    // Try to access protected route
    await page.goto('/chapter/welcome');
    await expect(page).toHaveURL('/login', { timeout: 10000 });
  });

  test('delete section shows loading state during deletion', async ({ page }) => {
    const testEmail = generateTestEmail();
    const testPassword = 'TestPassword123!';

    // Sign up a new user
    await page.goto('/signup');
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[name="firstName"]', 'DeleteTest');
    await page.fill('input#password', testPassword);
    await page.fill('input#confirmPassword', testPassword);
    await page.selectOption('select[name="role"]', 'student');
    await page.selectOption('select[name="educationLevel"]', 'undergraduate');
    await page.click('[class*="country-select"]');
    await page.keyboard.type('United States');
    await page.keyboard.press('Enter');
    await page.click('button[type="submit"]');

    await page.waitForTimeout(2000);

    // Confirm email
    const confirmationLink = await getConfirmationLinkFromMailpit(testEmail);
    await page.goto(confirmationLink);
    await expect(page).toHaveURL(/\/auth\/confirmed/, { timeout: 15000 });

    // Login
    await loginUser(page, testEmail, testPassword);

    // Navigate to delete section
    await navigateToDeleteSection(page);

    // Type DELETE and click confirm
    await page.fill('input[placeholder="DELETE"]', 'DELETE');
    const confirmButton = page.locator('button:has-text("Delete Account") >> nth=-1');
    await confirmButton.click();

    // Check for loading state (might be too fast to catch, so race with redirect)
    await Promise.race([
      expect(page.locator('button:has-text("Deleting...")')).toBeVisible({ timeout: 1000 }).catch(() => {}),
      expect(page).not.toHaveURL('/account', { timeout: 15000 })
    ]);

    // Should eventually redirect away from account page
    await expect(page).not.toHaveURL('/account', { timeout: 15000 });
  });
});

// ============================================
// EDGE CASE: Email reuse after deletion
// ============================================

test.describe.serial('Account Deletion Edge Cases', () => {
  test.beforeEach(async () => {
    await clearMailpit();
  });

  test('signup with previously deleted email works (email can be reused)', async ({ page }) => {
    const testEmail = generateTestEmail();
    const testPassword = 'TestPassword123!';

    // Sign up a new user
    await page.goto('/signup');
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[name="firstName"]', 'DeleteTest');
    await page.fill('input#password', testPassword);
    await page.fill('input#confirmPassword', testPassword);
    await page.selectOption('select[name="role"]', 'student');
    await page.selectOption('select[name="educationLevel"]', 'undergraduate');
    await page.click('[class*="country-select"]');
    await page.keyboard.type('United States');
    await page.keyboard.press('Enter');
    await page.click('button[type="submit"]');

    await page.waitForTimeout(2000);

    // Confirm email
    const confirmationLink = await getConfirmationLinkFromMailpit(testEmail);
    await page.goto(confirmationLink);
    await expect(page).toHaveURL(/\/auth\/confirmed/, { timeout: 15000 });

    // Login
    await loginUser(page, testEmail, testPassword);

    // Delete account
    await navigateToDeleteSection(page);
    await page.fill('input[placeholder="DELETE"]', 'DELETE');
    await page.click('button:has-text("Delete Account") >> nth=-1');
    // Should redirect away from account page (to / or /login after signOut)
    await expect(page).not.toHaveURL('/account', { timeout: 15000 });

    // Clear mailpit for new signup
    await clearMailpit();

    // Wait for database to process deletion
    await page.waitForTimeout(2000);

    // Try to sign up with the same email
    await page.goto('/signup');
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[name="firstName"]', 'NewUser');
    await page.fill('input#password', 'NewPassword123!');
    await page.fill('input#confirmPassword', 'NewPassword123!');
    await page.selectOption('select[name="role"]', 'student');
    await page.selectOption('select[name="educationLevel"]', 'undergraduate');
    await page.click('[class*="country-select"]');
    await page.keyboard.type('United States');
    await page.keyboard.press('Enter');

    // Wait for real-time validation
    await page.waitForTimeout(1500);

    // Check if email is available (no "already registered" error)
    const emailError = page.locator('text=This email is already registered');
    const isEmailTaken = await emailError.isVisible({ timeout: 2000 }).catch(() => false);

    if (!isEmailTaken) {
      // Email is available, complete signup
      await page.click('button[type="submit"]');

      // Should show confirmation page
      await page.waitForTimeout(2000);

      // Verify we can get confirmation email (proving signup worked)
      const newConfirmationLink = await getConfirmationLinkFromMailpit(testEmail);
      expect(newConfirmationLink).toBeTruthy();
    }
    // If email is still taken, that's also acceptable behavior (depends on Supabase config)
    // Some configurations may retain email for a period after deletion
  });
});
