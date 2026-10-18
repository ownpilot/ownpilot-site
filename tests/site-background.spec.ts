import { test, expect } from '@playwright/test';

test('inactive effect slots stop generating DOM mutations', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-18T12:00:00Z') });
  await page.goto('/');
  const field = page.locator('.site-field');
  await expect(field).toHaveAttribute('data-state', 'running');
  await page.clock.pauseAt(new Date('2026-10-18T12:01:00Z'));
  await page.clock.runFor(2000);
  const mutations = field.evaluate(
    (svg) =>
      new Promise<number>((resolve) => {
        let count = 0;
        const observer = new MutationObserver((records) => {
          count += records.filter(
            (record) =>
              record.target instanceof Element &&
              record.target.matches('.field-pulse[data-active="false"], .field-trail'),
          ).length;
        });
        observer.observe(svg, { attributes: true, subtree: true });
        svg.setAttribute('data-idle-observing', 'true');
        setTimeout(() => {
          observer.disconnect();
          resolve(count);
        }, 500);
      }),
  );
  await expect(field).toHaveAttribute('data-idle-observing', 'true');
  await page.clock.runFor(600);
  expect(await mutations).toBe(0);
});

test('one SVG spans sections and routes, preserves controls, and keeps its pause preference', async ({
  page,
}) => {
  await page.goto('/');
  const field = page.locator('.site-field');
  await expect(field).toHaveCount(1);
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect(field).toHaveAttribute('data-state', 'running');
  expect((await field.boundingBox())?.width).toBe(
    await page.evaluate(() => document.documentElement.clientWidth),
  );
  await page.locator('.studio-card').scrollIntoViewIfNeeded();
  await expect(field).toHaveAttribute('data-state', 'running');
  expect((await field.boundingBox())?.y).toBe(0);
  await page.getByRole('button', { name: 'Pause motion', exact: true }).click();
  await expect(field).toHaveAttribute('data-state', 'paused');
  const transform = await page.locator('.field-node').first().getAttribute('transform');
  await page.getByRole('link', { name: 'Integrations', exact: true }).first().click();
  await expect(page).toHaveURL(/\/integrations\/$/);
  await expect(field).toHaveCount(1);
  await expect(field).toHaveAttribute('data-state', 'paused');
  await expect(page.locator('.field-node').first()).toHaveAttribute('transform', transform!);
  await expect
    .poll(() => page.locator('[data-shields]').evaluate((el) => el.childElementCount))
    .toBeGreaterThan(0);
  await page.getByRole('button', { name: 'Resume motion', exact: true }).click();
  await expect(field).toHaveAttribute('data-state', 'running');
});

test('background waves are visible, capped, expire, and ignore product controls', async ({
  page,
}) => {
  await page.clock.install({ time: new Date('2026-10-18T12:00:00Z') });
  await page.goto('/');
  await expect(page.locator('.site-field')).toHaveAttribute('data-state', 'running');
  await page.clock.pauseAt(new Date('2026-10-18T12:01:00Z'));
  await page.clock.runFor(1600);
  await page.mouse.click(18, 210);
  await page.clock.runFor(120);
  const active = page.locator('.field-pulse[data-active="true"]');
  await expect(active).toHaveCount(1);
  expect(Number(await active.locator('circle').first().getAttribute('r'))).toBeGreaterThan(1);
  await page.clock.runFor(2000);
  await expect(active).toHaveCount(0);
  await page.getByRole('button', { name: 'Research', exact: true }).click();
  await page.clock.runFor(100);
  await expect(active).toHaveCount(0);
  await expect(page.getByRole('img', { name: /Turn a topic/ })).toBeVisible();
  for (let i = 0; i < 20; i++) await page.mouse.click(18, 210);
  await page.clock.runFor(100);
  await expect(active).toHaveCount(6);
  await page.mouse.move(1200, 950);
  await page.clock.runFor(2400);
  await expect(active).toHaveCount(0);
  expect(
    await page
      .locator('.field-trail')
      .evaluateAll((nodes) => nodes.every((n) => Number(n.getAttribute('opacity')) === 0)),
  ).toBe(true);
});

test('hidden and nonvisible SVGs stop their frame loops and resume', async ({ page }) => {
  await page.goto('/');
  const field = page.locator('.site-field');
  await expect(field).toHaveAttribute('data-state', 'running');
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(field).toHaveAttribute('data-state', 'hidden');
  const transform = await page.locator('.field-node').first().getAttribute('transform');
  await page.getByRole('button', { name: 'Choose color theme' }).click();
  await expect(page.locator('.field-node').first()).toHaveAttribute('transform', transform!);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(field).toHaveAttribute('data-state', 'running');
  await page.locator('.site-background').evaluate((el: HTMLElement) => {
    el.style.display = 'none';
  });
  await expect(field).toHaveAttribute('data-state', 'offscreen');
  await page.locator('.site-background').evaluate((el: HTMLElement) => {
    el.style.display = '';
  });
  await expect(field).toHaveAttribute('data-state', 'running');
});

test('reduced motion remains still while themes and page content remain usable', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const field = page.locator('.site-field');
  await expect(field).toHaveAttribute('data-state', 'reduced');
  await expect(page.getByRole('button', { name: 'Reduced motion', exact: true })).toBeDisabled();
  await page.evaluate(() => document.fonts.ready);
  const transform = await page.locator('.field-node').first().getAttribute('transform');
  const color = await page
    .locator('.field-blue')
    .first()
    .evaluate((el) => getComputedStyle(el).color);
  await page.mouse.click(18, 210);
  await expect(page.locator('.field-pulse[data-active="true"]')).toHaveCount(0);
  await page.getByRole('button', { name: 'Choose color theme' }).click();
  await page.getByRole('radio', { name: 'Light', exact: true }).check();
  await expect
    .poll(() =>
      page
        .locator('.field-blue')
        .first()
        .evaluate((el) => getComputedStyle(el).color),
    )
    .not.toBe(color);
  await expect(page.locator('.field-node').first()).toHaveAttribute('transform', transform!);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(field).toHaveAttribute('data-state', 'running');
});

test('mobile taps are bounded and a real touch swipe still scrolls the page', async ({
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
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('.site-field')).toHaveAttribute('data-state', 'running');
  expect(await page.locator('.field-node').count()).toBeLessThanOrEqual(22);
  for (let i = 0; i < 12; i++) await page.touchscreen.tap(12, 200);
  await expect
    .poll(() => page.locator('.field-pulse[data-active="true"]').count())
    .toBeGreaterThan(0);
  expect(await page.locator('.field-pulse[data-active="true"]').count()).toBeLessThanOrEqual(3);
  const client = await context.newCDPSession(page);
  await client.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x: 12, y: 650, id: 1 }],
  });
  for (const y of [560, 450, 320, 200])
    await client.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x: 12, y, id: 1 }],
    });
  await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(50);
  await expect(page.locator('.site-field')).toHaveAttribute('data-state', 'running');
  expect(errors).toEqual([]);
  await context.close();
});

test('without JavaScript the SVG stays decorative and navigation remains usable', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.locator('.site-field')).toHaveCount(1);
  await expect(page.locator('.site-background')).toHaveAttribute('aria-hidden', 'true');
  await expect(page.getByRole('button', { name: 'Pause motion' })).toHaveCount(0);
  await page.getByRole('link', { name: 'Make it yours', exact: true }).click();
  await expect(page).toHaveURL(/\/docs\/getting-started\/$/);
  await expect(page.locator('h1')).toBeVisible();
  await context.close();
});
