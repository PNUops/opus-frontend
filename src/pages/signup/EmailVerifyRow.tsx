import Input from '@components/Input';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { EmailVerificationCodeRequestDTO } from 'types/DTO';
import { formatToMMSS } from 'utils/time';
import { useToast } from 'hooks/useToast';
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
  const mutation = useMutation({
    mutationFn: mutationFn,
    onSuccess: () => {
      toast(`이메일 인증이 완료되었어요`, 'success');
      setIsEmailVerified(true);
      stopCooldown();
    },
    onError: (error) => {
      toast(`이메일 인증에 실패했어요. ${error.message}`, 'error');
    },
  });

  const handleSendCode = () => {
    if (!isMailSent) {
      toast('인증코드를 먼저 전송해주세요.', 'info');
      return;
    }
    mutation.mutate({ email, authCode });
  };

  return (
    <>
      <label />
      <div className="relative">
        <Input
          name="emailverify"
          disabled={isEmailVerified}
          className="disabled:bg-whiteGray disabled:text-midGray"
          placeholder="인증코드 입력"
          value={authCode}
          onChange={(e) => setAuthCode(e.target.value)}
        />
        {cooldown > 0 && (
          <span className="text-mainRed absolute top-1/2 right-3 -translate-y-1/2 text-sm">
            {formatToMMSS(cooldown)}
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={handleSendCode}
        disabled={isEmailVerified}
        className="border-lightGray hover:bg-lightGray rounded-lg border p-3 px-4"
      >
        확인
      </button>
    </>
  );
};
export default EmailVerifyRow;
