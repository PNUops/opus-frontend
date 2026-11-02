import { test, expect } from '../fixtures/test';
import { mockCurrentContestsResponse } from '../../../src/mocks/data/contest';

test('기본 핸들러는 다른 테스트의 빈 데이터 override를 공유하지 않는다', async ({ page }) => {
  await page.goto('/');
  const contests = page.getByRole('region', {
    name: `현재 진행 중인 대회 ${mockCurrentContestsResponse.length}개`,
    exact: true,
  });
  await expect(contests.getByRole('link', { name: /대회 보기$/ })).toHaveCount(mockCurrentContestsResponse.length);
  await page.getByRole('button', { name: '로그인 / 회원가입', exact: true }).click();
  await expect(page).toHaveURL('/signin');
});

test.describe('진행 중인 대회가 없는 경우', () => {
  test.use({ mockModules: ['contest/empty'] });

  test('최근 대회를 표시하고 새로고침해도 시나리오를 유지한다', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('region', { name: '최근 대회 3개', exact: true })).toBeVisible();
    await page.reload();
    await expect(page.getByRole('region', { name: '최근 대회 3개', exact: true }).getByRole('link')).toHaveCount(3);
    await expect(page.getByRole('region', { name: /^현재 진행 중인 대회/ })).toHaveCount(0);
  });
});
