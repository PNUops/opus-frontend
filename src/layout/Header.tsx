import logo from 'assets/logo.svg';
import useAuth from 'hooks/useAuth';
import { BiCog } from 'react-icons/bi';
import { useNavigate, useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useToast } from 'hooks/useToast';
import HeaderMenu from './HeaderMenu';

const Header = () => {
  const navigate = useNavigate();
  const { isSignedIn, signOut, user, isAdmin } = useAuth();
  const toast = useToast();

  const handleLogout = () => {
    toast('로그아웃 되었습니다.', 'success');
    signOut();
    navigate('/');
  };

  return (
    <header className="border-lightGray lg:h-header md:h-header xs:h-8 z-20 flex w-full min-w-[350px] items-center justify-between border-b bg-white px-4 py-2 sm:h-20">
      <div className="mx-auto flex w-full items-center justify-between gap-4 px-4 sm:px-8 sm:pt-4 md:gap-8 lg:gap-16 lg:px-16">
        <Link to="/" className="sm:-translate-y-1.5 md:-translate-y-[7px] lg:-translate-y-2">
          <img
            className="w-auto max-sm:hidden sm:h-8 md:h-9 lg:h-10"
            src="/Logo.svg"
            alt="부산대학교 SW프로젝트관리시스템 로고"
          />
          <img
            className="h-8 w-auto sm:hidden"
            src="/swOpsLogo-sm.png"
            alt="부산대학교 SW프로젝트관리시스템 로고 (작은 버전)"
          />
        </Link>

        <HeaderMenu />

        <div className="flex items-center justify-between gap-2 md:gap-4 lg:gap-8">
          {isAdmin && (
            <Link to="/admin" className="flex items-center gap-2 hover:cursor-pointer">
              <BiCog className="text-mainGreen cursor-pointer text-sm" />
              <span className="text-exsm hidden text-nowrap lg:inline">관리자 페이지</span>
            </Link>
          )}
          {user?.name && (
            <div className="text-exsm text-nowrap max-md:hidden">
              <span className="text-mainGreen text-sm leading-none">{user.name}</span> 님 환영합니다!
            </div>
          )}
          <button
            onClick={isSignedIn ? handleLogout : () => navigate('/signin')}
            className="text-exsm border-lightGray rounded-full border px-4 py-2 text-nowrap hover:cursor-pointer"
          >
            {isSignedIn ? '로그아웃' : '로그인 / 회원가입'}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
