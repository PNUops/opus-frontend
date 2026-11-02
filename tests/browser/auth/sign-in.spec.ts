import { test, expect } from '../fixtures/test';
import { expectMswReady } from '../support/ready';
import { mockSignInResponsesByEmail } from '../../../src/mocks/data/sign-in';

test.use({ mockModules: ['auth/notifications'] });

test.beforeEach(async ({ page }) => {
  await page.goto('/signin');
  await expectMswReady(page);
  await page.getByRole('button', { name: '확인', exact: true }).click();
});

test('잘못된 비밀번호 오류를 확인한 뒤 다시 입력해 로그인한다', async ({ page, context }) => {
  await page.getByLabel('이메일', { exact: true }).fill('test@pusan.ac.kr');
  await page.getByLabel('비밀번호', { exact: true }).fill('incorrect');
  const rejected = page.waitForResponse((response) => response.url().endsWith('/api/sign-in'));
  await page.getByRole('button', { name: '로그인', exact: true }).click();
  expect((await rejected).status()).toBe(400);
  // Status prefixes for assistive technology may surround the visible message.
  await expect(page.getByRole('status').getByText('로그인에 실패했어요.')).toBeVisible();
  await expect(page).toHaveURL('/signin');
  await expect(page.getByRole('button', { name: '로그인', exact: true })).toBeEnabled();
  expect((await context.cookies()).filter((cookie) => cookie.name === 'access_token')).toEqual([]);

  await page.getByLabel('비밀번호', { exact: true }).fill('test');
  const accepted = page.waitForResponse((response) => response.url().endsWith('/api/sign-in'));
  await page.getByRole('button', { name: '로그인', exact: true }).click();
  const response = await accepted;
  expect(response.status()).toBe(200);
  expect(response.fromServiceWorker()).toBe(true);
  expect(await response.json()).toEqual(mockSignInResponsesByEmail['test@pusan.ac.kr']);
  await expect(page).toHaveURL('/');
  await page.getByRole('button', { name: '프로필 메뉴 열기', exact: true }).click();
  await expect(page.getByRole('menuitem', { name: '로그아웃', exact: true })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: '지도 활동', exact: true })).toHaveCount(0);
});

test('새 테스트는 이전 로그인과 온보딩 확인 상태를 공유하지 않는다', async ({ page, context }) => {
  await expect(page.getByRole('button', { name: '로그인', exact: true })).toBeVisible();
  expect((await context.cookies()).filter((cookie) => cookie.name === 'access_token')).toEqual([]);
  await page.goto('/admin');
  await expect(page.getByText('관리자 권한이 없습니다.', { exact: true })).toBeVisible();
});

test('교수 계정으로 로그인하면 지도 활동 메뉴를 사용할 수 있다', async ({ page }) => {
  await page.getByLabel('이메일', { exact: true }).fill('professor@pusan.ac.kr');
  await page.getByLabel('비밀번호', { exact: true }).fill('test');
  await page.getByRole('button', { name: '로그인', exact: true }).click();
  await expect(page).toHaveURL('/');
  await page.getByRole('button', { name: '프로필 메뉴 열기', exact: true }).click();
  await expect(page.getByRole('menuitem', { name: '지도 활동', exact: true })).toHaveAttribute(
    'href',
    '/me/advisor-activity',
  );
  await expect(page.getByRole('menuitem', { name: '관리자페이지', exact: true })).toHaveCount(0);
});

test.describe('서버 오류', () => {
  test.use({ mockModules: ['auth/unavailable'] });

  test('503 응답 시 오류를 안내하고 인증 없이 재시도할 수 있다', async ({ page, context }) => {
    await page.getByLabel('이메일', { exact: true }).fill('test@pusan.ac.kr');
    await page.getByLabel('비밀번호', { exact: true }).fill('test');
    const response = page.waitForResponse((response) => response.url().endsWith('/api/sign-in'));
    await page.getByRole('button', { name: '로그인', exact: true }).click();
    expect((await response).status()).toBe(503);
    await expect(page.getByRole('status').getByText('로그인에 실패했어요.')).toBeVisible();
    await expect(page).toHaveURL('/signin');
    await expect(page.getByLabel('이메일', { exact: true })).toHaveValue('test@pusan.ac.kr');
    await expect(page.getByLabel('비밀번호', { exact: true })).toHaveValue('test');
    await expect(page.getByRole('button', { name: '로그인', exact: true })).toBeEnabled();

    const retried = page.waitForResponse((response) => response.url().endsWith('/api/sign-in'));
    await page.getByRole('button', { name: '로그인', exact: true }).click();
    expect((await retried).status()).toBe(503);
    await expect(page.getByRole('button', { name: '로그인', exact: true })).toBeEnabled();
    await expect(page).toHaveURL('/signin');
    expect((await context.cookies()).filter((cookie) => cookie.name === 'access_token')).toEqual([]);
  });
});
