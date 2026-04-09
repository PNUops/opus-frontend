import { useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useToast } from '@hooks/useToast';
import useAuth from '@hooks/useAuth';
import { OAUTH_ERROR_MESSAGES, DEFAULT_OAUTH_ERROR_MESSAGE } from '@constants/oauth';

const parseErrorCode = (error: string): string => {
  const decoded = error.trim();
  const match = decoded.match(/^\[(.+)]$/);
  return match ? match[1] : decoded;
};

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const error = searchParams.get('error');

  const toast = useToast();
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const lastProcessedKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const key = `${token ?? ''}|${error ?? ''}`;
    if (lastProcessedKeyRef.current === key) return;
    lastProcessedKeyRef.current = key;

    if (token) {
      signIn(token);
      toast('구글 로그인 성공!', 'success');
      navigate('/', { replace: true });
      return;
    }

    if (error) {
      const errorCode = parseErrorCode(error);
      const message = OAUTH_ERROR_MESSAGES[errorCode] || DEFAULT_OAUTH_ERROR_MESSAGE;
      toast(message, 'error');
    } else {
      toast(DEFAULT_OAUTH_ERROR_MESSAGE, 'error');
    }

    navigate('/signin', { replace: true });
  }, [token, error, signIn, toast, navigate]);

  return <div className="p-10 text-center text-lg font-semibold">로그인 중입니다...</div>;
};

export default OAuthCallback;
