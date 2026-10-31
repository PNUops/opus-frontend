import Input from '@components/Input';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { EmailVerificationRequestDTO } from '@dto/signUpDto';
import { isPNUEmail } from '@utils/email';
import { useToast } from '@hooks/useToast';
import Spinner from '@components/Spinner';
import { Button } from '@components/ui/button';
import AuthField from '../auth/AuthField';
import { authInputClass, authSecondaryButtonClass } from '../auth/styles';
import { getApiErrorMessage } from '@utils/error';

interface Props {
  email: string;
  setEmail: (value: string) => void;
  isEmailVerified: boolean;
  setIsMailSent: (value: boolean) => void;
  startCooldown: () => void;
  error?: string;
  onBlur?: () => void;
  mutationFn: (request: EmailVerificationRequestDTO) => Promise<any>;
}

const EmailRow = ({
  email,
  setEmail,
  isEmailVerified,
  setIsMailSent,
  startCooldown,
  error,
  onBlur,
  mutationFn,
}: Props) => {
  const [isFirstSend, setIsFirstSend] = useState(true);
  const [isSendable, setIsSendable] = useState(true);
  const COOLDOWN_SEC = 30;
  const toast = useToast();
  const requestInFlight = useRef(false);
  const latestEmail = useRef(email);
  const resendTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearResendTimer = () => {
    if (resendTimer.current !== null) {
      clearTimeout(resendTimer.current);
      resendTimer.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (resendTimer.current !== null) clearTimeout(resendTimer.current);
    };
  }, []);

  useLayoutEffect(() => {
    latestEmail.current = email;
    setIsFirstSend(true);
  }, [email]);

  const mutation = useMutation({
    mutationFn: mutationFn,
    onSuccess: (_data, variables) => {
      if (variables.email !== latestEmail.current) return;
      toast(`${variables.email}로 인증 메일을 전송했어요`, 'success');
      setIsMailSent(true);
      startCooldown();
    },
    onError: (error, variables) => {
      clearResendTimer();
      setIsSendable(true);
      if (variables.email !== latestEmail.current) return;
      toast(getApiErrorMessage(error, '인증 메일 전송에 실패했어요. 다시 시도해주세요.'), 'error');
    },
    onSettled: () => {
      requestInFlight.current = false;
    },
  });

  const handleSendCode = () => {
    if (requestInFlight.current || isEmailVerified) return;
    if (!isPNUEmail(email)) {
      toast('부산대학교 이메일(@pusan.ac.kr)이 아닙니다.', 'info');
      return;
    }
    if (!isSendable) {
      toast(`인증 메일은 ${COOLDOWN_SEC}초에 한 번만 보낼 수 있어요`, 'info');
      return;
    }
    setIsFirstSend(false);
    setIsSendable(false);
    clearResendTimer();
    resendTimer.current = setTimeout(() => {
      resendTimer.current = null;
      setIsSendable(true);
    }, COOLDOWN_SEC * 1000);
    requestInFlight.current = true;
    mutation.mutate({ email });
  };

  return (
    <AuthField id="signup-email" label="이메일" error={error}>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          id="signup-email"
          name="email"
          autoComplete="email"
          inputMode="email"
          aria-required="true"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'signup-email-error' : undefined}
          disabled={isEmailVerified}
          className={`${authInputClass} disabled:bg-whiteGray disabled:text-midGray min-w-0`}
          placeholder="example@pusan.ac.kr"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={onBlur}
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleSendCode}
          disabled={mutation.isPending || isEmailVerified}
          className={`${authSecondaryButtonClass} shrink-0 sm:min-w-32`}
        >
          {mutation.isPending ? (
            <>
              <span className="flex size-4 shrink-0 items-center" aria-hidden="true">
                <Spinner className="h-4 w-4" />
              </span>
              <span>전송 중…</span>
            </>
          ) : isEmailVerified ? (
            '인증 완료'
          ) : isFirstSend ? (
            '인증코드 전송'
          ) : (
            '재전송'
          )}
        </Button>
      </div>
    </AuthField>
  );
};
export default EmailRow;
