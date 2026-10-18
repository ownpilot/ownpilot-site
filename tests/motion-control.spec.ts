import { test, expect } from '@playwright/test';

const key = 'ownpilot-background-motion';

test('turning effects off releases input listeners and frames, clears effects, and restarts without duplicates', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const listeners = new Set<EventListenerOrEventListenerObject>();
    const frames = new Set<number>();
    const add = EventTarget.prototype.addEventListener;
    const remove = EventTarget.prototype.removeEventListener;
    EventTarget.prototype.addEventListener = function (type, callback, options) {
      if (this === document && type === 'pointermove' && callback) listeners.add(callback);
      return add.call(this, type, callback, options);
    };
    EventTarget.prototype.removeEventListener = function (type, callback, options) {
      if (this === document && type === 'pointermove' && callback) listeners.delete(callback);
      return remove.call(this, type, callback, options);
    };
    const request = window.requestAnimationFrame.bind(window);
    const cancel = window.cancelAnimationFrame.bind(window);
    window.requestAnimationFrame = (callback) => {
      const id = request((time) => {
        frames.delete(id);
        callback(time);
      });
      frames.add(id);
      return id;
    };
    window.cancelAnimationFrame = (id) => {
      frames.delete(id);
      cancel(id);
    };
    Object.defineProperty(window, '__motionResources', {
      value: () => ({ listeners: listeners.size, frames: frames.size }),
    });
  });
  await page.goto('/');
  const field = page.locator('.site-field');
  await expect(field).toHaveAttribute('data-state', 'running');
  const resources = () =>
    page.evaluate(() =>
      (
        window as unknown as { __motionResources: () => { listeners: number; frames: number } }
      ).__motionResources(),
    );
  const running = await resources();
  expect(running.frames).toBeGreaterThan(0);
  for (let i = 0; i < 3; i++) {
    await page.mouse.click(18, 210);
    await expect
      .poll(() => page.locator('.field-pulse[data-active=true]').count())
      .toBeGreaterThan(0);
    await page.getByRole('button', { name: 'Animasyonları kapat', exact: true }).click();
    await expect(field).toHaveAttribute('data-state', 'off');
    await expect(page.locator('.field-node, .field-pulse, .field-relay, .field-trail')).toHaveCount(
      0,
    );
    await expect(page.locator('[data-pointer]')).toHaveAttribute('opacity', '0');
    expect(await resources()).toEqual({ listeners: running.listeners - 1, frames: 0 });
    await page.mouse.click(18, 210);
    await expect(page.locator('.field-pulse')).toHaveCount(0);
    await page.getByRole('button', { name: 'Animasyonları aç', exact: true }).click();
    await expect(field).toHaveAttribute('data-state', 'running');
    expect((await resources()).listeners).toBe(running.listeners);
  }
  await page.getByRole('button', { name: 'Animasyonları kapat', exact: true }).click();
  await page.getByRole('button', { name: 'Research', exact: true }).click();
  await expect(page.getByRole('img', { name: /Turn a topic/ })).toBeVisible();
  await expect(field).toHaveAttribute('data-state', 'off');
});

test('the mouse control is adjacent to themes, keyboard operable, touch sized and persists an explicit choice', async ({
  page,
}) => {
  await page.goto('/');
  const on = page.getByRole('button', { name: 'Animasyonları kapat', exact: true });
  const off = page.getByRole('button', { name: 'Animasyonları aç', exact: true });
  await expect(on).toHaveAttribute('aria-pressed', 'true');
  await expect(on).toHaveAttribute('title', 'Animasyonları kapat');
  expect(await page.locator('.theme-picker').evaluate((el) => el.nextElementSibling?.id)).toBe(
    'background-motion-slot',
  );
  await on.focus();
  await on.press('Space');
  await expect(off).toHaveAttribute('aria-pressed', 'false');
  await expect(off).toHaveAttribute('title', 'Animasyonları aç');
  expect(await page.evaluate((key) => localStorage.getItem(key), key)).toBe('off');
  await page.reload();
  await expect(page.locator('.site-field')).toHaveAttribute('data-state', 'off');
  await off.press('Enter');
  await expect(on).toHaveAttribute('aria-pressed', 'true');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  await expect(page.locator('.site-field')).toHaveAttribute('data-state', 'running');
  await expect(on).toBeEnabled();
  for (const width of [375, 320]) {
    await page.setViewportSize({ width, height: 844 });
    const box = (await on.boundingBox())!;
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
});

test('storage failures leave the control usable and preserve the device default', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() =>
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new DOMException('Storage blocked', 'SecurityError');
      },
    }),
  );
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('.site-field')).toHaveAttribute('data-state', 'reduced');
  await page.getByRole('button', { name: 'Animasyonları aç', exact: true }).click();
  await expect(page.locator('.site-field')).toHaveAttribute('data-state', 'running');
  await page.getByRole('button', { name: 'Animasyonları kapat', exact: true }).click();
  await expect(page.locator('.site-field')).toHaveAttribute('data-state', 'off');
  expect(errors).toEqual([]);
});
