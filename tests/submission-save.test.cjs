const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

// Run the production TypeScript with API/hook boundaries replaced, without adding a test framework.
function loadModule(relativePath, mocks) {
  const filename = path.resolve(__dirname, '..', relativePath);
  const source = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  const exports = {};
  vm.runInNewContext(source, {
    exports,
    require: (name) => (Object.hasOwn(mocks, name) ? mocks[name] : require(name)),
  });
  return exports;
}

function createServer(existingCount, maxFileCount, failAt = Infinity) {
  let submissionId = 10;
  let nextFileId = 100;
  let files = Array.from({ length: existingCount }, (_, index) => index + 1);
  const calls = [];
  const record = (operation) => {
    calls.push(operation);
    if (calls.length === failAt) throw new Error('request failed');
  };
  const api = {
    async deleteSubmissionFile(_contestId, id, fileId) {
      record('delete');
      assert.equal(id, submissionId);
      assert.ok(files.includes(fileId));
      files = files.filter((value) => value !== fileId);
      if (files.length === 0) submissionId = null;
    },
    async postSubmissionFiles(_contestId, id, addedFiles) {
      record('add');
      assert.equal(id, submissionId);
      assert.notEqual(submissionId, null, 'cannot add to a deleted submission');
      assert.ok(files.length + addedFiles.length <= maxFileCount, 'server count limit');
      files.push(...addedFiles.map(() => nextFileId++));
    },
    async postSubmission(_contestId, _itemId, _teamId, addedFiles) {
      record('create');
      assert.equal(files.length, 0);
      assert.ok(addedFiles.length > 0 && addedFiles.length <= maxFileCount);
      submissionId = 20;
      files = addedFiles.map(() => nextFileId++);
      return { submissionId };
    },
  };
  const { saveSubmissionChanges } = loadModule('src/pages/me/activity/utils/saveSubmissionChanges.ts', {
    '@apis/submission': api,
  });
  return {
    calls,
    get files() {
      return files;
    },
    save: (deletedFileIds, newCount, initial = false) =>
      saveSubmissionChanges({
        contestId: 1,
        teamId: 2,
        submissionItemId: 3,
        submissionId: initial ? null : 10,
        existingFileCount: existingCount,
        maxFileCount,
        deletedFileIds,
        newFiles: Array.from({ length: newCount }, (_, index) => ({ name: `new-${index}.pdf` })),
      }),
  };
}

test('initial submission and addition-only save', async () => {
  const initial = createServer(0, 2);
  assert.equal(await initial.save([], 2, true), 20);
  assert.deepEqual(initial.calls, ['create']);
  const addition = createServer(1, 2);
  assert.equal(await addition.save([], 1), 10);
  assert.deepEqual(addition.calls, ['add']);
});

test('deletion-only save, including the last file', async () => {
  const server = createServer(2, 2);
  assert.equal(await server.save([1], 0), 10);
  assert.deepEqual(server.files, [2]);
  const last = createServer(1, 1);
  assert.equal(await last.save([1], 0), null);
  assert.deepEqual(last.files, []);
});

test('replacement uploads before deleting when there is space', async () => {
  const server = createServer(1, 2);
  assert.equal(await server.save([1], 1), 10);
  assert.deepEqual(server.calls, ['add', 'delete']);
});

test('replacement at the count limit frees only the necessary space', async () => {
  const server = createServer(3, 3);
  assert.equal(await server.save([1, 2], 2), 10);
  assert.deepEqual(server.calls, ['delete', 'delete', 'add']);
  assert.ok(server.files.includes(3));
});

test('full replacement at the count limit retains the submission ID', async () => {
  const server = createServer(3, 3);
  assert.equal(await server.save([1, 2, 3], 3), 10);
  assert.deepEqual(server.calls, ['delete', 'delete', 'add', 'delete', 'add']);
  assert.equal(server.files.length, 3);
});

test('one-file limit recreates the submission after soft deletion', async () => {
  const server = createServer(1, 1);
  assert.equal(await server.save([1], 1), 20);
  assert.deepEqual(server.calls, ['delete', 'create']);
});

test('upload failure preserves the old file and stops later deletes', async () => {
  const server = createServer(1, 2, 1);
  await assert.rejects(server.save([1], 1), /request failed/);
  assert.deepEqual(server.calls, ['add']);
  assert.deepEqual(server.files, [1]);
});

test('partial deletion failure stops the remaining requests', async () => {
  const server = createServer(3, 3, 2);
  await assert.rejects(server.save([1, 2], 2), /request failed/);
  assert.deepEqual(server.calls, ['delete', 'delete']);
  assert.deepEqual(server.files, [2, 3]);
});

function createModal(overrides = {}, save = async () => 10) {
  const slots = [];
  const notices = [];
  const invalidations = [];
  let cursor = 0;
  let closed = 0;
  let pending = false;
  let task;
  let saves = 0;
  const props = {
    contestId: 1,
    teamId: 2,
    submissionItemId: 3,
    submissionId: 10,
    submissionItemName: '보고서',
    description: '',
    existingFiles: [{ fileId: 1, fileName: 'old.pdf', fileSize: 1024 }],
    setting: {
      startAt: '2000-01-01T00:00:00',
      endAt: '2100-01-01T00:00:00',
      maxFileCount: 1,
      maxFileSizeMb: 1,
      allowedFileFormats: ['PDF'],
      visibility: 'TEAM',
      allowLateSubmission: false,
    },
    onClose: () => closed++,
    ...overrides,
  };
  const jsx = (type, props) => ({ type, props });
  const { SubmissionUploadModal } = loadModule('src/pages/me/activity/components/SubmissionUploadModal.tsx', {
    react: {
      useRef(value) {
        const index = cursor++;
        slots[index] ??= { current: value };
        return slots[index];
      },
      useState(value) {
        const index = cursor++;
        slots[index] ??= value;
        return [slots[index], (next) => (slots[index] = typeof next === 'function' ? next(slots[index]) : next)];
      },
    },
    'react/jsx-runtime': { jsx, jsxs: jsx },
    '@tanstack/react-query': {
      useQueryClient: () => ({ invalidateQueries: async ({ queryKey }) => invalidations.push(queryKey) }),
      useMutation(options) {
        return {
          isPending: pending,
          mutate() {
            pending = true;
            let result;
            let error;
            task = Promise.resolve()
              .then(options.mutationFn)
              .then(
                (value) => {
                  result = value;
                  return options.onSuccess(value);
                },
                (reason) => {
                  error = reason;
                  return options.onError(reason);
                },
              )
              .finally(async () => {
                await options.onSettled(result, error);
                pending = false;
              });
          },
        };
      },
    },
    'lucide-react': {},
    '@components/admin': { AdminActionButton: 'AdminActionButton' },
    '@components/ui/dialog': { DialogContent: 'DialogContent', DialogClose: 'DialogClose', DialogTitle: 'DialogTitle' },
    '@hooks/useToast': { useToast: () => (message) => notices.push(message) },
    '@queries/submission': {
      submissionKeys: Object.fromEntries(
        ['myList', 'mySummary', 'myTimeline', 'statuses', 'downloads', 'detail'].map((key) => [
          key,
          (...ids) => [key, ...ids],
        ]),
      ),
    },
    '@utils/error': { getApiErrorMessage: (error) => error.message },
    '@constants/submission': {
      getFileFormatExtensions: (formats) => formats.map((format) => `.${format.toLowerCase()}`),
      VISIBILITY_LABEL: { TEAM: '팀' },
    },
    '../utils/saveSubmissionChanges': {
      saveSubmissionChanges: async (changes) => {
        saves++;
        return save(changes);
      },
    },
  });
  const render = () => {
    cursor = 0;
    const tree = SubmissionUploadModal(props);
    const nodes = [];
    const visit = (node) => {
      if (Array.isArray(node)) return node.forEach(visit);
      if (!node || typeof node !== 'object') return;
      nodes.push(node);
      visit(node.props?.children);
    };
    visit(tree);
    return {
      tree,
      nodes,
      remove: () => nodes.find((node) => node.type?.name === 'FileRow').props.onRemove(),
      add: (files) => nodes.find((node) => node.type === 'input').props.onChange({ target: { files, value: '' } }),
      save: () =>
        nodes.find((node) => node.type === 'AdminActionButton' && node.props.children !== '취소').props.onClick(),
      cancel: () =>
        nodes.find((node) => node.type === 'AdminActionButton' && node.props.children === '취소').props.onClick(),
    };
  };
  return {
    render,
    notices,
    invalidations,
    get closed() {
      return closed;
    },
    get saves() {
      return saves;
    },
    finish: () => task,
  };
}

test('deleting and adding are local drafts; cancel does not save', () => {
  const modal = createModal();
  modal.render().remove();
  modal.render().add([{ name: 'new.pdf', size: 1024 }]);
  modal.render().cancel();
  assert.equal(modal.saves, 0);
  assert.equal(modal.closed, 1);
  assert.equal(modal.invalidations.length, 0);
});

test('deletion-only saves once, blocks dismissal while pending, and refreshes caches', async () => {
  const modal = createModal();
  modal.render().remove();
  const draft = modal.render();
  assert.ok(draft.nodes.some((node) => node.props?.role === 'alert'));
  draft.save();
  draft.save();
  const saving = modal.render();
  assert.equal(saving.tree.props.closeDisabled, true);
  for (const eventName of ['onEscapeKeyDown', 'onInteractOutside']) {
    let prevented = false;
    saving.tree.props[eventName]({ preventDefault: () => (prevented = true) });
    assert.equal(prevented, true);
  }
  assert.ok(saving.nodes.filter((node) => node.type === 'AdminActionButton').every((node) => node.props.disabled));
  await modal.finish();
  assert.equal(modal.saves, 1);
  assert.equal(modal.closed, 1);
  assert.equal(modal.invalidations.length, 6);
});

test('failed save warns about partial changes, refreshes caches, and closes the stale draft', async () => {
  const modal = createModal({}, async () => {
    throw new Error('network failed');
  });
  modal.render().remove();
  modal.render().save();
  await modal.finish();
  assert.ok(modal.notices.some((message) => message.includes('일부 변경이 반영되었을 수')));
  assert.equal(modal.invalidations.length, 6);
  assert.equal(modal.closed, 1);
});

test('file format, size and final count restrictions still apply after staging deletions', () => {
  const modal = createModal();
  modal.render().add([{ name: 'extra.pdf', size: 1024 }]);
  assert.ok(modal.notices.some((message) => message.includes('최대 1개')));
  modal.render().remove();
  modal.render().add([
    { name: 'wrong.exe', size: 1024 },
    { name: 'large.pdf', size: 2 * 1024 * 1024 },
    { name: 'valid.PDF', size: 1024 * 1024 },
  ]);
  const rows = modal.render().nodes.filter((node) => node.type?.name === 'FileRow');
  assert.equal(rows.length, 1);
  assert.equal(rows[0].props.name, 'valid.PDF');
  assert.ok(modal.notices.some((message) => message.includes('허용되지 않는')));
  assert.ok(modal.notices.some((message) => message.includes('최대 크기')));
});

test('deadline and start time are checked again when saving; late submissions remain allowed', async () => {
  for (const [startAt, endAt, allowLateSubmission, expectedSaves] of [
    ['2100-01-01', '2101-01-01', false, 0],
    ['2000-01-01', '2001-01-01', false, 0],
    ['2000-01-01', '2001-01-01', true, 1],
  ]) {
    // Settings are props, so simulate the deadline policy without changing the system clock.
    const configured = createModal({
      setting: {
        startAt,
        endAt,
        allowLateSubmission,
        maxFileCount: 1,
        maxFileSizeMb: 1,
        allowedFileFormats: ['PDF'],
        visibility: 'TEAM',
      },
    });
    configured.render().remove();
    configured.render().save();
    await configured.finish();
    assert.equal(configured.saves, expectedSaves);
  }
});
