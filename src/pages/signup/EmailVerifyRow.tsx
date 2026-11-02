import Input from '@components/Input';
import { useMutation } from '@tanstack/react-query';
import { useLayoutEffect, useRef, useState } from 'react';
import { EmailVerificationCodeRequestDTO } from '@dto/signUpDto';
import { formatToMMSS } from '@utils/time';
import { useToast } from '@hooks/useToast';
import { Button } from '@components/ui/button';
import AuthField from '../auth/AuthField';
import { authInputClass, authSecondaryButtonClass } from '../auth/styles';
import { getApiErrorMessage } from '@utils/error';
interface Props {
  email: string;
  isEmailVerified: boolean;
  setIsEmailVerified: (value: boolean) => void;
  isMailSent: boolean;
  cooldown: number;
  stopCooldown: () => void;
  mutationFn: (request: EmailVerificationCodeRequestDTO) => Promise<any>;
}

const EmailVerifyRow = ({
  email,
  isEmailVerified,
  setIsEmailVerified,
  isMailSent,
  cooldown,
  stopCooldown,
  mutationFn,
}: Props) => {
  const [authCode, setAuthCode] = useState('');
  const toast = useToast();
  const requestInFlight = useRef(false);
  const latestEmail = useRef(email);

  useLayoutEffect(() => {
    latestEmail.current = email;
    setAuthCode('');
  }, [email]);

  const mutation = useMutation({
    mutationFn: mutationFn,
    onSuccess: (_data, variables) => {
      if (variables.email !== latestEmail.current) return;
      toast(`이메일 인증이 완료되었어요`, 'success');
      setIsEmailVerified(true);
      stopCooldown();
    },
    onError: (error, variables) => {
      if (variables.email !== latestEmail.current) return;
      toast(getApiErrorMessage(error, '이메일 인증에 실패했어요. 다시 시도해주세요.'), 'error');
    },
    onSettled: () => {
      requestInFlight.current = false;
    },
  });

  const handleSendCode = () => {
    if (requestInFlight.current || isEmailVerified) return;
    if (!isMailSent) {
      toast('인증코드를 먼저 전송해주세요.', 'info');
      return;
    }
    requestInFlight.current = true;
    mutation.mutate({ email, authCode });
  };

  return (
    <AuthField id="signup-email-code" label="인증코드">
      <div className="flex gap-2">
        <div className="relative min-w-0 flex-1">
          <Input
            id="signup-email-code"
            name="emailverify"
            autoComplete="one-time-code"
            disabled={isEmailVerified}
            className={`${authInputClass} disabled:bg-whiteGray disabled:text-midGray pr-16`}
            placeholder="인증코드 입력"
            value={authCode}
            onChange={(e) => setAuthCode(e.target.value)}
          />
          {cooldown > 0 && (
            <span className="text-destructive absolute top-1/2 right-3 -translate-y-1/2 text-sm">
              {formatToMMSS(cooldown)}
            </span>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleSendCode}
          disabled={mutation.isPending || isEmailVerified}
          className={`${authSecondaryButtonClass} shrink-0 sm:min-w-32`}
        >
          {mutation.isPending ? '확인 중…' : isEmailVerified ? '인증 완료' : '확인'}
        </Button>
      </div>
    </AuthField>
  );
};
export default EmailVerifyRow;
