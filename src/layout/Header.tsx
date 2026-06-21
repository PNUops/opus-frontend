import useAuth from 'hooks/useAuth';
import { BiCog } from 'react-icons/bi';
import { CgProfile } from 'react-icons/cg';
import { useEffect, useRef, useState } from 'react';
import { HiMenu } from 'react-icons/hi';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useToast } from 'hooks/useToast';
import { useSidebar } from './SidebarContext';
import Button from '@components/Button';
import AltProfile from '@components/AltProfile';
import { useNotificationsQuery } from 'hooks/useNotifications';
import NotificationPanel from './NotificationPanel';

const Header = () => {
  const navigate = useNavigate();
  const { isSignedIn, signOut, user, isAdmin } = useAuth();
  const toast = useToast();
  const location = useLocation();
  const { toggle } = useSidebar();
  const notificationRef = useRef<HTMLDivElement>(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { data: notifications = [] } = useNotificationsQuery(isSignedIn);

  const isSidebarRoute = location.pathname === '/' || location.pathname.startsWith('/contest/');
  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  const handleLogout = () => {
    toast('로그아웃 되었습니다.', 'success');
    signOut();
    navigate('/');
  };

  useEffect(() => {
    setIsNotificationOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isNotificationOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (!notificationRef.current || notificationRef.current.contains(event.target as Node)) return;

      setIsNotificationOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isNotificationOpen]);

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
            {isSignedIn && (
              <div ref={notificationRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsNotificationOpen((prev) => !prev)}
                  className="hover:bg-whiteGray relative rounded-full px-4 py-2 text-sm text-[#374151] transition-colors hover:cursor-pointer"
                  aria-label={unreadCount > 0 ? `알림 ${unreadCount}개` : '알림'}
                  aria-haspopup="true"
                  aria-expanded={isNotificationOpen}
                  aria-controls="header-notification-panel"
                >
                  알림
                  {unreadCount > 0 && (
                    <span className="bg-mainGreen absolute top-1 right-1 h-2.5 w-2.5 rounded-full ring-2 ring-white" />
                  )}
                </button>
                {isNotificationOpen && (
                  <NotificationPanel id="header-notification-panel" onClose={() => setIsNotificationOpen(false)} />
                )}
              </div>
            )}
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
                to="/me"
                className="hover:bg-whiteGray flex items-center gap-2 rounded-full px-4 py-2 hover:cursor-pointer"
              >
                <CgProfile className="text-mainGreen h-5 w-5 cursor-pointer" />
                <span className="hidden text-sm text-nowrap lg:inline">내 계정</span>
              </Link>
            )}
          </div>
          {isSignedIn && (
            <Link to="/me" aria-label="내 계정" className="hidden rounded-full sm:block">
              <AltProfile seed={user?.name} size={32} />
            </Link>
          )}
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
