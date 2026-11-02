import Input from '@components/Input';
import PasswordInput from '@components/PasswordInput';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postSignIn } from '@apis/signIn';
import useAuth from '@hooks/useAuth';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isPNUEmail } from '@utils/email';
import { useToast } from '@hooks/useToast';

import Divider from './SocialSignIn/Divider';
import GoogleSignInButton from './SocialSignIn/GoogleSignInButton';
import { getApiErrorMessage } from '@utils/error';
import { Button } from '@components/ui/button';
import AuthField from '../auth/AuthField';
import { authInputClass, authPasswordToggleClass, authPrimaryButtonClass } from '../auth/styles';

const SignInForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const toast = useToast();
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const requestInFlight = useRef(false);

  const signInMutation = useMutation({
    mutationFn: postSignIn,
    onSuccess: (data) => {
      signIn(data.token);
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      navigate('/');
    },
    onError: (error) => {
      toast(getApiErrorMessage(error, '로그인에 실패했어요.'), 'error');
    },
    onSettled: () => {
      requestInFlight.current = false;
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (requestInFlight.current) return;
    if (!isPNUEmail(email)) {
      toast('부산대학교 이메일(@pusan.ac.kr)이 아닙니다.', 'info');
      return;
    }

    if (!password.trim()) {
      toast(`비밀번호가 비어 있습니다.`, 'info');
      return;
    }

    requestInFlight.current = true;
    signInMutation.mutate({ email, password });
  };

  return (
    <div className="flex w-full flex-col gap-5">
      <form className="flex w-full flex-col gap-5" onSubmit={handleSubmit} aria-busy={signInMutation.isPending}>
        <AuthField id="signin-email" label="이메일">
          <Input
            id="signin-email"
            name="email"
            autoComplete="username"
            inputMode="email"
            className={authInputClass}
            placeholder="example@pusan.ac.kr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </AuthField>
        <AuthField id="signin-password" label="비밀번호">
          <PasswordInput
            id="signin-password"
            name="password"
            autoComplete="current-password"
            className={`${authInputClass} pr-12`}
            toggleClassName={authPasswordToggleClass}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </AuthField>
        <Button type="submit" className={`${authPrimaryButtonClass} mt-1 w-full`} disabled={signInMutation.isPending}>
          {signInMutation.isPending ? '로그인 중…' : '로그인'}
        </Button>
      </form>
      <Divider />
      <div className="flex w-full justify-center">
        <GoogleSignInButton />
      </div>
    </div>
  );
};

export default SignInForm;
