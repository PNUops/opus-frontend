import NameRow from './NameRow';
import StudentNumberRow from './StudentNumberRow';
import PasswordRow from './PasswordRow';
import PasswordConfirmRow from './PasswordConfirmRow';
import EmailBlock from './EmailBlock';
import { useSignUpFormState } from './useSignUpFormState';
import { useMutation } from '@tanstack/react-query';
import { patchEmailVerificationCode, postEmailVerification, postSignUp } from '@apis/signUp';
import { useNavigate } from 'react-router-dom';
import { Button } from '@components/ui/button';
import { useToast } from '@hooks/useToast';
import { getApiErrorMessage } from '@utils/error';
import { authPrimaryButtonClass, authSecondaryButtonClass } from '../auth/styles';
import { useRef } from 'react';

const SignUpForm = () => {
  const { formState, updateField, formError, validateField, validate } = useSignUpFormState();
  const navigate = useNavigate();
  const toast = useToast();
  const requestInFlight = useRef(false);

  const mutation = useMutation({
    mutationFn: postSignUp,
    onSuccess: () => {
      toast('회원가입이 완료되었어요.', 'success');
      navigate('/signin'); // TODO: 회원가입 완료 시 자동 로그인
    },
    onError: (error) => {
      toast(getApiErrorMessage(error, '회원가입에 실패했어요. 다시 시도해주세요.'), 'error');
    },
    onSettled: () => {
      requestInFlight.current = false;
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (requestInFlight.current) return;
    if (validate()) {
      requestInFlight.current = true;
      mutation.mutate({
        name: formState.name,
        studentId: formState.studentNumber,
        email: formState.email,
        password: formState.password,
        memberType: 'STUDENT', // TODO: 회원가입 시 선택 가능하도록 변경
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-5" aria-busy={mutation.isPending}>
      <div className="grid gap-5 sm:grid-cols-2">
        <NameRow
          value={formState.name}
          setValue={(val) => updateField('name', val)}
          error={formError.name}
          onBlur={() => validateField('name')}
        />
        <StudentNumberRow
          value={formState.studentNumber}
          setValue={(val) => updateField('studentNumber', val)}
          error={formError.studentNumber}
          onBlur={() => validateField('studentNumber')}
        />
      </div>

      <div className="border-lightGray border-y py-5">
        <EmailBlock
          email={formState.email}
          setEmail={(val) => updateField('email', val)}
          isEmailVerified={formState.isEmailVerified}
          setIsEmailVerified={(val) => updateField('isEmailVerified', val)}
          error={formError.email}
          onBlur={() => validateField('email')}
          emailVerificationMutationFn={postEmailVerification}
          emailVerificationCodeMutationFn={patchEmailVerificationCode}
        />
      </div>

      <PasswordRow
        value={formState.password}
        setValue={(val) => updateField('password', val)}
        error={formError.password}
        onBlur={() => validateField('password')}
      />
      <PasswordConfirmRow
        value={formState.passwordConfirm}
        setValue={(val) => updateField('passwordConfirm', val)}
        error={formError.passwordConfirm}
        onBlur={() => validateField('passwordConfirm')}
      />
      <div className="mt-1 grid grid-cols-[1fr_2fr] gap-3">
        <Button type="button" variant="outline" onClick={() => navigate(-1)} className={authSecondaryButtonClass}>
          취소
        </Button>
        <Button className={authPrimaryButtonClass} type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? '가입 중…' : '회원가입'}
        </Button>
      </div>
    </form>
  );
};

export default SignUpForm;
