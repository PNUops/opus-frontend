const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const ts = require('typescript');

function loadRankingList() {
  const load = (relativePath) => {
    const source = ts.transpileModule(fs.readFileSync(path.join(__dirname, relativePath), 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
    }).outputText;
    const exports = {};
    vm.runInNewContext(source, {
      exports,
      require: (name) => (name === '@utils/classname' ? load('../src/utils/classname.ts') : require(name)),
    });
    return exports;
  };
  return load('../src/pages/admin/statistics/VoteRankingList.tsx').default;
}

test('ranking rows render missing team/project names without losing ranks, votes or track filtering', () => {
  const { createElement } = require('react');
  const { renderToStaticMarkup } = require('react-dom/server');
  const RankingList = loadRankingList();
  for (const [teamName, projectName] of [
    [null, '프로젝트'],
    ['팀', null],
    [null, null],
    ['', '  '],
  ]) {
    const rankings = [{ rank: 2, teamId: 7, teamName, projectName, trackName: null, voteCount: 0 }];
    for (const selectedFilter of ['all', 'grouped', 'track:null']) {
      const html = renderToStaticMarkup(createElement(RankingList, { rankings, selectedFilter }));
      assert.ok(html.includes(teamName?.trim() || '팀명 미등록'));
      assert.ok(html.includes(projectName?.trim() || '프로젝트명 미등록'));
      assert.ok(html.includes('분과 미지정'));
      assert.ok(html.includes('aria-label="2위"'));
      assert.ok(html.includes('0표'));
      assert.ok(!html.includes('전체 이름 보기'));
    }
  }
});

test('long ranking names still offer expansion when another name is missing', () => {
  const { createElement } = require('react');
  const { renderToStaticMarkup } = require('react-dom/server');
  const RankingList = loadRankingList();
  const projectName = '긴 프로젝트 이름 '.repeat(10);
  const html = renderToStaticMarkup(
    createElement(RankingList, {
      selectedFilter: 'all',
      rankings: [{ rank: 1, teamId: 8, teamName: null, projectName, trackName: null, voteCount: 12 }],
    }),
  );
  assert.ok(html.includes(projectName.trim()));
  assert.ok(html.includes('전체 이름 보기'));
  assert.ok(html.includes('aria-expanded="false"'));
});

function loadApi(get, logs = []) {
  const source = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../src/apis/voteReport.ts'), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  }).outputText;
  const exports = {};
  vm.runInNewContext(source, {
    exports,
    Blob,
    Error,
    console: {
      error: (...args) => logs.push(args),
      log: (...args) => logs.push(args),
      warn: (...args) => logs.push(args),
    },
    require: (name) => (name === './apiClient' ? { get } : require(name)),
  });
  return exports;
}

test('report request uses the contest key and forwards cancellation', async () => {
  const signal = new AbortController().signal;
  const data = { rankings: [{ rank: 2, teamId: 2, trackName: null, voteCount: 0 }], isVoteEnded: false };
  const api = loadApi(async (url, config) => {
    assert.equal(url, '/contests/9/votes/report');
    assert.equal(config.signal, signal);
    return { data };
  });
  assert.equal(await api.getVoteReport(9, signal), data);
});

test('PDF request preserves the download filename and returns a PDF Blob', async () => {
  const signal = new AbortController().signal;
  const headers = { 'content-disposition': "attachment; filename*=UTF-8''%ED%88%AC%ED%91%9C.pdf" };
  const api = loadApi(async (url, config) => {
    assert.equal(url, '/contests/7/votes/report/download');
    assert.equal(config.responseType, 'blob');
    assert.equal(config.signal, signal);
    return { data: new Blob(['%PDF-1.4\nfixture']), headers };
  });
  const response = await api.getVoteReportPdf(7, signal);
  assert.equal(response.data.type, 'application/pdf');
  assert.equal(await response.data.text(), '%PDF-1.4\nfixture');
  assert.equal(response.headers, headers);
});

test('successful JSON/HTML/empty responses cannot become preview documents', async () => {
  for (const body of ['<html>error</html>', '{"message":"failed"}', '']) {
    const api = loadApi(async () => ({ data: new Blob([body]), headers: {} }));
    await assert.rejects(api.getVoteReportPdf(1), /PDF 파일을 받지 못했어요/);
  }
});

test('Blob JSON and plain JSON errors are decoded without logging request data', async () => {
  const { AxiosError } = require('axios');
  const logs = [];
  const api = loadApi(undefined, logs);
  for (const body of [
    new Blob(['{"message":"투표가 마감되지 않았어요."}'], { type: 'application/json' }),
    { message: '투표가 마감되지 않았어요.' },
  ]) {
    const error = new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
      data: body,
      status: 400,
    });
    assert.equal(await api.getVoteReportErrorMessage(error, 'fallback'), '투표가 마감되지 않았어요.');
  }
  for (const body of [new Blob(['<html>failure</html>']), { message: 1 }, { message: '  ' }, null]) {
    const error = new AxiosError('Request failed', 'ERR_BAD_RESPONSE', undefined, undefined, {
      data: body,
      status: 500,
    });
    assert.equal(await api.getVoteReportErrorMessage(error, 'fallback'), 'fallback');
  }
  assert.equal(await api.getVoteReportErrorMessage(new Error('PDF 형식 오류'), 'fallback'), 'PDF 형식 오류');
  assert.equal(await api.getVoteReportErrorMessage(null, 'fallback'), 'fallback');
  assert.equal(logs.length, 0);
});

test('download helper handles UTF-8 and malformed names and always releases its URL', () => {
  const source = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../src/utils/download.ts'), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  const exports = {};
  const downloads = [],
    revoked = [];
  let removed = 0,
    failClick = false;
  vm.runInNewContext(source, {
    exports,
    URL: { createObjectURL: () => 'blob:qa', revokeObjectURL: (url) => revoked.push(url) },
    document: {
      body: { appendChild() {} },
      createElement: () => ({
        click() {
          if (failClick) throw Error('click failed');
          downloads.push(this.download);
        },
        remove() {
          removed += 1;
        },
      }),
    },
  });
  for (const header of [
    "attachment; filename*=UTF-8''%ED%88%AC%ED%91%9C.pdf",
    'attachment; filename="report.pdf"; size=20',
    'attachment; filename=report.pdf; size=20',
    "attachment; filename*=UTF-8''%E0%A4%A",
    undefined,
  ]) {
    exports.downloadFromResponse(
      { data: new Blob(['%PDF-1.4']), headers: { 'content-disposition': header } },
      'fallback.pdf',
    );
  }
  assert.deepEqual(downloads, ['투표.pdf', 'report.pdf', 'report.pdf', 'fallback.pdf', 'fallback.pdf']);
  failClick = true;
  assert.throws(() => exports.downloadBlob(new Blob(), 'fallback.pdf'), /click failed/);
  assert.equal(removed, 6);
  assert.deepEqual(revoked, Array(6).fill('blob:qa'));
});
