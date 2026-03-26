import useAuth from 'hooks/useAuth';
import { BiCog } from 'react-icons/bi';
import { CgProfile } from 'react-icons/cg';
import { HiMenu } from 'react-icons/hi';
import { useNavigate, useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useToast } from 'hooks/useToast';
import { useSidebar } from './SidebarContext';
import Button from '@components/Button';

const Header = () => {
  const navigate = useNavigate();
  const { isSignedIn, signOut, user, isAdmin } = useAuth();
  const toast = useToast();
  const location = useLocation();
  const { toggle } = useSidebar();

  const handleLogout = () => {
    toast('로그아웃 되었습니다.', 'success');
    signOut();
    navigate('/');
  };

  const isSidebarRoute = location.pathname === '/' || location.pathname.startsWith('/contest/');

  return (
    <header className="border-lightGray lg:h-header md:h-header xs:h-8 shadow-b-lg z-20 flex w-full min-w-[350px] items-center justify-between border-b bg-white px-3 py-2 sm:h-20">
      <div className="mx-auto flex w-full items-center justify-between gap-4 px-2 sm:px-8 sm:py-4 md:gap-8 lg:gap-16 lg:px-10">
        <div className="flex items-center gap-2">
          {isSidebarRoute && (
            <Button
              onClick={toggle}
              className="flex h-9 w-9 items-center justify-center p-0 text-black lg:hidden"
              aria-label="메뉴 열기"
            >
              <HiMenu className="h-5 w-5" />
            </Button>
          )}
          <Link to="/" className="max-sm:hidden">
            <img className="w-auto sm:h-6 md:h-7 lg:h-8" src="/Logo.svg" alt="부산대학교 SW프로젝트관리시스템 로고" />
          </Link>
          <Link to="/" className="items-center sm:hidden">
            <img
              className="h-7 w-auto"
              src="/swOpsLogo-sm.png"
              alt="부산대학교 SW프로젝트관리시스템 로고 (작은 버전)"
            />
          </Link>
        </div>

        <div className="flex items-center justify-end gap-2 md:gap-4 lg:gap-8">
          <div className="flex items-center gap-0.5 md:gap-1">
            {isAdmin && (
              <Link
                to="/admin"
                className="hover:bg-whiteGray flex items-center gap-2 rounded-full px-4 py-2 hover:cursor-pointer"
              >
                <BiCog className="text-mainGreen h-5 w-5 cursor-pointer" />
                <span className="hidden text-sm text-nowrap lg:inline">관리자 페이지</span>
              </Link>
            )}
            {user?.name && (
              <Link
                to="/me/activity"
                className="hover:bg-whiteGray flex items-center gap-2 rounded-full px-4 py-2 hover:cursor-pointer"
              >
                <CgProfile className="text-mainGreen h-5 w-5 cursor-pointer" />
                <span className="hidden text-sm text-nowrap lg:inline">내 계정</span>
              </Link>
            )}
          </div>
          <Button
            onClick={isSignedIn ? handleLogout : () => navigate('/signin')}
            className="border-lightGray rounded-full border text-sm text-nowrap text-black hover:cursor-pointer"
          >
            {isSignedIn ? '로그아웃' : '로그인 / 회원가입'}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
