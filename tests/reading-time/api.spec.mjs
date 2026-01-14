import { test, expect } from '@playwright/test';

// Test credentials from seed.sql
const TEST_USER = {
  email: 'student@example.com',
  password: 'studentpassword123',
};

// Helper to login and get authenticated context
async function loginAsStudent(page) {
  await page.goto('/login');
  await page.fill('input[type="email"]', TEST_USER.email);
  await page.fill('input[type="password"]', TEST_USER.password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/chapter/welcome', { timeout: 15000 });
}

test.describe('Reading Time API', () => {
  test.describe('Authentication', () => {
    test('returns 401 when not authenticated', async ({ request }) => {
      const response = await request.post('/api/reading-time', {
        data: {
          chapterSlug: 'welcome',
          secondsToAdd: 30,
        },
      });

      expect(response.status()).toBe(401);
    });

    test('accepts request when authenticated', async ({ page }) => {
      await loginAsStudent(page);

      // Use page.request which inherits cookies from the page context
      const response = await page.request.post('/api/reading-time', {
        data: {
          chapterSlug: 'welcome',
          secondsToAdd: 10,
        },
      });

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.success).toBe(true);
    });
  });

  test.describe('Validation', () => {
    test('rejects missing chapterSlug', async ({ page }) => {
      await loginAsStudent(page);

      const response = await page.request.post('/api/reading-time', {
        data: {
          secondsToAdd: 30,
        },
      });

      expect(response.status()).toBe(400);
    });

    test('rejects missing secondsToAdd', async ({ page }) => {
      await loginAsStudent(page);

      const response = await page.request.post('/api/reading-time', {
        data: {
          chapterSlug: 'welcome',
        },
      });

      expect(response.status()).toBe(400);
    });

    test('rejects zero seconds', async ({ page }) => {
      await loginAsStudent(page);

      const response = await page.request.post('/api/reading-time', {
        data: {
          chapterSlug: 'welcome',
          secondsToAdd: 0,
        },
      });

      expect(response.status()).toBe(400);
    });

    test('rejects negative seconds', async ({ page }) => {
      await loginAsStudent(page);

      const response = await page.request.post('/api/reading-time', {
        data: {
          chapterSlug: 'welcome',
          secondsToAdd: -10,
        },
      });

      expect(response.status()).toBe(400);
    });

    test('rejects seconds over 60', async ({ page }) => {
      await loginAsStudent(page);

      const response = await page.request.post('/api/reading-time', {
        data: {
          chapterSlug: 'welcome',
          secondsToAdd: 61,
        },
      });

      expect(response.status()).toBe(400);
    });

    test('accepts 60 seconds (max allowed)', async ({ page }) => {
      await loginAsStudent(page);

      // First request always works (no previous timestamp to compare against)
      const response = await page.request.post('/api/reading-time', {
        data: {
          chapterSlug: 'about-the-author', // Use different chapter to avoid rate limit from other tests
          secondsToAdd: 60,
        },
      });

      expect(response.status()).toBe(200);
    });

    test('rejects invalid chapter slug', async ({ page }) => {
      await loginAsStudent(page);

      const response = await page.request.post('/api/reading-time', {
        data: {
          chapterSlug: 'nonexistent-chapter-xyz',
          secondsToAdd: 30,
        },
      });

      expect(response.status()).toBe(404);
    });
  });

  test.describe('Legitimate Tracking', () => {
    test('accumulates time correctly with realistic update intervals', async ({ page }) => {
      await loginAsStudent(page);

      const testChapter = 'normal-distribution';

      // Get starting value
      const initial = await page.request.get(`/api/reading-time?chapterSlug=${testChapter}`);
      const initialData = await initial.json();
      const startingSeconds = initialData.secondsSpent;

      // Simulate reading for 30 seconds, then sending an update (like the real tracker does)
      await page.waitForTimeout(10000); // Wait 10 seconds

      const response1 = await page.request.post('/api/reading-time', {
        data: {
          chapterSlug: testChapter,
          secondsToAdd: 10, // Claiming 10 seconds after 10 seconds elapsed
        },
      });
      expect(response1.status()).toBe(200);

      const check1 = await page.request.get(`/api/reading-time?chapterSlug=${testChapter}`);
      const data1 = await check1.json();
      const delta1 = data1.secondsSpent - startingSeconds;
      // Should have added the full 10 seconds
      expect(delta1).toBe(10);

      // Wait another 10 seconds and send another update
      await page.waitForTimeout(10000);

      const response2 = await page.request.post('/api/reading-time', {
        data: {
          chapterSlug: testChapter,
          secondsToAdd: 10,
        },
      });
      expect(response2.status()).toBe(200);

      const check2 = await page.request.get(`/api/reading-time?chapterSlug=${testChapter}`);
      const data2 = await check2.json();
      const delta2 = data2.secondsSpent - startingSeconds;
      // Should have added another 10 seconds (total 20)
      expect(delta2).toBe(20);
    });

    test('first request for a chapter adds requested time (up to 60s max)', async ({ page }) => {
      await loginAsStudent(page);

      // Use a chapter unlikely to have been used in other tests
      const testChapter = 'bayesian-inference';

      // Get starting value
      const initial = await page.request.get(`/api/reading-time?chapterSlug=${testChapter}`);
      const initialData = await initial.json();
      const startingSeconds = initialData.secondsSpent;

      // First request adds requested time (no prior timestamp to rate-limit against)
      // Still bounded by the 60 second max validation
      const response = await page.request.post('/api/reading-time', {
        data: {
          chapterSlug: testChapter,
          secondsToAdd: 30,
        },
      });
      expect(response.status()).toBe(200);

      const check = await page.request.get(`/api/reading-time?chapterSlug=${testChapter}`);
      const data = await check.json();
      const delta = data.secondsSpent - startingSeconds;
      expect(delta).toBe(30);
    });
  });

  test.describe('Rate Limiting', () => {
    test('caps rapid requests to prevent gaming', async ({ page }) => {
      await loginAsStudent(page);

      // Use a unique chapter for this test
      const testChapter = 'intro-data-analytics';

      // Get starting value (may have accumulated from previous runs)
      const initial = await page.request.get(`/api/reading-time?chapterSlug=${testChapter}`);
      const initialData = await initial.json();
      const startingSeconds = initialData.secondsSpent;

      // First request - should add full 30 seconds
      const response1 = await page.request.post('/api/reading-time', {
        data: {
          chapterSlug: testChapter,
          secondsToAdd: 30,
        },
      });
      expect(response1.status()).toBe(200);

      // Check time after first request
      const check1 = await page.request.get(`/api/reading-time?chapterSlug=${testChapter}`);
      const data1 = await check1.json();
      const delta1 = data1.secondsSpent - startingSeconds;
      expect(delta1).toBe(30);

      // Immediate second request - claims 30 seconds but should only add ~5 (buffer)
      const response2 = await page.request.post('/api/reading-time', {
        data: {
          chapterSlug: testChapter,
          secondsToAdd: 30,
        },
      });
      expect(response2.status()).toBe(200);

      // Check delta - should be much less than 60 (30 + 30)
      const check2 = await page.request.get(`/api/reading-time?chapterSlug=${testChapter}`);
      const data2 = await check2.json();
      const delta2 = data2.secondsSpent - startingSeconds;
      // Should be around 35-36 seconds (30 + ~5 buffer), not 60
      expect(delta2).toBeLessThan(45);
      expect(delta2).toBeGreaterThanOrEqual(30);

      // Third immediate request - should add minimal or no time
      const response3 = await page.request.post('/api/reading-time', {
        data: {
          chapterSlug: testChapter,
          secondsToAdd: 30,
        },
      });
      expect(response3.status()).toBe(200);

      // Check delta - should still be much less than 90 (30 + 30 + 30)
      const check3 = await page.request.get(`/api/reading-time?chapterSlug=${testChapter}`);
      const data3 = await check3.json();
      const delta3 = data3.secondsSpent - startingSeconds;
      // Should be around 40-45 seconds max, not 90
      expect(delta3).toBeLessThan(55);
    });

    test('allows proportional time after waiting', async ({ page }) => {
      await loginAsStudent(page);

      const testChapter = 'probability-distributions';

      // Get starting value
      const initial = await page.request.get(`/api/reading-time?chapterSlug=${testChapter}`);
      const initialData = await initial.json();
      const startingSeconds = initialData.secondsSpent;

      // First request - adds 10 seconds
      const response1 = await page.request.post('/api/reading-time', {
        data: {
          chapterSlug: testChapter,
          secondsToAdd: 10,
        },
      });
      expect(response1.status()).toBe(200);

      const check1 = await page.request.get(`/api/reading-time?chapterSlug=${testChapter}`);
      const data1 = await check1.json();
      const delta1 = data1.secondsSpent - startingSeconds;
      expect(delta1).toBe(10);

      // Wait 6 seconds
      await page.waitForTimeout(6000);

      // Second request - can add up to ~11 seconds (6 elapsed + 5 buffer)
      const response2 = await page.request.post('/api/reading-time', {
        data: {
          chapterSlug: testChapter,
          secondsToAdd: 10,
        },
      });
      expect(response2.status()).toBe(200);

      const check2 = await page.request.get(`/api/reading-time?chapterSlug=${testChapter}`);
      const data2 = await check2.json();
      const delta2 = data2.secondsSpent - startingSeconds;
      // Should have added close to the full 10 seconds (since we waited 6 + 5 buffer = 11 allowed)
      expect(delta2).toBeGreaterThanOrEqual(18); // At least 10 + 8 (being conservative)
      expect(delta2).toBeLessThanOrEqual(22); // At most 10 + 12 (6 elapsed + some buffer variance)
    });

    test('cannot inflate time faster than real time', async ({ page }) => {
      await loginAsStudent(page);

      const testChapter = 'correlation'; // Use a different valid chapter
      const startTime = Date.now();

      // Get starting value
      const initial = await page.request.get(`/api/reading-time?chapterSlug=${testChapter}`);
      const initialData = await initial.json();
      const startingSeconds = initialData.secondsSpent;

      // Make 5 rapid requests each claiming 60 seconds
      for (let i = 0; i < 5; i++) {
        await page.request.post('/api/reading-time', {
          data: {
            chapterSlug: testChapter,
            secondsToAdd: 60,
          },
        });
      }

      const elapsedMs = Date.now() - startTime;
      const elapsedSeconds = Math.ceil(elapsedMs / 1000);

      // Check final time
      const check = await page.request.get(`/api/reading-time?chapterSlug=${testChapter}`);
      const data = await check.json();
      const totalDelta = data.secondsSpent - startingSeconds;

      // Total delta should be roughly: 60 (first) + elapsedSeconds + some buffer
      // Not 300 (5 * 60)
      const maxExpected = 60 + elapsedSeconds + 30; // Very generous upper bound
      expect(totalDelta).toBeLessThan(maxExpected);
      expect(totalDelta).toBeLessThan(150); // Definitely less than half of 300
    });
  });
});
