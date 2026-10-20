import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('F004 classic scrollbars do not force a 320px minimum canvas', async ({ page }) => {
  await page.goto('/');
  // A 320px Windows viewport with a classic 15px scrollbar leaves 305 CSS pixels.
  for (const width of [320, 305]) {
    await page.setViewportSize({ width, height: 568 });
    const sizes = await page.evaluate(() => ({
      body: document.body.getBoundingClientRect().width,
      available: document.documentElement.clientWidth,
    }));
    console.log(`EXPECTED: body fits the content viewport; ACTUAL: ${JSON.stringify(sizes)}`);
    expect(sizes.body).toBeLessThanOrEqual(sizes.available);
    const heading = await page.locator('.hero h1').evaluate((el) => ({
      height: el.getBoundingClientRect().height,
      lineHeight: Number.parseFloat(getComputedStyle(el).lineHeight),
    }));
    expect(heading.height).toBeLessThanOrEqual(heading.lineHeight * 3 + 1);
  }
});

test('F001 theme choices stay inside the narrow viewport', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  for (const width of [375, 320]) {
    await page.setViewportSize({ width, height: 568 });
    await page.getByRole('button', { name: 'Choose color theme' }).click();
    const panel = page.getByRole('dialog', { name: 'Appearance' });
    await expect(panel.getByRole('radio', { name: 'Light', exact: true })).toBeVisible();
    const bounds = await panel.boundingBox();
    console.log(`EXPECTED: theme panel inside 0..${width}; ACTUAL: ${JSON.stringify(bounds)}`);
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
    await page.getByRole('radio', { name: 'Dark', exact: true }).press('Escape');
    await expect(page.getByRole('button', { name: 'Choose color theme' })).toBeFocused();
  }
});

test('local font subsets cover English and Turkish without changing UI language', async ({
  page,
}) => {
  await page.goto('/docs/installation/');
  const families = await page.evaluate(async () => {
    const text = 'OwnPilot İstanbul ığüşöç İĞÜŞÖÇ';
    const faces = await document.fonts.load('400 16px "Space Grotesk"', text);
    const code = await document.fonts.load('400 12px "JetBrains Mono"', text);
    return {
      reading: faces.map((face) => ({ family: face.family, status: face.status })),
      code: code.map((face) => ({ family: face.family, status: face.status })),
    };
  });
  expect(families.reading.length).toBeGreaterThanOrEqual(2);
  expect(families.code.length).toBeGreaterThanOrEqual(2);
  for (const face of families.reading)
    expect(face).toEqual({ family: 'Space Grotesk', status: 'loaded' });
  for (const face of families.code)
    expect(face).toEqual({ family: 'JetBrains Mono', status: 'loaded' });
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test('copy failure feedback stays visible and keyboard usable on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: async () => {
          throw new Error('Clipboard blocked');
        },
      },
    });
  });
  await page.goto('/docs/getting-started/');
  const copy = page.getByRole('button', { name: /^Copy / }).first();
  await copy.focus();
  await copy.press('Enter');
  await expect(copy).toContainText('Select code to copy');
  await expect(copy).toBeInViewport({ ratio: 1 });
  expect((await copy.boundingBox())!.height).toBeGreaterThanOrEqual(44);
});

for (const theme of ['dark', 'light']) {
  test(`open controls meet automatic WCAG 2.2 checks in ${theme}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript((t) => localStorage.setItem('ownpilot-theme', t), theme);
    await page.goto('/');
    const check = async () => {
      const result = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(result.violations).toEqual([]);
    };
    await page.getByRole('button', { name: 'Choose color theme' }).click();
    await check();
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Search documentation', exact: true }).click();
    await check();
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
    await check();
  });
}

test('F002 short landscape navigation keeps the final link reachable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 568, height: 800 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
  const menu = page.getByRole('navigation', { name: 'Mobile navigation' });
  const lastLink = menu.getByRole('link', { name: 'Changelog' });
  await expect(lastLink).toBeInViewport();
  await page.setViewportSize({ width: 568, height: 280 });
  await lastLink.focus();
  const bounds = await lastLink.boundingBox();
  console.log(`EXPECTED: final menu link inside 0..280; ACTUAL: ${JSON.stringify(bounds)}`);
  await expect(lastLink).toBeInViewport({ ratio: 1 });
  await lastLink.press('Escape');
  await expect(menu).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Open navigation', exact: true })).toBeFocused();
});

test('F003 reading text uses the requested font and a readable mobile scale', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/docs/getting-started/');
  await page.evaluate(() => document.fonts.ready);
  const code = page.locator('pre').first();
  expect(await code.evaluate((el) => getComputedStyle(el).fontFamily)).toContain('JetBrains');
  expect(await code.locator('code').evaluate((el) => getComputedStyle(el).fontFamily)).toContain(
    'JetBrains',
  );
  const reading = await page
    .locator('.doc-section > p')
    .first()
    .evaluate((el) => ({
      family: getComputedStyle(el).fontFamily,
      size: Number.parseFloat(getComputedStyle(el).fontSize),
    }));
  console.log(`EXPECTED: Space Grotesk, at least 15px; ACTUAL: ${JSON.stringify(reading)}`);
  expect(reading.family).toContain('Space Grotesk');
  expect(reading.size).toBeGreaterThanOrEqual(15);
});

test('static route data resolves while unknown routes retain 404 responses', async ({
  request,
}) => {
  for (const route of [
    '/changelog/__next._tree.txt',
    '/changelog/__next.changelog.__PAGE__.txt',
    '/docs/getting-started/__next.docs.$d$slug.__PAGE__.txt',
  ]) {
    const response = await request.get(route);
    expect(response.status(), route).toBe(200);
    expect(response.headers()['content-type']).toContain('text/plain');
  }
  expect((await request.get('/not-a-real-route/')).status()).toBe(404);
  expect((await request.get('/changelog/__next.missing.__PAGE__.txt')).status()).toBe(404);
});

test('headers, short search dialogs and breakpoint layouts keep controls in view', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  for (const width of [
    320, 359, 360, 390, 649, 650, 651, 767, 769, 849, 850, 851, 1149, 1151, 1699, 1701,
  ]) {
    await page.setViewportSize({ width, height: 568 });
    const bounds = await page.locator('.header-actions').boundingBox();
    expect(bounds!.x + bounds!.width, `header at ${width}`).toBeLessThanOrEqual(width);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
      `page at ${width}`,
    ).toBeLessThanOrEqual(width);
  }
  for (const [width, height] of [
    [320, 568],
    [568, 280],
    [768, 320],
  ]) {
    await page.setViewportSize({ width, height });
    await page.getByRole('button', { name: 'Search documentation', exact: true }).click();
    const modal = page.getByRole('dialog', { name: 'Search documentation' });
    await expect(
      page.getByRole('textbox', { name: 'Search documentation', exact: true }),
    ).toBeFocused();
    const bounds = await modal.boundingBox();
    expect(bounds!.y).toBeGreaterThanOrEqual(0);
    expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(height);
    await expect(modal.getByRole('button', { name: 'Close search' })).toBeInViewport({ ratio: 1 });
    await page.keyboard.press('Escape');
    await expect(modal).not.toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Search documentation', exact: true }),
    ).toBeFocused();
  }
});
