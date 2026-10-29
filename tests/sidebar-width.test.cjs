const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const ts = require('typescript');

const exportsObject = {};
vm.runInNewContext(
  ts.transpileModule(fs.readFileSync(path.join(__dirname, '../src/layout/hooks/useSidebarWidth.ts'), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText,
  { exports: exportsObject, require },
);
const { parseSidebarWidth, sidebarMaxWidth } = exportsObject;

test('saved width rejects corrupt, wrongly typed and out-of-range values', () => {
  for (const value of [null, '', 'null', 'true', '"320"', '{}', '[]', '[320]', 'NaN', 'Infinity', '239', '401', '-1']) {
    assert.equal(parseSidebarWidth(value), 280, String(value));
  }
  for (const value of [240, 280, 320, 400]) assert.equal(parseSidebarWidth(String(value)), value);
  assert.equal(parseSidebarWidth('320.4'), 320);
});

test('desktop width limit leaves at least 960px for the content', () => {
  for (const viewport of [1280, 1300, 1360, 1440, 1920]) {
    const maximum = sidebarMaxWidth(viewport);
    assert.ok(viewport - maximum >= 960);
    assert.ok(maximum >= 240 && maximum <= 400);
  }
  assert.equal(sidebarMaxWidth(1280), 320);
  assert.equal(sidebarMaxWidth(1440), 400);
});
