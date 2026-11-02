const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');
const { QueryClient } = require('@tanstack/react-query');

// Match the existing submission tests: execute production code, replacing only API/React boundaries.
function createLoader(mocks = {}) {
  const modules = new Map();
  function load(relativePath) {
    const filename = path.resolve(__dirname, '..', relativePath);
    if (modules.has(filename)) return modules.get(filename);
    const exports = {};
    modules.set(filename, exports);
    const source = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    }).outputText;
    vm.runInNewContext(source, {
      exports,
      URL,
      URLSearchParams,
      require(name) {
        if (Object.hasOwn(mocks, name)) return mocks[name];
        const alias = name.match(/^@(utils|hooks|queries)\/(.*)$/);
        const local = alias
          ? path.resolve(__dirname, '..', 'src', alias[1], alias[2])
          : name.startsWith('.')
            ? path.resolve(path.dirname(filename), name)
            : null;
        if (!local) return require(name);
        return load(['.ts', '.tsx'].map((extension) => local + extension).find(fs.existsSync));
      },
    });
    return exports;
  }
  return load;
}

test('strict ID contract accepts safe numeric/decimal IDs and rejects malformed or unsafe values', () => {
  const { parsePositiveId } = createLoader()('src/utils/id.ts');
  for (const value of [1, '1', Number.MAX_SAFE_INTEGER, String(Number.MAX_SAFE_INTEGER)]) {
    assert.equal(parsePositiveId(value), Number(value));
  }
  for (const value of [
    null,
    undefined,
    '',
    0,
    -1,
    1.5,
    NaN,
    Infinity,
    '0',
    '01',
    '+1',
    ' 1',
    '1 ',
    '1e2',
    '1.0',
    '1x',
    Number.MAX_SAFE_INTEGER + 1,
  ]) {
    assert.equal(parsePositiveId(value), null, String(value));
  }
});

function notification(targetType, redirectUrl, targetId = 99) {
  return { id: 1, targetType, redirectUrl, targetId, isRead: false, title: 'title', content: 'content' };
}

test('route and query IDs share strict validation while query updates preserve unrelated parameters', () => {
  let params = new URLSearchParams('submissionItemId=2&tab=files');
  let routeId = '1';
  const load = createLoader({
    'react-router-dom': {
      useParams: () => ({ contestId: routeId, teamId: routeId, noticeId: routeId }),
      useSearchParams: () => [
        params,
        (update, options) => {
          assert.equal(options.replace, true);
          params = update(params);
        },
      ],
    },
  });
  const { useContestId, useTeamId, useNoticeId, useSearchParamId } = load('src/hooks/useId.ts');
  for (const [raw, expected] of [
    ['1', 1],
    ['42', 42],
    [String(Number.MAX_SAFE_INTEGER), Number.MAX_SAFE_INTEGER],
    ['', null],
    ['0', null],
    ['-1', null],
    ['01', null],
    ['+1', null],
    [' 1', null],
    ['1 ', null],
    ['1e2', null],
    ['0x10', null],
    ['1.5', null],
    ['Infinity', null],
    ['NaN', null],
    ['9007199254740993', null],
  ]) {
    routeId = raw;
    params.set('submissionItemId', raw);
    assert.equal(useContestId(), expected, `contestId: ${raw}`);
    assert.equal(useTeamId(), expected, `teamId: ${raw}`);
    assert.equal(useNoticeId(), expected, `noticeId: ${raw}`);
    assert.equal(useSearchParamId('submissionItemId')[0], expected, `query ID: ${raw}`);
  }
  routeId = undefined;
  params.delete('submissionItemId');
  assert.equal(useContestId(), null);
  assert.equal(useSearchParamId('submissionItemId')[0], null);
  params.set('submissionItemId', '2');
  assert.equal(useSearchParamId('submissionItemId')[0], 2);
  useSearchParamId('submissionItemId')[1](3);
  assert.equal(params.get('tab'), 'files');
  assert.equal(params.get('submissionItemId'), '3');
  for (const invalid of [0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    useSearchParamId('submissionItemId')[1](invalid);
    assert.equal(params.get('submissionItemId'), '3');
  }
  params.append('submissionItemId', '3');
  assert.equal(useSearchParamId('submissionItemId')[0], null, 'repeated identical query IDs are invalid');
  useSearchParamId('submissionItemId')[1](3);
  assert.equal(params.getAll('submissionItemId').length, 1);
  params.append('submissionItemId', '4');
  assert.equal(useSearchParamId('submissionItemId')[0], null);
  useSearchParamId('submissionItemId')[1](null);
  assert.equal(params.toString(), 'tab=files');
});

test('redirect hooks navigate only for invalid IDs and retain their default and custom destinations', () => {
  let raw = '42';
  const effects = [];
  const navigations = [];
  const load = createLoader({
    react: { useEffect: (effect) => effects.push(effect) },
    'react-router-dom': {
      useParams: () => ({ contestId: raw, teamId: raw, noticeId: raw }),
      useNavigate:
        () =>
        (...args) =>
          navigations.push(args),
    },
  });
  const { useContestIdOrRedirect, useTeamIdOrRedirect, useNoticeIdOrRedirect } = load('src/hooks/useId.ts');
  for (const hook of [useContestIdOrRedirect, useTeamIdOrRedirect, useNoticeIdOrRedirect]) {
    assert.equal(hook(), 42);
    effects.splice(0).forEach((effect) => effect());
    assert.equal(navigations.length, 0);
    for (const destination of [undefined, '/me/activity']) {
      raw = '1e2';
      hook(destination);
      effects.splice(0).forEach((effect) => effect());
      const [redirectTo, options] = navigations.pop();
      assert.equal(redirectTo, destination ?? '/');
      assert.equal(options.replace, true);
    }
    raw = '42';
  }
});

test('all seven new types preserve server paths; submission IDs never become team IDs', () => {
  const { getNotificationTarget } = createLoader()('src/utils/notification/targetPath.ts');
  const submissionPath = '/me/contests/1/teams/2/submissions?submissionItemId=3&tab=files#detail';
  for (const type of ['SUBMISSION_COMPLETED', 'SUBMISSION_FEEDBACK', 'SUBMISSION_DEADLINE']) {
    assert.equal(getNotificationTarget(notification(type, submissionPath)), submissionPath);
    for (const suffix of [
      '',
      '?submissionItemId=0',
      '?submissionItemId=1e2',
      '?submissionItemId=3&submissionItemId=4',
    ]) {
      assert.equal(getNotificationTarget(notification(type, '/me/contests/1/teams/2/submissions' + suffix)), null);
    }
    assert.equal(getNotificationTarget(notification(type, '/teams/99')), null);
  }
  for (const type of ['ADVISOR_ASSIGNED', 'MENTOR_ASSIGNED']) {
    for (const url of [
      '/me/advisor-activity/contests/1?teamId=2',
      '/me/advisor-activity/contests/1',
      '/me/contests/1/teams/2/dashboard',
    ]) {
      assert.equal(getNotificationTarget(notification(type, url)), url);
    }
  }
  for (const type of ['ADVISOR_UNASSIGNED', 'MENTOR_UNASSIGNED']) {
    for (const url of ['/contest/1/teams/view/2', '/me/contests/1/teams/2/dashboard']) {
      assert.equal(getNotificationTarget(notification(type, url)), url);
    }
  }
});

test('unsafe URLs and malformed legacy IDs cannot resolve to another team', () => {
  const { getNotificationTarget } = createLoader()('src/utils/notification/targetPath.ts');
  for (const url of [
    'https://other.test/teams/2',
    '//other.test/teams/2',
    '/\\other.test/teams/2',
    '/x/../teams/2',
    '/teams/2\n',
    '/teams/2.5',
    '/teams/2e3',
    '/teams/02',
    '/teams/-2',
    '/teams/9007199254740992',
    '/?teamId=2&teamId=3',
    '/contest/0/teams/2',
  ]) {
    assert.equal(getNotificationTarget(notification('TEAM', url)), null, url);
  }
});

test('legacy routes reuse the team query, preserve anchors, and handle lookup failure', async () => {
  const calls = [];
  let contestId = 7;
  const load = createLoader({
    '@tanstack/react-query': {
      useQueryClient: () => ({
        fetchQuery: async (option) => {
          calls.push(option.queryKey);
          if (contestId === 'error') throw new Error('forbidden');
          return { contestId };
        },
      }),
    },
    '@queries/team': { teamDetailOption: (id) => ({ queryKey: ['teamDetail', id] }) },
  });
  const resolve = load('src/hooks/useNotificationTargetPath.ts').useNotificationTargetPath();
  for (const [type, expected] of [
    ['TEAM', '/me/contests/7/teams/2/dashboard'],
    ['TEAM_COMMENT', '/contest/7/teams/view/2#comments'],
    ['TEAM_AWARDS', '/contest/7/teams/view/2#awards'],
  ]) {
    assert.equal(await resolve(notification(type, '/teams/2')), expected);
  }
  assert.equal(calls.length, 3);
  assert.equal(await resolve(notification('TEAM', '/contest/7/teams/view/2')), '/me/contests/7/teams/2/dashboard');
  assert.equal(calls.length, 3, 'explicit contest routes need no lookup');
  assert.equal(await resolve(notification('TEAM_AWARD', '/teams/2')), null);
  assert.equal(calls.length, 3, 'removed award type must not trigger a lookup');
  assert.equal(await resolve(notification('TEAM', '', 2)), '/me/contests/7/teams/2/dashboard');
  assert.equal(await resolve(notification('TEAM', '', -1)), null);
  for (contestId of [0, Number.MAX_SAFE_INTEGER + 1, 'error']) {
    assert.equal(await resolve(notification('TEAM', '/teams/2')), null);
  }
});

test('read cache updates preserve other data and support the existing rollback/invalidation flow', async () => {
  const load = createLoader({ '@apis/notification': { getNotifications: async () => [] } });
  const {
    NOTIFICATIONS_QUERY_KEY: key,
    markNotificationAsReadInCache,
    markAllNotificationsAsReadInCache,
    invalidateNotificationQueries,
  } = load('src/queries/notification.ts');
  const client = new QueryClient({ defaultOptions: { queries: { gcTime: Infinity } } });
  markAllNotificationsAsReadInCache(client);
  assert.equal(client.getQueryData(key), undefined);
  const initial = [notification('TEAM', '/teams/1'), { ...notification('TEAM_COMMENT', '/teams/2'), id: 2 }];
  client.setQueryData(key, initial);
  const snapshot = client.getQueryData(key);
  markNotificationAsReadInCache(client, 1);
  assert.equal(client.getQueryData(key)[0].isRead, true);
  assert.equal(client.getQueryData(key)[1].isRead, false);
  assert.equal(snapshot[0].isRead, false);
  client.setQueryData(key, snapshot);
  assert.equal(client.getQueryData(key)[0].isRead, false);
  markAllNotificationsAsReadInCache(client);
  assert.ok(client.getQueryData(key).every((entry) => entry.isRead));
  await invalidateNotificationQueries(client);
  assert.equal(client.getQueryState(key).isInvalidated, true);
  client.clear();
});

function createAdvisor() {
  const state = [];
  let cursor = 0;
  let changed = false;
  let task;
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false, gcTime: Infinity } } });
  const ctx = {
    contest: '1',
    search: '?teamId=11',
    isAdvisor: true,
    error: null,
    calls: [],
    saves: [],
    invalidations: [],
    save: async () => {},
  };
  const react = {
    useState(initial) {
      const index = cursor++;
      if (!(index in state)) state[index] = typeof initial === 'function' ? initial() : initial;
      return [
        state[index],
        (next) => {
          state[index] = typeof next === 'function' ? next(state[index]) : next;
          changed = true;
        },
      ];
    },
    useMemo: (fn) => fn(),
    useId: () => 'advisor-test',
    useRef: (initial) => react.useState(() => ({ current: initial }))[0],
  };
  const queryOptions = (kind, ...ids) => ({ queryKey: [kind, ...ids] });
  const jsx = (type, props) => ({ type, props });
  const load = createLoader({
    react,
    'react/jsx-runtime': { jsx, jsxs: jsx },
    'react-router-dom': {
      useParams: () => ({ contestId: ctx.contest }),
      useSearchParams: () => [new URLSearchParams(ctx.search)],
    },
    '@hooks/useAuth': { default: () => ({ isAdvisor: ctx.isAdvisor }), __esModule: true },
    '@hooks/useToast': { useToast: () => () => {} },
    '@utils/download': { downloadBlob() {} },
    'lucide-react': {},
    './components/AdvisorContestSummary': { AdvisorContestSummary: 'summary' },
    './components/AdvisorProjectList': { AdvisorProjectList: 'projects' },
    '@apis/advisor': {
      putAdvisorFeedback: (...args) => {
        ctx.saves.push(args);
        return ctx.save(...args);
      },
    },
    '@queries/advisor': {
      advisorContestsOption: () => queryOptions('contests'),
      advisorProjectsOption: (contest) => queryOptions('projects', contest),
      advisorTeamSubmissionsOption: (contest, team) => queryOptions('submissions', contest, team),
      advisorFeedbackOption: (contest, submission) => queryOptions('feedback', contest, submission),
      invalidateAdvisorActivityQueries: async (_client, ...ids) => ctx.invalidations.push(ids),
    },
    '@tanstack/react-query': {
      useQueryClient: () => queryClient,
      useMutationState: ({ filters, select }) => queryClient.getMutationCache().findAll(filters).map(select),
      useQuery(option) {
        const [kind, contest, id] = option.queryKey;
        if (option.enabled) ctx.calls.push(option.queryKey);
        const teamId = id;
        const data =
          kind === 'contests'
            ? [1, 2].map((contestId) => ({ contestId, contestName: `contest ${contestId}`, assignedTrackNames: [] }))
            : kind === 'projects'
              ? [11, 12].map((teamId) => ({ teamId, pendingFeedbackCount: 0 }))
              : kind === 'submissions'
                ? {
                    teamId,
                    submissions: [teamId * 10, teamId * 10 + 1].map((submissionId) => ({ submissionId, files: [] })),
                  }
                : {
                    feedbackId: id,
                    description: `server ${contest}/${id}`,
                    files: [{ fileId: 1, fileName: 'old.pdf', fileSize: 10 }],
                  };
        const isError = ctx.error === kind;
        return { data, isSuccess: option.enabled && !isError, isError, isLoading: false, refetch: async () => {} };
      },
      useMutation(options) {
        return {
          mutate(input) {
            const mutation = queryClient.getMutationCache().build(queryClient, options);
            task = mutation.execute(input).catch(() => {});
          },
        };
      },
    },
  });
  const Page = load('src/pages/me/advisor-activity/AdvisorActivityPage.tsx').default;
  const useSelection = load('src/pages/me/advisor-activity/hooks/useAdvisorSelection.ts').useAdvisorSelection;
  const render = (fn) => {
    let result;
    let count = 0;
    do {
      cursor = 0;
      changed = false;
      result = fn();
      assert.ok(++count < 10, 'render must settle');
    } while (changed);
    return result;
  };
  ctx.selection = () => render(() => useSelection(ctx.isAdvisor));
  ctx.page = () => {
    const tree = render(Page);
    return tree.props.children?.find?.((node) => node.type === 'projects')?.props ?? null;
  };
  ctx.finish = () => task;
  return ctx;
}

test('URL selection rejects invalid/unassigned IDs and clears stale selections before dependent queries', () => {
  const ctx = createAdvisor();
  assert.equal(ctx.selection().expandedTeamId, 11);
  ctx.selection().selectSubmission(111);
  assert.equal(ctx.selection().selectedSubmissionId, 111);
  ctx.search = '?teamId=12';
  assert.equal(ctx.selection().selectedSubmissionId, 120);
  for (const search of ['?teamId=999', '?teamId=0', '?teamId=1e1', '?teamId=11&teamId=12']) {
    ctx.search = search;
    ctx.calls.length = 0;
    const selection = ctx.selection();
    assert.equal(selection.expandedTeamId, null);
    assert.equal(selection.selectedSubmissionId, null);
    assert.ok(ctx.calls.every(([kind]) => kind !== 'submissions'));
  }
  ctx.search = '';
  assert.equal(ctx.selection().expandedTeamId, 11, 'summary links use the default list');
  ctx.selection().toggleTeam(12);
  ctx.contest = '2';
  assert.equal(ctx.selection().expandedTeamId, 11);
  ctx.contest = '1e0';
  ctx.calls.length = 0;
  assert.equal(ctx.selection().contestId, null);
  assert.ok(ctx.calls.every(([kind]) => kind === 'contests'));
  ctx.contest = undefined;
  ctx.search = '?contestId=1&contestId=2';
  assert.equal(ctx.selection().contestId, null);
});

test('failed permission refetches and non-advisors cannot expose cached team/submission data', () => {
  const ctx = createAdvisor();
  assert.equal(ctx.selection().selectedSubmissionId, 110);
  ctx.error = 'projects';
  assert.equal(ctx.selection().expandedTeamId, null);
  ctx.error = 'submissions';
  assert.equal(ctx.selection().selectedSubmissionId, null);
  ctx.error = null;
  ctx.isAdvisor = false;
  assert.equal(ctx.selection().contestId, null);
});

const localFile = { name: 'draft.pdf', size: 20 };
function activeSubmission(props) {
  return props.projects
    .find((project) => project.teamId === props.expandedTeamId)
    .submissions.find((submission) => submission.submissionId === props.selectedSubmissionId);
}

test('submission selection stays open and preserves drafts and attachments across item and team changes', () => {
  const ctx = createAdvisor();
  assert.equal(ctx.page().selectedSubmissionId, 110);
  ctx.page().onChangeFeedback(110, 'draft before closing');
  ctx.page().onAttachFeedbackFiles(110, [localFile]);
  ctx.page().onSelectSubmission(110);
  assert.equal(ctx.page().selectedSubmissionId, 110, 'selecting the current item must keep the editor open');
  ctx.page().onSelectSubmission(999);
  assert.equal(ctx.page().selectedSubmissionId, 110, 'invalid selections cannot change the active item');
  assert.equal(ctx.page().feedbackDrafts[110], 'draft before closing');
  assert.ok(activeSubmission(ctx.page()).feedbackFiles.some((file) => file.sourceFile === localFile));
  ctx.page().onSelectSubmission(111);
  assert.equal(ctx.page().selectedSubmissionId, 111);
  ctx.page().onSelectSubmission(111);
  assert.equal(ctx.page().selectedSubmissionId, 111, 'selecting another item twice must keep its editor open');
  ctx.page().onSelectSubmission(110);
  assert.equal(ctx.page().feedbackDrafts[110], 'draft before closing');
  assert.ok(activeSubmission(ctx.page()).feedbackFiles.some((file) => file.sourceFile === localFile));
  ctx.page().onToggleProject({ teamId: 11 });
  assert.equal(ctx.page().selectedSubmissionId, null, 'closing the team hides its editor');
  ctx.page().onToggleProject({ teamId: 11 });
  assert.equal(ctx.page().feedbackDrafts[110], 'draft before closing', 'reopening the team keeps the draft');
  ctx.page().onToggleProject({ teamId: 12 });
  assert.equal(ctx.page().selectedSubmissionId, 120, 'opening another team retains its default selection');
  ctx.search = '?teamId=11';
  ctx.contest = '2';
  assert.equal(ctx.page().selectedSubmissionId, 110, 'a new route resets the selection');
});

test('draft text, local files and removals survive submission/team/URL/contest switches independently', () => {
  const ctx = createAdvisor();
  ctx.page().onChangeFeedback(110, 'draft A');
  ctx.page().onAttachFeedbackFiles(110, [localFile]);
  ctx.page().onRemoveFeedbackFile(110, activeSubmission(ctx.page()).feedbackFiles[0]);
  ctx.page().onSelectSubmission(111);
  assert.equal(ctx.page().feedbackDrafts[111], 'server 1/111');
  ctx.page().onChangeFeedback(111, 'draft B');
  ctx.page().onToggleProject({ teamId: 12 });
  assert.equal(ctx.page().feedbackDrafts[120], 'server 1/120');
  ctx.page().onToggleProject({ teamId: 11 });
  assert.equal(ctx.page().feedbackDrafts[110], 'draft A');
  assert.equal(activeSubmission(ctx.page()).feedbackFiles[0].sourceFile, localFile);
  ctx.search = '?teamId=12';
  ctx.page();
  ctx.search = '?teamId=11';
  assert.equal(ctx.page().feedbackDrafts[110], 'draft A');
  ctx.contest = '2';
  assert.equal(ctx.page().feedbackDrafts[110], 'server 2/110');
  ctx.page().onChangeFeedback(110, 'other contest');
  ctx.contest = '1';
  assert.equal(ctx.page().feedbackDrafts[110], 'draft A');
  ctx.page().onSelectSubmission(111);
  assert.equal(ctx.page().feedbackDrafts[111], 'draft B');
  assert.equal(createAdvisor().page().feedbackDrafts[110], 'server 1/110', 'leaving the page discards local edits');
});

test('failed saves preserve edits; delayed success updates only the original target after navigation', async () => {
  const ctx = createAdvisor();
  ctx.page().onChangeFeedback(110, 'draft A');
  ctx.page().onAttachFeedbackFiles(110, [localFile]);
  ctx.page().onRemoveFeedbackFile(110, activeSubmission(ctx.page()).feedbackFiles[0]);
  ctx.save = async () => {
    throw new Error('failed');
  };
  ctx.page().onSaveFeedback(110);
  await ctx.finish();
  assert.equal(ctx.page().feedbackDrafts[110], 'draft A');
  assert.equal(activeSubmission(ctx.page()).feedbackFiles[0].sourceFile, localFile);
  assert.equal(ctx.invalidations.length, 0);
  let finish;
  ctx.save = () =>
    new Promise((resolve) => {
      finish = resolve;
    });
  ctx.page().onSaveFeedback(110);
  await Promise.resolve();
  ctx.contest = '2';
  assert.equal(ctx.page().savingSubmissionId, null);
  ctx.page().onChangeFeedback(110, 'other contest');
  ctx.page().onAttachFeedbackFiles(110, [localFile]);
  finish();
  await ctx.finish();
  assert.equal(ctx.page().feedbackDrafts[110], 'other contest');
  assert.ok(activeSubmission(ctx.page()).feedbackFiles.some((file) => file.sourceFile === localFile));
  assert.deepEqual(ctx.invalidations, [[1, 11, 110]]);
  assert.equal(ctx.saves[1][0], 1);
  assert.equal(ctx.saves[1][1], 110);
  assert.equal(ctx.saves[1][2].removeFileIds[0], 1);
  ctx.contest = '1';
  assert.ok(activeSubmission(ctx.page()).feedbackFiles.every((file) => file.source !== 'local'));
  const count = ctx.saves.length;
  ctx.page().onSaveFeedback(999);
  assert.equal(ctx.saves.length, count);
});

test('concurrent saves keep each target locked until its own response and reject same-tick duplicates', async () => {
  const ctx = createAdvisor();
  let releaseA;
  ctx.save = (_contest, submission) =>
    submission === 110
      ? new Promise((resolve) => {
          releaseA = resolve;
        })
      : Promise.resolve();
  ctx.page().onChangeFeedback(110, 'draft A');
  const pageA = ctx.page();
  pageA.onSaveFeedback(110);
  const taskA = ctx.finish();
  pageA.onSaveFeedback(110);
  await Promise.resolve();
  assert.equal(ctx.saves.length, 1);
  ctx.page().onSelectSubmission(111);
  ctx.page().onChangeFeedback(111, 'draft B');
  ctx.page().onSaveFeedback(111);
  await ctx.finish();
  ctx.page().onSelectSubmission(110);
  assert.equal(ctx.page().savingSubmissionId, 110);
  ctx.page().onChangeFeedback(110, 'blocked edit');
  ctx.page().onSaveFeedback(110);
  assert.equal(ctx.page().feedbackDrafts[110], 'draft A');
  assert.equal(ctx.saves.length, 2);
  releaseA();
  await taskA;
  assert.equal(ctx.page().savingSubmissionId, null);
  assert.deepEqual(ctx.invalidations, [
    [1, 11, 111],
    [1, 11, 110],
  ]);
  ctx.page().onChangeFeedback(110, 'new edit');
  assert.equal(ctx.page().feedbackDrafts[110], 'new edit');
});
