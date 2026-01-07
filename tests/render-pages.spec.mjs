import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';

const ROUTES = [
  { name: 'home', route: '/' },
  { name: 'intro-data-analytics', route: '/chapter/intro-data-analytics' },
  { name: 'probability-distributions', route: '/chapter/probability-distributions' },
  { name: 'operators-properties', route: '/chapter/operators-properties' },
  { name: 'propensity-score', route: '/chapter/propensity-score' },
];

test.describe('render snapshots', () => {
  test('renders key routes and writes screenshots', async ({ page }) => {
    const outDir = path.join(process.cwd(), 'render-snapshots');
    await fs.mkdir(outDir, { recursive: true });

    for (const { name, route } of ROUTES) {
      await page.goto(route, { waitUntil: 'networkidle' });
      await expect(page.locator('main')).toBeVisible();
      await expect(page.locator('main h1').first()).toBeVisible();
      await page.waitForTimeout(250);

      await page.screenshot({
        path: path.join(outDir, `${name}.png`),
        fullPage: true,
      });
    }
  });
});


