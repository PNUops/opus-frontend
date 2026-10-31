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

function renderSignUpFormState() {
  const state = [];
  let cursor = 0;
  const { useSignUpFormState } = loadModule('src/pages/signup/useSignUpFormState.ts', {
    react: {
      useState: (initialValue) => {
        const index = cursor++;
        if (!(index in state)) state[index] = initialValue;
        return [state[index], (next) => (state[index] = typeof next === 'function' ? next(state[index]) : next)];
      },
    },
    '@utils/email': loadModule('src/utils/email.ts', {}),
    '@utils/password': loadModule('src/utils/password.ts', {}),
  });
  return () => {
    cursor = 0;
    return useSignUpFormState();
  };
}

test('email errors appear on blur and update while editing without showing untouched field errors', () => {
  const render = renderSignUpFormState();
  assert.deepEqual({ ...render().formError }, {});
  render().validateField('email');
  assert.deepEqual({ ...render().formError }, {});

  render().updateField('email', 'student@example.com');
  assert.deepEqual({ ...render().formError }, {});

  render().validateField('email');
  assert.deepEqual({ ...render().formError }, { email: '부산대학교 이메일(@pusan.ac.kr)이 아닙니다.' });

  render().updateField('email', 'student@pusan.ac.kr');
  assert.deepEqual({ ...render().formError }, {});

  render().updateField('email', 'student@example.com');
  assert.equal(render().formError.email, '부산대학교 이메일(@pusan.ac.kr)이 아닙니다.');
});

test('blurring empty fields without entering anything does not show errors', () => {
  const render = renderSignUpFormState();
  for (const field of ['name', 'studentNumber', 'email', 'password', 'passwordConfirm']) {
    render().validateField(field);
    assert.deepEqual({ ...render().formError }, {});
  }
});

test('clearing entered fields shows the required message on blur and clears after correction', () => {
  for (const [field, value] of [
    ['name', '테스트 학생'],
    ['studentNumber', '202600001'],
    ['email', 'student@pusan.ac.kr'],
    ['password', 'Test123!'],
    ['passwordConfirm', 'Test123!'],
  ]) {
    for (const blank of ['', '   ']) {
      const render = renderSignUpFormState();
      if (field === 'passwordConfirm') render().updateField('password', 'Test123!');
      render().updateField(field, value);
      render().updateField(field, blank);
      assert.deepEqual({ ...render().formError }, {});
      render().validateField(field);
      assert.deepEqual({ ...render().formError }, { [field]: '필수 입력 항목입니다.' });
      render().updateField(field, value);
      assert.deepEqual({ ...render().formError }, {});
    }
  }
});

test('password rules and confirmation stay current after blur, including changes to the original password', () => {
  const render = renderSignUpFormState();
  render().updateField('password', 'short');
  assert.deepEqual({ ...render().formError }, {});
  render().validateField('password');
  assert.equal(render().formError.password, '8~16자, 영어, 숫자, 특수문자(@$!%*#?&~)를 포함하여야 합니다.');

  render().updateField('password', 'Test123!');
  assert.deepEqual({ ...render().formError }, {});
  render().updateField('passwordConfirm', 'different');
  assert.deepEqual({ ...render().formError }, {});
  render().validateField('passwordConfirm');
  assert.equal(render().formError.passwordConfirm, '비밀번호가 일치하지 않습니다.');

  render().updateField('passwordConfirm', 'Test123!');
  assert.deepEqual({ ...render().formError }, {});
  render().updateField('password', 'NewTest123!');
  assert.equal(render().formError.passwordConfirm, '비밀번호가 일치하지 않습니다.');
  render().updateField('passwordConfirm', 'NewTest123!');
  assert.deepEqual({ ...render().formError }, {});
});

test('submission validates untouched fields and requires email verification until it succeeds', () => {
  const render = renderSignUpFormState();
  assert.equal(render().validate(), false);
  assert.deepEqual(
    { ...render().formError },
    {
      name: '필수 입력 항목입니다.',
      studentNumber: '필수 입력 항목입니다.',
      email: '필수 입력 항목입니다.',
      password: '필수 입력 항목입니다.',
      passwordConfirm: '필수 입력 항목입니다.',
    },
  );

  render().updateField('name', '테스트 학생');
  render().updateField('studentNumber', '202600001');
  render().updateField('email', 'student@pusan.ac.kr');
  render().updateField('password', 'Test123!');
  render().updateField('passwordConfirm', 'different');
  assert.deepEqual(
    { ...render().formError },
    {
      email: '이메일 인증이 필요합니다.',
      passwordConfirm: '비밀번호가 일치하지 않습니다.',
    },
  );
  render().updateField('passwordConfirm', 'Test123!');
  assert.equal(render().validate(), false);

  render().updateField('isEmailVerified', true);
  assert.deepEqual({ ...render().formError }, {});
  assert.equal(render().validate(), true);

  render().updateField('isEmailVerified', false);
  assert.equal(render().formError.email, '이메일 인증이 필요합니다.');
  assert.equal(render().validate(), false);
});

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
    react: { useRef: (initialValue) => ({ current: initialValue }) },
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
    '@components/ui/button': { Button: 'Button' },
    '../auth/styles': { authPrimaryButtonClass: '', authSecondaryButtonClass: '' },
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
