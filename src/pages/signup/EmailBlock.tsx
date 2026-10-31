import { useEffect, useState } from 'react';
import EmailRow from './EmailRow';
import EmailVerifyRow from './EmailVerifyRow';
import { EmailVerificationCodeRequestDTO, EmailVerificationRequestDTO } from '@dto/signUpDto';

interface Props {
  email: string;
  setEmail: (value: string) => void;
  isEmailVerified: boolean;
  setIsEmailVerified: (value: boolean) => void;
  error?: string;
  onBlur?: () => void;
  emailVerificationMutationFn: (request: EmailVerificationRequestDTO) => Promise<any>;
  emailVerificationCodeMutationFn: (request: EmailVerificationCodeRequestDTO) => Promise<any>;
}

const EmailBlock = ({
  email,
  setEmail,
  isEmailVerified,
  setIsEmailVerified,
  error,
  onBlur,
  emailVerificationMutationFn,
  emailVerificationCodeMutationFn,
}: Props) => {
  const EMAIL_VERIFY_COOLDOWN_SEC = 300;
  const [isMailSent, setIsMailSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown > 0]);

  const startCooldown = () => {
    setCooldown(EMAIL_VERIFY_COOLDOWN_SEC);
  };
  const stopCooldown = () => {
    setCooldown(0);
  };

  const handleEmailChange = (nextEmail: string) => {
    setEmail(nextEmail);
    setIsMailSent(false);
    setIsEmailVerified(false);
    stopCooldown();
  };
  return (
    <div className="flex flex-col gap-4">
      <EmailRow
        email={email}
        setEmail={handleEmailChange}
        isEmailVerified={isEmailVerified}
        setIsMailSent={setIsMailSent}
        startCooldown={startCooldown}
        error={isEmailVerified ? undefined : error}
        onBlur={onBlur}
        mutationFn={emailVerificationMutationFn}
      />
      <EmailVerifyRow
        email={email}
        isEmailVerified={isEmailVerified}
        setIsEmailVerified={setIsEmailVerified}
        isMailSent={isMailSent}
        cooldown={cooldown}
        stopCooldown={stopCooldown}
        mutationFn={emailVerificationCodeMutationFn}
      />
    </div>
  );
};
export default EmailBlock;
