const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

// Exercise production modules at their request boundary, using the existing node:test approach.
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

const student = {
  name: '테스트 학생',
  studentNumber: '202600001',
  email: 'signup-test@pusan.ac.kr',
  password: 'Test123!',
};

test('the student form sends its member type and entered fields through the API wrapper', async () => {
  const requests = [];
  const api = loadModule('src/apis/signUp.ts', {
    './apiClient': {
      post: async (url, body) => {
        requests.push({ url, body: JSON.parse(JSON.stringify(body)) });
        return { data: null };
      },
    },
  });
  let pendingRequest;
  const jsx = (type, props) => ({ type, props });
  const { default: SignUpForm } = loadModule('src/pages/signup/SignUpForm.tsx', {
    ...Object.fromEntries(
      ['./NameRow', './StudentNumberRow', './PasswordRow', './PasswordConfirmRow', './EmailBlock'].map((name) => [
        name,
        name,
      ]),
    ),
    './useSignUpFormState': {
      useSignUpFormState: () => ({ formState: student, formError: {}, validate: () => true }),
    },
    'react/jsx-runtime': { jsx, jsxs: jsx },
    '@tanstack/react-query': {
      useMutation: ({ mutationFn }) => ({
        mutate: (request) => {
          pendingRequest = mutationFn(request);
        },
      }),
    },
    '@apis/signUp': api,
    'react-router-dom': { useNavigate: () => () => {} },
    '@components/RoundedButton': 'RoundedButton',
    '@hooks/useToast': { useToast: () => () => {} },
    '@utils/error': {},
  });

  let prevented = false;
  SignUpForm().props.onSubmit({
    preventDefault: () => {
      prevented = true;
    },
  });
  await pendingRequest;

  assert.equal(prevented, true);
  assert.deepEqual(requests, [
    {
      url: '/sign-up',
      body: {
        name: student.name,
        studentId: student.studentNumber,
        email: student.email,
        password: student.password,
        memberType: 'STUDENT',
      },
    },
  ]);
});

test('the signup mock rejects missing or unsupported member types and accepts the student payload', async () => {
  const { HttpResponse } = require('msw');
  const { signUpHandlers } = loadModule('src/mocks/handlers/sign-up.ts', {
    msw: {
      HttpResponse,
      http: {
        post: (url, resolver) => ({ url, resolver }),
        patch: (url, resolver) => ({ url, resolver }),
      },
    },
    '../../utils/email': {},
  });
  const handler = signUpHandlers.find(({ url }) => url === '/api/sign-up');
  const validPayload = {
    name: student.name,
    studentId: student.studentNumber,
    email: student.email,
    password: student.password,
    memberType: 'STUDENT',
  };

  for (const memberType of [undefined, null, '', 'student', 'ROLE_학생', 'ADMIN']) {
    const response = await handler.resolver({ request: { json: async () => ({ ...validPayload, memberType }) } });
    assert.equal(response.status, 400);
    assert.match((await response.json()).message, /회원 유형/);
  }
  const response = await handler.resolver({ request: { json: async () => validPayload } });
  assert.equal(response.status, 201);

  const missingField = await handler.resolver({
    request: { json: async () => ({ ...validPayload, studentId: undefined }) },
  });
  assert.equal(missingField.status, 400);
});
