import { test, expect } from '@playwright/test';

test('full-width canvas paints, pauses, resumes, and preserves product controls', async ({
  page,
}) => {
  await page.goto('/');
  const canvas = page.locator('.hero-field');
  await expect(canvas).toHaveAttribute('data-state', 'running');
  const bounds = await canvas.boundingBox();
  expect(bounds?.width).toBe(await page.evaluate(() => document.documentElement.clientWidth));
  await page.getByRole('button', { name: 'Pause background animation' }).click();
  await expect(canvas).toHaveAttribute('data-state', 'paused');
  const painted = await canvas.evaluate((element: HTMLCanvasElement) => {
    const pixels = element.getContext('2d')!.getImageData(0, 0, element.width, element.height).data;
    return pixels.some((v, i) => i % 4 === 3 && v > 0);
  });
  expect(painted).toBe(true);
  const image = await canvas.evaluate((element: HTMLCanvasElement) => element.toDataURL());
  await page.getByRole('button', { name: 'Research', exact: true }).click();
  await expect(page.getByRole('img', { name: /Turn a topic/ })).toBeVisible();
  expect(await canvas.evaluate((element: HTMLCanvasElement) => element.toDataURL())).toBe(image);
  await page.getByRole('button', { name: 'Play background animation' }).click();
  await expect(canvas).toHaveAttribute('data-state', 'running');
  await page.getByRole('link', { name: 'Make it yours', exact: true }).click();
  await expect(page).toHaveURL(/\/docs\/getting-started\/$/);
});

test('offscreen and hidden scenes stop and resume without losing their motion preference', async ({
  page,
}) => {
  await page.goto('/');
  const canvas = page.locator('.hero-field');
  await expect(canvas).toHaveAttribute('data-state', 'running');
  await page.locator('.studio-card').scrollIntoViewIfNeeded();
  await expect(canvas).toHaveAttribute('data-state', 'offscreen');
  await page.locator('#hero-title').scrollIntoViewIfNeeded();
  await expect(canvas).toHaveAttribute('data-state', 'running');
  // Simulate the browser visibility boundary, rather than relying on headless tab focus.
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(canvas).toHaveAttribute('data-state', 'hidden');
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(canvas).toHaveAttribute('data-state', 'running');
});

test('reduced motion stays static through interaction and theme changes', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const canvas = page.locator('.hero-field');
  await expect(canvas).toHaveAttribute('data-state', 'reduced');
  await expect(
    page.getByRole('button', { name: 'Background motion reduced by device preference' }),
  ).toBeDisabled();
  const image = await canvas.evaluate((element: HTMLCanvasElement) => element.toDataURL());
  await page.mouse.move(30, 130);
  await page.mouse.click(30, 130);
  expect(await canvas.evaluate((element: HTMLCanvasElement) => element.toDataURL())).toBe(image);
  await page.getByRole('button', { name: 'Choose color theme' }).click();
  await page.getByRole('radio', { name: 'Light', exact: true }).check();
  await expect(canvas).toHaveAttribute('data-state', 'reduced');
  await expect
    .poll(() => canvas.evaluate((element: HTMLCanvasElement) => element.toDataURL()))
    .not.toBe(image);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(canvas).toHaveAttribute('data-state', 'running');
});

test('touch scrolling remains native and rapid background clicks stay responsive', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await expect(page.locator('.hero-field')).toHaveAttribute('data-state', 'running');
  expect(await page.locator('.hero-stage').evaluate((el) => getComputedStyle(el).touchAction)).toBe(
    'auto',
  );
  for (let i = 0; i < 12; i++) await page.touchscreen.tap(12, 160 + i * 3);
  await page.getByRole('button', { name: 'Research', exact: true }).click();
  await expect(page.getByRole('img', { name: /Turn a topic/ })).toBeVisible();
  expect(errors).toEqual([]);
  await context.close();
});

test('canvas-unavailable fallback preserves content and usable links', async ({ page }) => {
  await page.addInitScript(() => {
    HTMLCanvasElement.prototype.getContext = (() =>
      null) as typeof HTMLCanvasElement.prototype.getContext;
  });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Pause background animation' })).toHaveCount(0);
  await page.getByRole('link', { name: 'Make it yours', exact: true }).click();
  await expect(page).toHaveURL(/\/docs\/getting-started\/$/);
});
