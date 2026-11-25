import { test, expect } from '../fixtures/test';
import { mockSignInResponsesByEmail } from '../../../src/mocks/data/sign-in';

test.use({ mockModules: ['admin/sidebar'] });

test.beforeEach(async ({ context, baseURL }) => {
  await context.addCookies([
    { name: 'access_token', value: mockSignInResponsesByEmail['admin@pusan.ac.kr'].token, url: baseURL! },
  ]);
});

test('루트 메뉴에서 관리 영역으로 이동하고 현재 위치를 표시한다', async ({ page }) => {
  await page.goto('/admin');
  const sidebar = page.getByRole('complementary', { name: '관리자 사이드 내비게이션' });
  await sidebar.getByRole('link', { name: '대회 카테고리' }).click();
  await expect(page).toHaveURL(/\/admin#contest-categories$/);
  await expect(sidebar.getByRole('link', { name: '대회 카테고리' })).toHaveAttribute('aria-current', 'location');
  await expect(page.getByRole('heading', { name: '대회 카테고리' })).toBeInViewport();
  await sidebar.getByRole('link', { name: '전체 공지사항' }).click();
  await expect(page.getByRole('heading', { name: '전체 공지사항 목록' })).toBeInViewport();
  await sidebar.getByRole('link', { name: '대시보드', exact: true }).click();
  await expect(sidebar.getByRole('link', { name: '대시보드', exact: true })).toHaveAttribute('aria-current', 'page');
});

test('모바일 메뉴는 닫을 때 포커스를 돌려준다', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/admin');
  const trigger = page.getByRole('button', { name: '관리자 메뉴 열기' });
  await trigger.click();
  await page.getByRole('button', { name: '관리자 메뉴 닫기' }).click();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.getByRole('link', { name: '대회 목록', exact: true }).click();
  await expect(page).toHaveURL(/\/admin#contests$/);
  await expect(page.getByRole('dialog', { name: '관리자 메뉴' })).toBeHidden();
});

test('대회 목록에서 대회별 관리로 이동하고 루트로 돌아온다', async ({ page }) => {
  await page.goto('/admin');
  await page.getByRole('link', { name: '대회 목록', exact: true }).click();
  await page.getByRole('link', { name: /제6회PNU창의융합SW해커톤/ }).click();
  await expect(page).toHaveURL(/\/admin\/contest\/1\/projects$/);
  await expect(page.getByRole('combobox', { name: '관리할 대회' })).toBeVisible();
  await expect(page.getByRole('link', { name: '프로젝트 관리' })).toHaveAttribute('aria-current', 'page');
  await page.getByRole('link', { name: '대시보드', exact: true }).click();
  await expect(page.getByRole('combobox', { name: '관리할 대회' })).toHaveCount(0);
});
