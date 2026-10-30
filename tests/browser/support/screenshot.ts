import { expect, type Page, type TestInfo } from '@playwright/test';

// Optional visual review only; functional tests do not wait for fonts or capture.
export async function attachScreenshot(page: Page, testInfo: TestInfo, name: string) {
  const loaded = await page.evaluate(async () => {
    const sample = '부산대학교 프로젝트 회원가입';
    const fonts = ['400 16px "Noto Sans KR"', '700 16px "Noto Sans KR"'];
    const faces = await Promise.all(fonts.map((font) => document.fonts.load(font, sample)));
    return faces.every((group) => group.length > 0 && group.every((face) => face.status === 'loaded'));
  });
  expect(loaded, 'Korean font must be ready for visual review').toBe(true);
  await testInfo.attach(name, {
    body: await page.screenshot({ fullPage: true, animations: 'disabled' }),
    contentType: 'image/png',
  });
}
