const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');
const { AxiosError, AxiosHeaders } = require('axios');

function loadErrorHandler(logs) {
  const source = ts.transpileModule(readFileSync(path.join(__dirname, '../src/utils/error.ts'), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  }).outputText;
  const exports = {};
  vm.runInNewContext(source, {
    exports,
    require,
    Error,
    console: Object.fromEntries(
      ['error', 'warn', 'log', 'info', 'debug'].map((level) => [level, (...args) => logs.push(args)]),
    ),
  });
  return exports.getApiErrorMessage;
}

function createRequestError(data) {
  const config = {
    headers: new AxiosHeaders({ Authorization: 'Bearer synthetic-token' }),
    data: JSON.stringify({ password: 'synthetic-password', newPassword: 'synthetic-new-password' }),
  };
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', config, undefined, {
    data,
    status: 400,
    statusText: 'Bad Request',
    headers: {},
    config,
  });
}

test('API failures preserve the user message without logging request credentials', () => {
  const logs = [];
  const getApiErrorMessage = loadErrorHandler(logs);

  assert.equal(
    getApiErrorMessage(createRequestError({ message: '요청을 확인해주세요.' }), '실패'),
    '요청을 확인해주세요.',
  );
  assert.equal(getApiErrorMessage(new AxiosError('Network Error'), '연결 실패'), '연결 실패');
  assert.deepEqual(logs, []);
});

test('malformed or empty response messages return the caller fallback', () => {
  const getApiErrorMessage = loadErrorHandler([]);
  for (const message of [undefined, null, '', '   ', 401, false, {}, ['오류']]) {
    assert.equal(getApiErrorMessage(createRequestError({ message }), '기본 안내'), '기본 안내');
  }
  for (const body of [undefined, null, '<html>error</html>']) {
    assert.equal(getApiErrorMessage(createRequestError(body), '기본 안내'), '기본 안내');
  }
});

test('ordinary errors and unknown failures retain their existing fallback behavior', () => {
  const getApiErrorMessage = loadErrorHandler([]);
  assert.equal(getApiErrorMessage(new Error('일반 오류'), '기본 안내'), '일반 오류');
  for (const failure of [new Error(''), undefined, null, 'unknown', {}]) {
    assert.equal(getApiErrorMessage(failure, '기본 안내'), '기본 안내');
  }
});
