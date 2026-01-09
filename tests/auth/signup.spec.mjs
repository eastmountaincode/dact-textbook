import { test, expect } from '@playwright/test';

const MAILPIT_API = 'http://127.0.0.1:54324/api/v1';

// Helper to get confirmation link from Mailpit
async function getConfirmationLinkFromMailpit(email) {
  // Wait a bit for email to arrive
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Get all messages
  const response = await fetch(`${MAILPIT_API}/messages`);
  const data = await response.json();

  // Find the confirmation email for this address
  const message = data.messages?.find(m =>
    m.To?.some(to => to.Address === email)
  );

  if (!message) {
    throw new Error(`No email found for ${email}`);
  }

  // Get the full message content
  const msgResponse = await fetch(`${MAILPIT_API}/message/${message.ID}`);
  const msgData = await msgResponse.json();

  // Extract confirmation link from HTML body
  // Supabase confirmation links look like: http://127.0.0.1:54321/auth/v1/verify?token=...&type=signup&redirect_to=...
  const htmlBody = msgData.HTML || msgData.Text;
  const linkMatch = htmlBody.match(/href="([^"]*\/auth\/v1\/verify[^"]*)"/);

  if (!linkMatch) {
    throw new Error('Could not find confirmation link in email');
  }

  // Decode HTML entities (e.g., &amp; -> &)
  return linkMatch[1].replace(/&amp;/g, '&');
}

// Helper to clear Mailpit inbox
async function clearMailpit() {
  await fetch(`${MAILPIT_API}/messages`, { method: 'DELETE' });
}

// Generate unique email for each test run
function generateTestEmail() {
  return `test-${Date.now()}@example.com`;
}

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

    // Use existing seeded user email and blur to trigger check
    await page.fill('input[type="email"]', 'student@example.com');
    await page.locator('input#password').focus(); // Blur the email field

    // Should show real-time error message
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

test.describe('Signup and Email Confirmation Flow', () => {
  // Clear mailpit before each test
  test.beforeEach(async () => {
    await clearMailpit();
  });

  // Full signup → email confirmation → success page flow
  test('complete signup flow with email confirmation', async ({ page }) => {
    const testEmail = generateTestEmail();
    const testPassword = 'TestPassword123!';

    // 1. Go to signup page
    await page.goto('/signup');

    // 2. Fill out signup form (including required fields: status, country)
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input#password', testPassword);
    await page.fill('input#confirmPassword', testPassword);
    await page.selectOption('select[name="status"]', 'student');
    await page.selectOption('select[name="country"]', 'US');
    await page.fill('input[name="firstName"]', 'Test');
    await page.click('button[type="submit"]');

    // 3. Should show "check your email" message or redirect
    // Wait for either success message or redirect
    await page.waitForTimeout(2000);

    // 4. Get confirmation link from Mailpit
    const confirmationLink = await getConfirmationLinkFromMailpit(testEmail);
    expect(confirmationLink).toBeTruthy();

    // 5. Click the confirmation link
    await page.goto(confirmationLink);

    // 6. Should end up on the confirmed page
    await expect(page).toHaveURL('/auth/confirmed', { timeout: 15000 });
    await expect(page.locator('h1')).toContainText('Email confirmed', { timeout: 15000 });
    await expect(page.locator('text=Your email has been confirmed')).toBeVisible();
  });
});
