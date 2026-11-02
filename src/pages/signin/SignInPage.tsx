import SignInForm from './SignInForm';
import SignInOptions from './SignInOptions';

const SignInPage = () => {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-8">
      <h1 className="text-center text-3xl leading-tight font-semibold tracking-tight">로그인</h1>
      <SignInForm />
      <SignInOptions />
    </div>
  );
};
export default SignInPage;
