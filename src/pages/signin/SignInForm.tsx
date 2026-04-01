import Input from '@components/Input';
import PasswordInput from '@components/PasswordInput';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postSignIn } from 'apis/signIn';
import useAuth from 'hooks/useAuth';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isPNUEmail } from 'utils/email';
import { useToast } from 'hooks/useToast';

import Divider from './SocialSignIn/Divider';
import GoogleSignInButton from './SocialSignIn/GoogleSignInButton';

const SignInForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const toast = useToast();
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const signInMutation = useMutation({
    mutationFn: postSignIn,
    onSuccess: (data) => {
      signIn(data.token);
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      navigate('/');
    },
    onError: (error: any) => {
      toast(error.response.data.message || '로그인에 실패했어요.', 'error');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPNUEmail(email)) {
      toast('부산대학교 이메일(@pusan.ac.kr)이 아닙니다.', 'info');
      return;
    }

    if (!password.trim()) {
      toast(`비밀번호가 비어 있습니다.`, 'info');
      return;
    }

    signInMutation.mutate({ email, password });
  };

  return (
    <>
      <div className="flex w-full flex-col gap-4">
        <form className="flex w-full flex-col gap-4" onSubmit={handleSubmit}>
          <Input placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)} />
          <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} />
          <div className="h-2" />
          <button type="submit" className="bg-mainBlue rounded-lg p-3 text-lg font-bold text-white">
            로그인
          </button>
        </form>
        <Divider />
        <div className="flex w-full justify-center">
          <GoogleSignInButton />
        </div>
      </div>
    </>
  );
};

export default SignInForm;
