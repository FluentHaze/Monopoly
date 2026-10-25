import { test, expect, type Page } from '@playwright/test';
import { createGame, STORAGE_KEY, type GameState } from '../../src/views/monopoly/game';
async function start(page: Page, overrides: Partial<GameState> = {}) {
  const state = { ...createGame(), ...overrides };
  await page.addInitScript(
    ({ key, state }) => {
      if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(state));
    },
    { key: STORAGE_KEY, state },
  );
  await page.goto('/');
  await expect(page.locator('.island-map')).toBeVisible();
  await page.waitForFunction(() => Array.from(document.images).every(i => i.complete));
}
async function roll(page: Page, points: number) {
  await page.evaluate(p => {
    Math.random = () => (p - 0.5) / 6;
  }, points);
  await page.getByRole('button', { name: '掷骰子', exact: true }).click();
  await page.clock.runFor(5500);
  await expect(page.locator('.island-map')).toHaveAttribute('data-phase', 'idle');
}
async function state(page: Page): Promise<GameState> {
  return page.evaluate(key => JSON.parse(localStorage.getItem(key)!), STORAGE_KEY);
}
for (const width of [320, 375, 390, 560, 760, 768, 1024, 1440, 1920]) {
  test(`responsive ${width}px: no overflow, all inner tiles accessible, details close`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await start(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    expect(await page.locator('.tile-inner').count()).toBe(7);
    await expect
      .poll(async () => {
        const explorer = await page.locator('.explorer').boundingBox();
        const active = await page.locator('.tile-active').boundingBox();
        return Math.abs(explorer!.y + explorer!.height - active!.y - active!.height / 2);
      })
      .toBeLessThan(30);
    const board = await page.locator('.board-panel').boundingBox();
    for (const id of [0, 6, 15, 21, 27, 30, 31, 32, 33, 34, 35, 36]) {
      const tile = await page.locator(`[data-tile="${id}"]`).boundingBox();
      expect(tile!.x).toBeGreaterThanOrEqual(0);
      expect(tile!.x + tile!.width).toBeLessThanOrEqual(width);
      expect(tile!.y).toBeGreaterThanOrEqual(board!.y);
    }
    await page.locator('[data-tile="31"]').click();
    await expect(page.getByRole('dialog')).toContainText('水晶 +1');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });
}
for (const width of [1440, 390]) {
  test(`complete adventure ${width}px: effects, inner route, lap, reward, persistence`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    await start(page);
    await page.clock.install();
    const points = [5, 3, 6, 4, 3, 1, 6, 6, 5, 6, 1, 1, 6, 6, 6, 1];
    const positions = [9, 8, 14, 18, 21, 22, 23, 22, 27, 35, 36, 11, 17, 23, 29, 0];
    for (let i = 0; i < points.length; i++) {
      await roll(page, points[i]!);
      const s = await state(page);
      expect(s.position).toBe(positions[i]);
      expect(await page.locator('.island-map').getAttribute('data-position')).toBe(
        String(s.position),
      );
    }
    expect((await state(page)).completed).toBe(1);
    expect((await state(page)).dice).toBe(87);
    expect((await state(page)).coins).toBe(150);
    await page.getByRole('button', { name: '第 1 圈宝箱可领取', exact: true }).click();
    await expect(page.getByRole('button', { name: '第 1 圈宝箱已领取' })).toBeDisabled();
    expect((await state(page)).coins).toBe(200);
    await page.reload();
    await expect(page.getByTestId('coins')).toHaveText('200');
    await expect(page.getByTestId('position')).toHaveText('1');
    await expect(page.getByRole('button', { name: '第 1 圈宝箱已领取' })).toBeDisabled();
    expect(errors).toEqual([]);
  });
}
test('dice and movement animate; spam click is locked; resizing mid-animation preserves position', async ({
  page,
}) => {
  await start(page);
  await page.clock.install();
  await page.evaluate(() => {
    Math.random = () => 0.7;
  });
  await page.getByRole('button', { name: '掷骰子', exact: true }).click();
  await expect(page.locator('.dice-scene')).toHaveAttribute('data-rolling', 'true');
  await expect(page.locator('.roll-button')).toBeDisabled();
  await page.locator('.roll-button').evaluate((el: HTMLButtonElement) => {
    el.click();
    el.click();
  });
  await page.clock.runFor(1200);
  await expect(page.locator('.island-map')).toHaveAttribute('data-phase', 'moving');
  await page.setViewportSize({ width: 375, height: 844 });
  await page.clock.runFor(5000);
  const s = await state(page);
  expect(s.dice).toBe(98);
  expect(s.position).toBe(9);
  await expect(page.locator('.dice-scene')).toHaveAttribute('data-result', '5');
  await expect(page.locator('.island-map')).toHaveAttribute('data-phase', 'idle');
});
test('slow animation displays effective result 1 and countdown persists after refresh', async ({
  page,
}) => {
  await start(page, { position: 7, slow: 3 });
  await page.clock.install();
  await roll(page, 6);
  expect((await state(page)).position).toBe(8);
  expect((await state(page)).slow).toBe(2);
  await expect(page.locator('.dice-scene')).toHaveAttribute('data-result', '1');
  await page.reload();
  await expect(page.getByTestId('slow')).toContainText('2 次慢行');
});
test('zero dice prevents roll but permits earned chest claim', async ({ page }) => {
  await start(page, { dice: 0, completed: 1 });
  await expect(page.getByRole('button', { name: '骰子已用完' })).toBeDisabled();
  await page.getByRole('button', { name: '第 1 圈宝箱可领取', exact: true }).click();
  expect((await state(page)).coins).toBe(50);
});
test('expired activity prevents roll and does not restart countdown on refresh', async ({
  page,
}) => {
  await start(page, { expiresAt: Date.now() - 1000 });
  await expect(page.getByRole('button', { name: '本轮活动已结束' })).toBeDisabled();
  await expect(page.getByTestId('countdown')).toHaveText('00天 00:00:00');
  await page.reload();
  await expect(page.getByRole('button', { name: '本轮活动已结束' })).toBeDisabled();
});
test('rules and reset dialogs: focus trap, cancel, confirm, reset storage', async ({ page }) => {
  await start(page, { position: 31, coins: 200, gems: 2, completed: 1 });
  await page.locator('.journal-panel > button').click();
  await expect(page.getByRole('dialog')).toContainText('接下来 3 次投掷各走 1 格');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: '关闭弹窗' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('.journal-panel > button')).toBeFocused();
  await page.getByRole('button', { name: '重新冒险', exact: true }).click();
  await page.getByRole('button', { name: '继续当前冒险' }).click();
  expect((await state(page)).coins).toBe(200);
  await page.getByRole('button', { name: '重新冒险', exact: true }).click();
  await page.getByRole('button', { name: '重新开始', exact: true }).click();
  expect((await state(page)).position).toBe(0);
  expect((await state(page)).coins).toBe(0);
  expect((await state(page)).dice).toBe(99);
});
test('screenshots: PC and H5 approved art integrated with seven inner cells', async ({ page }) => {
  await start(page);
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.screenshot({ path: 'test-results/pc-final.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForFunction(
    () =>
      Math.abs(
        document.querySelector('.board-viewport')!.getBoundingClientRect().height -
          (document.querySelector('.board-viewport')!.getBoundingClientRect().width * 820) / 720,
      ) < 1,
  );
  await page.screenshot({ path: 'test-results/h5-final.png', fullPage: true });
});

for (const points of [1, 2, 3, 4, 5, 6]) {
  test(`dice animation outcome ${points}: pips, movement and balance agree`, async ({ page }) => {
    await start(page);
    await page.clock.install();
    await roll(page, points);
    await expect(page.locator('.dice-scene')).toHaveAttribute('data-result', String(points));
    await expect(page.locator('.dice-scene .dice-art')).toBeVisible();
    await expect(page.locator('.dice-result')).toHaveText(`${points} 点好运`);
    await expect(page.locator('.dice-face')).toHaveCount(0);
    expect((await state(page)).position).toBe(points === 5 ? 9 : points);
    expect((await state(page)).dice).toBe(98);
  });
}
test('CSS dice fallback remains playable without WebGL', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: string,
      ...args: unknown[]
    ) {
      if (type.includes('webgl')) return null;
      return original.apply(this, [type, ...args] as Parameters<typeof original>);
    } as typeof original;
  });
  await start(page);
  await page.clock.install();
  await page.evaluate(() => {
    Math.random = () => 0.25;
  });
  await page.getByRole('button', { name: '掷骰子', exact: true }).click();
  await expect(page.locator('.dice-art.spinning')).toBeVisible();
  await page.clock.runFor(5500);
  expect((await state(page)).position).toBe(2);
  expect((await state(page)).dice).toBe(98);
});

test('visual fixes: restrained corners, separated legend, complete hat asset and fitted selection', async ({
  page,
}) => {
  await start(page);
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await expect
      .poll(async () => {
        const map = await page.locator('.island-map').boundingBox();
        const legend = await page.locator('.board-legend').boundingBox();
        return legend!.y - map!.y - map!.height;
      })
      .toBeGreaterThan(7);
    const corners = await page.locator('.island-map').evaluate(el => {
      const css = getComputedStyle(el);
      return [
        css.borderTopLeftRadius,
        css.borderTopRightRadius,
        css.borderBottomLeftRadius,
        css.borderBottomRightRadius,
      ];
    });
    expect(new Set(corners).size).toBe(1);
    expect(corners.every(value => !value.includes('%'))).toBe(true);
    expect(await page.locator('.tile-active').getAttribute('aria-current')).toBe('location');
    expect(
      await page.locator('.tile-active').evaluate(el => getComputedStyle(el, '::before').content),
    ).toBe('none');
  }
  const padding = await page.locator('.explorer > img').evaluate((el: HTMLImageElement) => {
    const canvas = document.createElement('canvas');
    canvas.width = el.naturalWidth;
    canvas.height = el.naturalHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(el, 0, 0);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let minY = canvas.height,
      maxY = -1;
    for (let y = 0; y < canvas.height; y++)
      for (let x = 0; x < canvas.width; x++)
        if (data[(y * canvas.width + x) * 4 + 3]! > 32) {
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
        }
    return { top: minY, bottom: canvas.height - 1 - maxY };
  });
  expect(padding.top).toBeGreaterThan(20);
  expect(padding.bottom).toBeGreaterThan(20);
});

test('page navigation preserves hash route, current progress and project title', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 800 });
  await start(page, { position: 31, coins: 100 });
  await expect(page).toHaveTitle('大富翁 · 幸运冒险岛');
  const url = page.url();
  const before = await state(page);
  await page.locator('nav a[href="#rewards"]').click();
  await expect(page).toHaveURL(url);
  expect(await state(page)).toEqual(before);
  await page.locator('nav a[href="#board"]').click();
  await expect(page).toHaveURL(url);
});
