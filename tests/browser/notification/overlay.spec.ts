import { test, expect } from '../fixtures/test';
import { expectMswReady } from '../support/ready';

declare global {
  interface Window {
    __targetScrolls: number;
  }
}

test.use({ mockModules: ['auth/notification-delay'] });

test.beforeEach(async ({ page }) => {
  await page.goto('/signin');
  await expectMswReady(page);
  await page.getByRole('button', { name: '확인', exact: true }).click();
  await page.getByLabel('이메일', { exact: true }).fill('test@pusan.ac.kr');
  await page.getByLabel('비밀번호', { exact: true }).fill('test');
  await page.getByRole('button', { name: '로그인', exact: true }).click();
  await expect(page).toHaveURL('/');
});

for (const width of [1440, 390]) {
  test(`${width}px 알림 패널은 화면 안에 표시되고 닫힌 뒤 프로필 버튼으로 포커스가 돌아간다`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const profile = page.getByRole('button', { name: /^프로필 메뉴 열기/ });
    const dialog = page.getByRole('dialog', { name: '알림', exact: true });
    const open = async () => {
      await profile.click();
      await page.getByRole('menuitem', { name: /^알림/ }).click();
      await expect(dialog).toBeVisible();
      await expect(dialog).toBeFocused();
    };

    await open();
    const bounds = await dialog.boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds!.x).toBeGreaterThanOrEqual(16);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width - 16);
    expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(900 - 16);
    await page.getByRole('button', { name: '알림 닫기', exact: true }).click();
    await expect(dialog).toBeHidden();
    await expect(profile).toBeFocused();

    await open();
    await page.mouse.click(8, 200);
    await expect(dialog).toBeHidden();

    await open();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(profile).toBeFocused();
  });
}

test('모두 읽음 요청 중에도 Esc로 닫을 수 있고 늦은 응답이 화면을 다시 열지 않는다', async ({ page }) => {
  const profile = page.getByRole('button', { name: /^프로필 메뉴 열기/ });
  await profile.click();
  await page.getByRole('menuitem', { name: /^알림/ }).click();
  const dialog = page.getByRole('dialog', { name: '알림', exact: true });
  const readAll = dialog.getByRole('button', { name: '모두 읽음', exact: true });
  const response = page.waitForResponse(
    (result) => result.request().method() === 'PATCH' && result.url().endsWith('/api/notifications'),
  );
  await readAll.click();
  await expect(readAll).toBeDisabled();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(profile).toBeFocused();
  expect((await response).status()).toBe(204);
  await expect(dialog).toBeHidden();
  await expect(page).toHaveURL('/');
});

test('알림의 제출 항목은 자동 스크롤하고 직접 항목을 전환할 때는 자동 스크롤하지 않는다', async ({ page }) => {
  await page.evaluate(() => {
    window.__targetScrolls = 0;
    const scrollIntoView = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = function (options) {
      if (this.classList.contains('scroll-mt-4')) window.__targetScrolls += 1;
      scrollIntoView.call(this, options);
    };
  });
  await page.getByRole('button', { name: /^프로필 메뉴 열기/ }).click();
  await page.getByRole('menuitem', { name: /^알림/ }).click();
  await page
    .getByRole('dialog', { name: '알림', exact: true })
    .getByRole('button', { name: /^제출 완료 알림/ })
    .click();
  await expect(page).toHaveURL('/me/contests/1/teams/101/submissions?submissionItemId=11');
  const details = page.getByRole('button', { name: '자세히 보기', exact: true });
  await expect(details.first()).toHaveAttribute('aria-expanded', 'true');
  await expect.poll(() => page.evaluate(() => window.__targetScrolls)).toBe(1);
  await details.nth(1).click();
  await expect(details.nth(1)).toHaveAttribute('aria-expanded', 'true');
  await page.evaluate(async () => {
    await Promise.all(document.getAnimations().map((animation) => animation.finished.catch(() => undefined)));
  });
  expect(await page.evaluate(() => window.__targetScrolls)).toBe(1);
});
