const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const ts = require('typescript');

// Compile the real utility without introducing a separate frontend test runtime.
const source = fs.readFileSync('src/utils/notification.ts', 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
}).outputText;
const moduleUnderTest = { exports: {} };
new Function('require', 'module', 'exports', compiled)(
  (id) => {
    if (id === '@queries/notification') return { NOTIFICATIONS_QUERY_KEY: ['notifications'] };
    if (id === '@queries/team') return { teamDetailOption: (teamId) => ({ teamId }) };
    return require(id);
  },
  moduleUnderTest,
  moduleUnderTest.exports,
);
const { resolveNotificationTargetPath, notificationTargetTypeLabel, markNotificationAsReadInCache } = moduleUnderTest.exports;
const notification = (targetType, redirectUrl, targetId = 999) => ({
  id: 12, title: '알림', content: '서버 문구', targetType, redirectUrl, targetId, isRead: false,
});
const noFetch = { fetchQuery: () => { throw new Error('Must not fetch a team for new notifications'); } };

for (const type of ['SUBMISSION_COMPLETED', 'SUBMISSION_FEEDBACK', 'SUBMISSION_DEADLINE']) {
  test(`${type} preserves submissionItemId and never interprets targetId as a team`, async () => {
    const path = '/me/contests/1/teams/3/submissions?submissionItemId=20#feedback';
    assert.equal(await resolveNotificationTargetPath(noFetch, notification(type, path)), path);
    assert.ok(notificationTargetTypeLabel[type]);
    assert.equal(await resolveNotificationTargetPath(noFetch, notification(type, '')), null);
  });
}
for (const type of ['ADVISOR_ASSIGNED', 'ADVISOR_UNASSIGNED', 'MENTOR_ASSIGNED', 'MENTOR_UNASSIGNED']) {
  test(`${type} respects recipient-specific routes`, async () => {
    for (const path of ['/me/contests/1/teams/3/dashboard', '/me/advisor-activity/contests/1', '/contest/1/teams/view/3']) {
      assert.equal(await resolveNotificationTargetPath(noFetch, notification(type, path)), path);
    }
    assert.ok(notificationTargetTypeLabel[type]);
  });
}
test('invalid and external redirects cannot trigger fallback team queries', async () => {
  for (const path of ['', 'https://evil.example/teams/3', '//evil.example', '/\\evil.example', 'javascript:alert(1)', '/me/\nfoo']) {
    assert.equal(await resolveNotificationTargetPath(noFetch, notification('SUBMISSION_FEEDBACK', path)), null);
  }
});
test('legacy team, comments and both award spellings keep their routes', async () => {
  for (const [type, path] of [
    ['TEAM', '/me/contests/1/teams/3/dashboard'],
    ['TEAM_COMMENT', '/contest/1/teams/view/3#comments'],
    ['TEAM_AWARD', '/contest/1/teams/view/3#awards'],
    ['TEAM_AWARDS', '/contest/1/teams/view/3#awards'],
  ]) assert.equal(await resolveNotificationTargetPath(noFetch, notification(type, '/contest/1/teams/view/3')), path);
  let requestedTeam;
  const client = { fetchQuery: async ({ teamId }) => { requestedTeam = teamId; return { contestId: 1 }; } };
  assert.equal(await resolveNotificationTargetPath(client, notification('TEAM', '/teams/3', 3)), '/me/contests/1/teams/3/dashboard');
  assert.equal(requestedTeam, 3);
  assert.equal(await resolveNotificationTargetPath({ fetchQuery: async () => { throw Error(); } }, notification('TEAM', '', 3)), null);
});
test('new notifications retain read cache behavior and server copy', () => {
  const original = notification('SUBMISSION_FEEDBACK', '/me/contests/1/teams/3/submissions?submissionItemId=20');
  let updated;
  markNotificationAsReadInCache({ setQueryData: (_, updater) => { updated = updater([original]); } }, 12);
  assert.deepEqual(updated, [{ ...original, isRead: true }]);
});
