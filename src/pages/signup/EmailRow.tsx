import Input from '@components/Input';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { EmailVerificationRequestDTO } from 'types/DTO';
import { isPNUEmail } from 'utils/email';
import { useToast } from 'hooks/useToast';
import Spinner from '@components/Spinner';

interface Props {
  email: string;
  setEmail: (value: string) => void;
  isEmailVerified: boolean;
  setIsMailSent: (value: boolean) => void;
  startCooldown: () => void;
  error?: string;
  mutationFn: (request: EmailVerificationRequestDTO) => Promise<any>;
}

const EmailRow = ({ email, setEmail, isEmailVerified, setIsMailSent, startCooldown, error, mutationFn }: Props) => {
  const [isFirstSend, setIsFirstSend] = useState(true);
  const [isSendable, setIsSendable] = useState(true);
  const COOLDOWN_SEC = 30;
  const toast = useToast();

  const mutation = useMutation({
    mutationFn: mutationFn,
    onSuccess: () => {
      toast(`${email}로 인증 메일을 전송했어요`, 'success');
      setIsMailSent(true);
      startCooldown();
    },
    onError: (error: any) => {
      toast(`인증 메일 전송에 실패했어요: ${error?.response.data.message}`, 'error');
      setIsSendable(true);
    },
  });

  const handleSendCode = () => {
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
    setTimeout(() => {
      setIsSendable(true);
    }, COOLDOWN_SEC * 1000);
    mutation.mutate({ email });
  };

  return (
    <>
      <label className="flex items-center gap-1">
        <span className="text-mainRed">*</span>
        <span className="text-midGray">이메일</span>
      </label>
      <div>
        <Input
          name="email"
          disabled={isEmailVerified}
          className="disabled:bg-whiteGray disabled:text-midGray"
          placeholder="example@pusan.ac.kr"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <p className="text-mainRed mt-1">{error}</p>
      </div>
      <button
        type="button"
        onClick={handleSendCode}
        disabled={mutation.isPending || isEmailVerified}
        className="border-lightGray hover:bg-lightGray min-w-32 rounded-lg border p-3 px-4"
      >
        {mutation.isPending ? (
          <Spinner className="inline-block h-5 w-5 align-middle" />
        ) : isFirstSend ? (
          '인증코드 전송'
        ) : (
          '재전송'
        )}
      </button>
    </>
  );
};
export default EmailRow;
