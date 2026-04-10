import googleIconUrl from '@assets/google-icon.svg';
import { API_BASE_URL } from '@constants/env';
import { useToast } from '@hooks/useToast';
import { postSetOAuthRedirect } from '@apis/oauth';

const GoogleSignInButton = () => {
  const GOOGLE_AUTH_URL = `${API_BASE_URL}/api/oauth2/authorization/google`;

  const toast = useToast();

  const handleGoogleSignIn = async () => {
    try {
      if (import.meta.env.DEV) {
        await postSetOAuthRedirect('local');
      }
      window.location.href = GOOGLE_AUTH_URL;
    } catch {
      toast('구글 로그인 도중 오류가 발생했어요.', 'error');
    }
  };

  return (
    <button
      onClick={handleGoogleSignIn}
      className="hover:bg-whiteGray border-lightGray flex h-[51px] items-center gap-3 rounded-full border bg-white px-4 hover:cursor-pointer"
    >
      <img src={googleIconUrl} alt="Google Icon" className="h-[23px] w-[23px]" />
      <span className="font-['Roboto'] text-lg font-medium text-[#1F1F1F]">Google 계정으로 로그인</span>
    </button>
  );
};

export default GoogleSignInButton;
