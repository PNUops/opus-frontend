import SignInForm from './SignInForm';
import SignInOptions from './SignInOptions';

const SignInPage = () => {
  return (
    <>
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-10 md:p-10">
        <h1 className="my-8 text-4xl font-bold">로그인</h1>
        <SignInForm />
        <SignInOptions />
      </div>
    </>
  );
};
export default SignInPage;
