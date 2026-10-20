import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const docSlugs = [
  'getting-started',
  'installation',
  'architecture',
  'agents',
  'tools',
  'providers',
  'workflows',
  'channels',
  'personal-data',
  'security',
  'configuration',
  'deployment',
  'api',
];
const routes = [
  '/',
  '/integrations/',
  '/changelog/',
  '/brand/',
  ...docSlugs.map((s) => `/docs/${s}/`),
];
for (const width of [320, 375, 390, 768, 1024, 1280, 1440, 1920, 2560, 3840])
  for (const theme of ['dark', 'light']) {
    test(`${width}px ${theme}: every route renders without overflow or missing assets`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.addInitScript((t) => localStorage.setItem('ownpilot-theme', t), theme);
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));
      page.on('response', (res) => {
        if (res.status() >= 400) errors.push(`${res.status()} ${res.url()}`);
      });
      for (const route of routes) {
        const response = await page.goto(route);
        expect(response?.status(), route).toBe(200);
        await expect(page.locator('html')).toHaveAttribute('data-color', theme);
        await expect(page.locator('h1')).toHaveCount(1);
        await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
          'content',
          'https://ownpilot.dev/og.png',
        );
        await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute(
          'content',
          'https://ownpilot.dev/og.png',
        );
        await page.evaluate(() => document.fonts.ready);
        const sizes = await page.evaluate(() => ({
          scroll: document.documentElement.scrollWidth,
          client: document.documentElement.clientWidth,
          broken: [...document.images]
            .filter((i) => !i.complete || i.naturalWidth === 0)
            .map((i) => i.src),
        }));
        expect(sizes.scroll, `${route} at ${width}`).toBeLessThanOrEqual(sizes.client + 1);
        expect(sizes.broken, route).toEqual([]);
      }
      expect(errors).toEqual([]);
    });
  }
test('theme selection persists, system tracks device, and Escape returns focus', async ({
  page,
}) => {
  await page.goto('/');
  const trigger = page.getByRole('button', { name: 'Choose color theme' });
  await trigger.click();
  await page.getByRole('radio', { name: 'Light', exact: true }).check();
  await expect(page.locator('html')).toHaveAttribute('data-color', 'light');
  await page.getByRole('radio', { name: 'Light', exact: true }).press('Escape');
  await expect(trigger).toBeFocused();
  await expect(page.getByRole('dialog', { name: 'Appearance' })).not.toBeVisible();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-color', 'light');
  await trigger.click();
  await page.getByRole('radio', { name: 'System', exact: true }).check();
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page.locator('html')).toHaveAttribute('data-color', 'dark');
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(page.locator('html')).toHaveAttribute('data-color', 'light');
});
test('theme continues to work with storage disabled', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new Error('Storage disabled');
    };
    Storage.prototype.getItem = () => {
      throw new Error('Storage disabled');
    };
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Choose color theme' }).click();
  await page.getByRole('radio', { name: 'Light', exact: true }).check();
  await expect(page.locator('html')).toHaveAttribute('data-color', 'light');
});
test('search, empty results, direct docs navigation and refresh', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Search documentation' }).click();
  await page.getByRole('textbox', { name: 'Search documentation' }).fill('no-such-topic-123');
  await expect(page.getByText('No results for')).toBeVisible();
  await page.getByRole('textbox', { name: 'Search documentation' }).fill('boundaries');
  await page
    .getByRole('dialog')
    .getByRole('link')
    .filter({ hasText: 'Ownership, with clear boundaries' })
    .click();
  await expect(page).toHaveURL(/\/docs\/security\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Ownership, with clear boundaries',
  );
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});
test('mobile navigation is operable and closes with Escape', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Open navigation' })).toBeFocused();
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page
    .getByRole('navigation', { name: 'Mobile navigation' })
    .getByRole('link', { name: 'Integrations' })
    .click();
  await expect(page).toHaveURL(/\/integrations\/$/);
  await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).not.toBeVisible();
});
test('workflow examples, product tabs, keyboard tabs, FAQ and command copy', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');
  await page.getByRole('button', { name: 'Research', exact: true }).click();
  await expect(page.getByRole('img', { name: /Turn a topic/ })).toBeVisible();
  await page.getByRole('tab', { name: 'Personal memory', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Good context goes a long way.' })).toBeVisible();
  await page.getByRole('tab', { name: 'Personal memory', exact: true }).press('ArrowRight');
  await expect(
    page.getByRole('heading', { name: 'Make the repeatable, automatic.' }),
  ).toBeVisible();
  await page.getByRole('tab', { name: 'PowerShell', exact: true }).click();
  await expect(page.locator('#install-panel pre')).toContainText('Copy-Item');
  await page.getByRole('button', { name: 'Copy PowerShell · Windows', exact: true }).click();
  await expect(page.getByText('Copied!', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    'Copy-Item .env.example .env',
  );
  await page
    .getByText('Does self-hosted mean my data never leaves my machine?', { exact: true })
    .click();
  await expect(page.locator('details[open]')).toContainText('Requests to cloud AI providers');
});
test('integration filters and empty state can recover', async ({ page }) => {
  await page.goto('/integrations/');
  await page.getByRole('button', { name: 'Local AI', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('4 documented connections');
  await page.getByRole('textbox', { name: 'Search integrations' }).fill('no-integration-123');
  await expect(page.getByRole('heading', { name: 'No matching connections.' })).toBeVisible();
  await page.getByRole('button', { name: 'Reset filters' }).click();
  await expect(page.getByRole('status')).toHaveText('24 documented connections');
});
test('reduced motion removes ambient animation without removing content', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  expect(
    await page.locator('.signal-dot').evaluate((el) => getComputedStyle(el).animationName),
  ).toBe('none');
  await expect(page.locator('.studio-symbol')).toBeAttached();
  await page.locator('.studio-card').scrollIntoViewIfNeeded();
  await expect(page.locator('.studio-symbol path').first()).toHaveCSS('animation-name', 'none');
  await expect(page.locator('.studio-symbol path').first()).toHaveCSS('stroke-dashoffset', '0px');
});

test('studio matches the Mammoth footer and repeats its SVG drawing only while visible', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const card = page.locator('.studio-card');
  const stroke = page.locator('.studio-symbol path').first();
  await expect(card).toHaveAttribute('data-motion', 'paused');
  await expect(stroke).toHaveCSS('animation-name', 'none');
  await expect(stroke).toHaveCSS('stroke-dashoffset', '0px');
  await card.scrollIntoViewIfNeeded();
  await expect(card).toHaveAttribute('data-motion', 'draw');
  await expect(stroke).toHaveCSS('animation-name', 'studio-draw');
  await expect(stroke).toHaveCSS('animation-duration', '6s');
  await expect(stroke).toHaveCSS('animation-iteration-count', 'infinite');
  await expect(page.locator('.studio-symbol path').last()).toHaveCSS('stroke-dashoffset', '0px');
  await expect(card).toHaveAttribute('href', 'https://oxog.net');
  await expect(card.getByText('PART OF A BIGGER PICTURE', { exact: true })).toBeVisible();
  await expect(card.getByRole('heading', { name: 'Small studio. Big ideas.' })).toBeVisible();
  await expect(card.getByText('Explore the tools and infrastructure from Oxog.')).toBeVisible();
  await expect(card.getByText('Meet oxog.net', { exact: true })).toBeVisible();
  await expect(page.getByRole('list', { name: 'More from OXOGNET' })).toHaveCount(0);
  await expect(page.getByText('OwnPilot is built and maintained by')).toHaveCount(0);
  await expect(page.getByText('Built for the freedom to build.')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Website source' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Disable mouse effects', exact: true }).click();
  await card.scrollIntoViewIfNeeded();
  await expect(stroke).toHaveCSS('animation-name', 'studio-draw');
  await page.getByRole('heading', { level: 1 }).scrollIntoViewIfNeeded();
  await expect(card).toHaveAttribute('data-motion', 'paused');
  await expect(stroke).toHaveCSS('animation-name', 'none');
  await card.scrollIntoViewIfNeeded();
  await expect(stroke).toHaveCSS('animation-name', 'studio-draw');
});

test('reduced motion keeps the studio logo visible and stops its drawing loop', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await page.locator('.studio-card').scrollIntoViewIfNeeded();
  await expect(page.locator('.studio-card')).toHaveAttribute('data-motion', 'draw');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.studio-card')).toHaveAttribute('data-motion', 'paused');
  await expect(page.locator('.studio-symbol path').first()).toHaveCSS('animation-name', 'none');
  await expect(page.locator('.studio-symbol path').first()).toHaveCSS('stroke-dashoffset', '0px');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(page.locator('.studio-card')).toHaveAttribute('data-motion', 'draw');
});

test('studio identity remains visible without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  const page = await context.newPage();
  await page.goto('/');
  await page.locator('.studio-card').scrollIntoViewIfNeeded();
  await expect(
    page.getByRole('link', { name: /PART OF A BIGGER PICTURE Small studio/ }),
  ).toBeVisible();
  await expect(page.locator('.studio-symbol path').first()).toHaveCSS('stroke-dasharray', 'none');
  await context.close();
});
for (const theme of ['dark', 'light'])
  for (const route of routes)
    test(`accessible ${theme} ${route}`, async ({ page }) => {
      await page.addInitScript((t) => localStorage.setItem('ownpilot-theme', t), theme);
      await page.goto(route);
      const result = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(result.violations).toEqual([]);
    });
test('custom domain and export endpoints are served correctly', async ({ request }) => {
  const og = await request.get('/og.png');
  expect(og.status()).toBe(200);
  expect(og.headers()['content-type']).toContain('image/png');
  const png = await og.body();
  expect(png.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
  expect(png.readUInt32BE(16)).toBe(1200);
  expect(png.readUInt32BE(20)).toBe(630);
  expect((await request.get('/CNAME')).status()).toBe(200);
  expect((await (await request.get('/CNAME')).text()).trim()).toBe('ownpilot.dev');
  expect((await request.get('/.nojekyll')).status()).toBe(200);
  expect((await request.get('/sitemap.xml')).status()).toBe(200);
  expect((await request.get('/robots.txt')).status()).toBe(200);
  expect((await request.get('/a-route-that-does-not-exist/')).status()).toBe(404);
});
