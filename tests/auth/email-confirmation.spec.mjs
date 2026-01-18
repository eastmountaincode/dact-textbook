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

test.describe.serial('Email Confirmation', () => {
  // Clear mailpit before each test
  test.beforeEach(async () => {
    await clearMailpit();
  });

  test('full signup flow: confirm email, login, and access welcome page', async ({ page }) => {
    const testEmail = generateTestEmail();
    const testPassword = 'TestPassword123!';

    // 1. Go to signup page
    await page.goto('/signup');

    // 2. Fill out signup form
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input#password', testPassword);
    await page.fill('input#confirmPassword', testPassword);
    await page.selectOption('select[name="role"]', 'student');
    await page.selectOption('select[name="educationLevel"]', 'undergraduate');
    // For country, use react-select
    await page.click('[class*="country-select"]');
    await page.keyboard.type('United States');
    await page.keyboard.press('Enter');
    await page.fill('input[name="firstName"]', 'Test');
    await page.click('button[type="submit"]');

    // 3. Wait for signup to complete
    await page.waitForTimeout(2000);

    // 4. Get confirmation link from Mailpit
    const confirmationLink = await getConfirmationLinkFromMailpit(testEmail);
    expect(confirmationLink).toBeTruthy();

    // 5. Click the confirmation link
    await page.goto(confirmationLink);

    // 6. Should end up on the confirmed page
    await expect(page).toHaveURL('/auth/confirmed', { timeout: 15000 });
    await expect(page.locator('h1')).toContainText('Email confirmed');

    // 7. Verify NOT logged in - header should show "Log In" button, not a username
    const headerLoginLink = page.locator('header a:has-text("Log In")');
    await expect(headerLoginLink).toBeVisible();

    // 8. Click the Login button in the card
    const cardLoginButton = page.locator('.rounded-xl a:has-text("Log In")');
    await cardLoginButton.click();

    // 9. Should be on login page
    await expect(page).toHaveURL('/login');

    // 10. Fill in login form
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');

    // 11. Should be redirected to welcome page
    await expect(page).toHaveURL('/chapter/welcome', { timeout: 15000 });

    // 12. Verify logged in - header should NOT show "Log In" link anymore
    await expect(page.locator('header a:has-text("Log In")')).not.toBeVisible({ timeout: 5000 });
  });

  test('clicking already-used confirmation link (not logged in) shows error on login page', async ({ page }) => {
    const testEmail = generateTestEmail();
    const testPassword = 'TestPassword123!';

    // 1. Sign up
    await page.goto('/signup');
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input#password', testPassword);
    await page.fill('input#confirmPassword', testPassword);
    await page.selectOption('select[name="role"]', 'student');
    await page.selectOption('select[name="educationLevel"]', 'undergraduate');
    await page.click('[class*="country-select"]');
    await page.keyboard.type('United States');
    await page.keyboard.press('Enter');
    await page.fill('input[name="firstName"]', 'Test');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    // 2. Get and use confirmation link
    const confirmationLink = await getConfirmationLinkFromMailpit(testEmail);
    await page.goto(confirmationLink);
    await expect(page).toHaveURL('/auth/confirmed', { timeout: 15000 });

    // 3. Try to use the same link again (while not logged in)
    await page.goto(confirmationLink);

    // 4. Should redirect to login page with error message
    await expect(page).toHaveURL('/login', { timeout: 15000 });
    await expect(page.locator('text=This link has expired or is invalid')).toBeVisible();
    await expect(page.locator('text=Resend confirmation email')).toBeVisible();
  });

  test('clicking already-used confirmation link (logged in) shows link invalid page', async ({ page }) => {
    const testEmail = generateTestEmail();
    const testPassword = 'TestPassword123!';

    // 1. Sign up
    await page.goto('/signup');
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input#password', testPassword);
    await page.fill('input#confirmPassword', testPassword);
    await page.selectOption('select[name="role"]', 'student');
    await page.selectOption('select[name="educationLevel"]', 'undergraduate');
    await page.click('[class*="country-select"]');
    await page.keyboard.type('United States');
    await page.keyboard.press('Enter');
    await page.fill('input[name="firstName"]', 'Test');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    // 2. Get and use confirmation link
    const confirmationLink = await getConfirmationLinkFromMailpit(testEmail);
    await page.goto(confirmationLink);
    await expect(page).toHaveURL('/auth/confirmed', { timeout: 15000 });

    // 3. Log in
    await page.goto('/login');
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/chapter/welcome', { timeout: 15000 });

    // 4. Try to use the same link again (while logged in)
    await page.goto(confirmationLink);

    // 5. Should redirect to "Link no longer valid" page
    await expect(page).toHaveURL(/\/auth\/confirmed\?already=true/, { timeout: 15000 });
    await expect(page.locator('h1')).toContainText('Link no longer valid');
    await expect(page.locator('text=This confirmation link is no longer valid')).toBeVisible();
  });

  test('confirmed page shows correct UI elements', async ({ page }) => {
    // Directly visit the confirmed page (it's a static page now)
    await page.goto('/auth/confirmed');

    // Check all UI elements
    await expect(page.locator('h1')).toContainText('Email confirmed');
    await expect(page.locator('text=You can now log in to your account')).toBeVisible();

    // Check the checkmark icon exists (in the main content area)
    await expect(page.locator('.rounded-xl svg')).toBeVisible();

    // Check login button (in the card, not header)
    const loginButton = page.locator('.rounded-xl a:has-text("Log In")');
    await expect(loginButton).toBeVisible();
    await expect(loginButton).toHaveAttribute('href', '/login');
  });
});
