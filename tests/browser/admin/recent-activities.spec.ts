import { test, expect } from '../fixtures/test';
import { mockSignInResponsesByEmail } from '../../../src/mocks/data/sign-in';

test.use({ mockModules: ['admin/recent-activities'] });
test.beforeEach(async ({ context, baseURL }) => {
  await context.addCookies([
    { name: 'access_token', value: mockSignInResponsesByEmail['admin@pusan.ac.kr'].token, url: baseURL! },
  ]);
});

test('최근 이력을 API 순서대로 표시하고 대회명 null을 생략한다', async ({ page }) => {
  await page.goto('/admin');
  const panel = page.getByRole('region', { name: '최근 관리 이력' });
  await expect(panel.getByRole('listitem')).toHaveCount(4);
  await expect(panel.getByRole('listitem').first()).toContainText('첫 번째 이력');
  await expect(panel.getByRole('listitem').first()).toContainText('대상: 첫 대상 · 처리: 운영자');
  await expect(panel.getByRole('listitem').first()).not.toContainText('null');
  await expect(panel.getByRole('listitem').nth(1)).toContainText('테스트 대회');
  await expect(panel.locator('time').first()).toHaveAttribute('datetime', '2026-11-19T14:30:00');
});

test.describe('빈 이력', () => {
  test.use({ mockModules: ['admin/recent-activities', 'admin/recent-activities-empty'] });
  test('빈 상태를 표시한다', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.getByText('최근 관리 이력이 없습니다.')).toBeVisible();
  });
});

test.describe('접근 거부', () => {
  test.use({ mockModules: ['admin/recent-activities', 'admin/recent-activities-forbidden'] });
  test('403 권한 안내를 표시한다', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.getByRole('alert').getByText('관리 이력을 볼 권한이 없습니다.')).toBeVisible();
  });
});

test.describe('조회 실패', () => {
  test.use({ mockModules: ['admin/recent-activities', 'admin/recent-activities-failure'] });
  test('오류를 안내하고 재시도할 수 있다', async ({ page }) => {
    await page.goto('/admin');
    const panel = page.getByRole('region', { name: '최근 관리 이력' });
    await expect(panel.getByRole('alert')).toContainText('관리 이력을 불러오지 못했어요.');
    await panel.getByRole('button', { name: '다시 시도' }).click();
    await expect(panel.getByText('최근 관리 이력이 없습니다.')).toBeVisible();
  });
});
