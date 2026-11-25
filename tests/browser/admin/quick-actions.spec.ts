import { test, expect } from '../fixtures/test';
import { mockSignInResponsesByEmail } from '../../../src/mocks/data/sign-in';

test.use({ mockModules: ['admin/quick-actions'] });
test.beforeEach(async ({ context, baseURL }) => {
  await context.addCookies([
    { name: 'access_token', value: mockSignInResponsesByEmail['admin@pusan.ac.kr'].token, url: baseURL! },
  ]);
});

test('대회를 선택해 팀을 등록하고 성공 시 닫힌다', async ({ page }) => {
  await page.goto('/admin');
  await page.getByRole('button', { name: /등록 시작/ }).click();
  await expect(page.getByRole('button', { name: '등록하기' })).toBeDisabled();
  await page.getByRole('combobox', { name: '대상 대회 *' }).click();
  await page.getByRole('option', { name: '제6회PNU창의융합SW해커톤' }).click();
  await expect(page.getByRole('dialog', { name: '팀 일괄 등록' })).toContainText('제6회PNU창의융합SW해커톤');
  await page.locator('input[type=file]').setInputFiles({
    name: 'teams.xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    buffer: Buffer.from('test'),
  });
  const request = page.waitForRequest(
    (req) => req.method() === 'POST' && req.url().endsWith('/api/contests/1/teams/bulk'),
  );
  await page.getByRole('button', { name: '등록하기' }).click();
  await request;
  await expect(page.getByRole('dialog', { name: '팀 일괄 등록' })).toBeHidden();
});

test('팀 등록 파일은 10MB를 초과하면 선택할 수 없다', async ({ page }) => {
  await page.goto('/admin');
  await page.getByRole('button', { name: /등록 시작/ }).click();
  await page.getByRole('combobox', { name: '대상 대회 *' }).click();
  await page.getByRole('option', { name: '제6회PNU창의융합SW해커톤' }).click();
  await page.locator('input[type=file]').setInputFiles({
    name: 'large.xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    buffer: Buffer.alloc(10 * 1024 * 1024 + 1),
  });
  await expect(page.getByText('파일 크기는 10MB 이하여야 합니다.')).toBeVisible();
  await expect(page.getByRole('button', { name: '등록하기' })).toBeDisabled();
});

test('팀 등록 실패 시 행별 오류를 표시한다', async ({ page }) => {
  await page.goto('/admin');
  await page.getByRole('button', { name: /등록 시작/ }).click();
  await page.getByRole('combobox', { name: '대상 대회 *' }).click();
  await page.getByRole('option', { name: '제5회PNU창의융합SW해커톤' }).click();
  await page.locator('input[type=file]').setInputFiles({
    name: 'teams.xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    buffer: Buffer.from('test'),
  });
  await page.getByRole('button', { name: '등록하기' }).click();
  await expect(page.getByRole('dialog', { name: '템플릿 형식 오류' })).toContainText('5행 - 팀 이름은 필수입니다.');
});

test('제출 항목 폼에 선택한 대회를 표시하고 취소할 수 있다', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/admin');
  await page.getByRole('button', { name: /항목 추가/ }).click();
  await page.getByRole('button', { name: /제6회PNU창의융합SW해커톤/ }).click();
  const dialog = page.getByRole('dialog', { name: '제출 항목 추가' });
  await expect(dialog).toContainText('대상 대회: 제6회PNU창의융합SW해커톤');
  await expect(dialog.getByLabel('제출 항목 이름')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(page.getByRole('button', { name: /항목 추가/ })).toBeFocused();
});

test('선택한 대회로 제출 항목을 저장하고 실패 시 입력을 유지한다', async ({ page }) => {
  await page.goto('/admin');
  for (const [contestName, contestId, shouldSucceed] of [
    ['제5회PNU창의융합SW해커톤', 2, false],
    ['제6회PNU창의융합SW해커톤', 1, true],
  ] as const) {
    await page.getByRole('button', { name: /항목 추가/ }).click();
    await page.getByRole('button', { name: new RegExp(contestName) }).click();
    const dialog = page.getByRole('dialog', { name: '제출 항목 추가' });
    await dialog.getByLabel('제출 항목 이름').fill('보고서');
    await dialog.getByRole('button', { name: '.pdf', exact: true }).click();
    const request = page.waitForRequest(
      (req) => req.method() === 'POST' && req.url().endsWith(`/api/contests/${contestId}/submission-items`),
    );
    await dialog.getByRole('button', { name: '추가', exact: true }).click();
    expect((await request).postDataJSON().name).toBe('보고서');
    if (shouldSucceed) {
      await expect(dialog).toBeHidden();
      await expect(page).toHaveURL(/\/admin\/contest\/1\/submission-manage$/);
    } else {
      await expect(dialog.getByText('저장에 실패했어요.', { exact: false })).toBeVisible();
      await expect(dialog.getByLabel('제출 항목 이름')).toHaveValue('보고서');
      await dialog.getByRole('button', { name: '취소' }).click();
      await page
        .getByRole('dialog', { name: '작성을 취소하시겠어요?' })
        .getByRole('button', { name: '계속 작성' })
        .click();
      await expect(dialog.getByLabel('제출 항목 이름')).toHaveValue('보고서');
      await dialog.getByRole('button', { name: '취소' }).click();
      await page
        .getByRole('dialog', { name: '작성을 취소하시겠어요?' })
        .getByRole('button', { name: '작성 취소' })
        .click();
    }
  }
});

test('대회 공지 작성은 선택한 대회의 공지 관리로 이동한다', async ({ page }) => {
  await page.goto('/admin');
  await page.getByRole('button', { name: /공지 작성/ }).click();
  await page.getByRole('button', { name: /제5회PNU창의융합SW해커톤/ }).click();
  await expect(page).toHaveURL(/\/admin\/contest\/2\/notices$/);
  await expect(page.getByRole('button', { name: '+ 새 공지' })).toBeVisible();
});
