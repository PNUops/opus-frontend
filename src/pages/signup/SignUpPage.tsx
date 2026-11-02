import SignUpForm from './SignUpForm';

const SignUpPage = () => {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl leading-tight font-semibold tracking-tight">회원가입</h1>
        <p className="text-sm leading-relaxed break-keep text-neutral-600">
          회원가입 후 프로젝트와 성과를 한눈에 관리하세요.
        </p>
      </div>
      <SignUpForm />
    </div>
  );
};

export default SignUpPage;
