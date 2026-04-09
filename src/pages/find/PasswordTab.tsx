import RoundedButton from '@components/RoundedButton';
import EmailBlock from '@pages/signup/EmailBlock';
import { useFindPasswordFormState } from './useFindPasswordFormState';
import {
  patchEmailVerificationCodePasswordReset,
  patchPasswordReset,
  postEmailVerificationPasswordReset,
} from '@apis/signIn';
import { useMutation } from '@tanstack/react-query';
import PasswordRow from '@pages/signup/PasswordRow';
import PasswordConfirmRow from '@pages/signup/PasswordConfirmRow';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@hooks/useToast';

const PasswordTab = () => {
  const { formState, updateField, formError, validate } = useFindPasswordFormState();
  const toast = useToast();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: patchPasswordReset,
    onSuccess: (data) => {
      toast(`비밀번호 변경이 완료되었어요.`, 'success');
      navigate('/signin');
    },
    onError: (error) => {
      toast(`비밀번호 변경에 실패했어요. ${error.message}`, 'error');
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validate()) {
      mutation.mutate({
        email: formState.email,
        newPassword: formState.password,
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full items-center gap-x-4 gap-y-6 md:grid md:grid-cols-[max-content_1fr_max-content]"
    >
      <div className="flex flex-col gap-1 md:contents">
        <EmailBlock
          email={formState.email}
          setEmail={(val) => updateField('email', val)}
          isEmailVerified={formState.isEmailVerified}
          setIsEmailVerified={(val) => updateField('isEmailVerified', val)}
          error={formError.email}
          emailVerificationMutationFn={postEmailVerificationPasswordReset}
          emailVerificationCodeMutationFn={patchEmailVerificationCodePasswordReset}
        />
      </div>

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

      <div className="col-span-3 mt-8 flex justify-center gap-4">
        <RoundedButton type="submit" className="min-w-32">
          비밀번호 변경
        </RoundedButton>
      </div>
    </form>
  );
};
export default PasswordTab;
