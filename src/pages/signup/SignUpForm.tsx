import NameRow from './NameRow';
import StudentNumberRow from './StudentNumberRow';
import PasswordRow from './PasswordRow';
import PasswordConfirmRow from './PasswordConfirmRow';
import EmailBlock from './EmailBlock';
import { useSignUpFormState } from './useSignUpFormState';
import { useMutation } from '@tanstack/react-query';
import { patchEmailVerificationCode, postEmailVerification, postSignUp } from '@apis/signUp';
import { useNavigate } from 'react-router-dom';
import RoundedButton from '@components/RoundedButton';
import { useToast } from '@hooks/useToast';
import { getApiErrorMessage } from '@utils/error';

const SignUpForm = () => {
  const { formState, updateField, formError, validate } = useSignUpFormState();
  const navigate = useNavigate();
  const toast = useToast();

  const mutation = useMutation({
    mutationFn: postSignUp,
    onSuccess: () => {
      toast('회원가입이 완료되었어요.', 'success');
      navigate('/signin'); // TODO: 회원가입 완료 시 자동 로그인
    },
    onError: (error) => {
      toast(getApiErrorMessage(error, '회원가입에 실패했어요. 다시 시도해주세요.'), 'error');
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validate()) {
      mutation.mutate({
        name: formState.name,
        studentId: formState.studentNumber,
        email: formState.email,
        password: formState.password,
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full space-y-6 md:grid md:grid-cols-[max-content_1fr_max-content] md:items-center md:space-y-0 md:gap-x-4 md:gap-y-6"
    >
      <div className="flex flex-col gap-1 md:contents">
        <NameRow value={formState.name} setValue={(val) => updateField('name', val)} error={formError.name} />
      </div>

      <div className="flex flex-col gap-1 md:contents">
        <StudentNumberRow
          value={formState.studentNumber}
          setValue={(val) => updateField('studentNumber', val)}
          error={formError.studentNumber}
        />
      </div>

      <Spacer />

      <div className="flex flex-col gap-1 md:contents">
        <EmailBlock
          email={formState.email}
          setEmail={(val) => updateField('email', val)}
          isEmailVerified={formState.isEmailVerified}
          setIsEmailVerified={(val) => updateField('isEmailVerified', val)}
          error={formError.email}
          emailVerificationMutationFn={postEmailVerification}
          emailVerificationCodeMutationFn={patchEmailVerificationCode}
        />
      </div>

      <Spacer />

      <div className="flex flex-col gap-1 md:contents">
        <PasswordRow
          value={formState.password}
          setValue={(val) => updateField('password', val)}
          error={formError.password}
        />
      </div>

      <div className="flex flex-col gap-1 md:contents">
        <PasswordConfirmRow
          value={formState.passwordConfirm}
          setValue={(val) => updateField('passwordConfirm', val)}
          error={formError.passwordConfirm}
        />
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end sm:gap-4 md:col-span-3">
        <RoundedButton type="button" onClick={() => navigate(-1)} className="w-full px-10 sm:w-auto">
          취소
        </RoundedButton>
        <RoundedButton className="bg-lightGray w-full px-10 sm:w-auto" type="submit">
          가입
        </RoundedButton>
      </div>
    </form>
  );
};

export default SignUpForm;

const Spacer = () => <div className="h-2 md:col-span-3" aria-hidden="true" />;
