import { useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useToast } from 'hooks/useToast';
import useAuth from 'hooks/useAuth';

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  access_denied: '구글 로그인이 취소되었습니다.',
  authorization_request_not_found: '세션이 만료되었습니다. 다시 시도해주세요.',
  invalid_state_parameter: '인증에 실패했습니다. 다시 시도해주세요.',
  server_error: '구글 서버 오류가 발생했습니다.',
  GENERAL_MEMBER_CANNOT_USE_SOCIAL_LOGIN: '일반 회원은 소셜 로그인을 사용할 수 없습니다.',
  SOCIAL_TYPE_MISMATCH: '다른 소셜 계정으로 가입된 이메일입니다.',
};

const DEFAULT_ERROR_MESSAGE = '구글 로그인에 실패했습니다.';

const parseErrorCode = (error: string): string => {
  const decoded = decodeURIComponent(error).trim();
  const match = decoded.match(/^\[(.+)]$/);
  return match ? match[1] : decoded;
};

const GoogleOAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const error = searchParams.get('error');

  const toast = useToast();
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const isProcessed = useRef(false);

  useEffect(() => {
    if (isProcessed.current) return;
    isProcessed.current = true;

    if (token) {
      signIn(token);
      toast('구글 로그인 성공!', 'success');
      navigate('/');
      return;
    }

    if (error) {
      const errorCode = parseErrorCode(error);
      const message = OAUTH_ERROR_MESSAGES[errorCode] || DEFAULT_ERROR_MESSAGE;
      toast(message, 'error');
    } else {
      toast(DEFAULT_ERROR_MESSAGE, 'error');
    }

    navigate('/signin');
  }, []);

  return <div className="p-10 text-center text-lg font-semibold">로그인 중입니다...</div>;
};

export default GoogleOAuthCallback;
