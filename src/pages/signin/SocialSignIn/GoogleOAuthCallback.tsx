import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useToast } from 'hooks/useToast';
import useAuth from 'hooks/useAuth';
import { useMutation } from '@tanstack/react-query';
import { getGoogleOAuthCallback } from 'apis/oauth';

const GoogleOAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  const toast = useToast();
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const googleSignInMutation = useMutation({
    mutationFn: ({ code, state }: { code: string; state: string }) => getGoogleOAuthCallback(code, state),
    onSuccess: (data) => {
      signIn(data.token);
      toast('구글 로그인 성공!', 'success');
      navigate('/');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || '구글 로그인에 실패했습니다.';
      toast(errorMessage, 'error');
      navigate('/signin');
    },
  });

  useEffect(() => {
    if (code && state) {
      googleSignInMutation.mutate({ code, state });
    }
  }, [code, state]);

  return <div className="p-10 text-center text-lg font-semibold">로그인 중입니다...</div>;
};

export default GoogleOAuthCallback;
