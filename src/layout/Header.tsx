import { type ReactNode, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '@hooks/useAuth';
import { useImageBlob } from '@hooks/useImageBlob';
import { useOutsideClick } from '@hooks/useOutsideClick';
import { useToast } from '@hooks/useToast';
import { HiMenu } from 'react-icons/hi';
import { Bell, LogOut, Settings, UserRound } from 'lucide-react';
import { useSidebar } from './SidebarContext';
import ProfileButton from './ProfileButton';
import Button from '@components/Button';
import Avatar from '@components/Avatar';
import { myProfileImageOption } from '@queries/me';

const PROFILE_MENU_ID = 'header-profile-menu';

const profileMenuItemClass =
  'hover:bg-whiteGray flex w-full items-center gap-3 rounded-md px-2 py-2.5 font-light text-left text-sm text-neutral-800 transition-colors';

interface ProfileMenuLinkProps {
  to: string;
  icon: ReactNode;
  children: string;
  onClick: () => void;
}

const ProfileMenuLink = ({ to, icon, children, onClick }: ProfileMenuLinkProps) => {
  return (
    <Link to={to} role="menuitem" className={profileMenuItemClass} onClick={onClick}>
      {icon}
      <span>{children}</span>
    </Link>
  );
};

interface ProfileMenuButtonProps {
  icon: ReactNode;
  children: string;
  onClick: () => void;
}

const ProfileMenuButton = ({ icon, children, onClick }: ProfileMenuButtonProps) => {
  return (
    <button type="button" role="menuitem" className={profileMenuItemClass} onClick={onClick}>
      {icon}
      <span>{children}</span>
    </button>
  );
};

interface HeaderProfileMenuProps {
  username?: string;
  isAdmin: boolean;
  onSignout: () => void;
  onNotificationClick: () => void;
}

const HeaderProfileMenu = ({ username, isAdmin, onSignout, onNotificationClick }: HeaderProfileMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const { imageURL } = useImageBlob(myProfileImageOption());
  const displayName = username?.trim() || '사용자';

  useOutsideClick(profileMenuRef, () => setIsOpen(false));

  const closeMenu = () => {
    setIsOpen(false);
  };

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  const handleSignout = () => {
    closeMenu();
    onSignout();
  };

  const handleNotificationClick = () => {
    closeMenu();
    onNotificationClick();
  };

  return (
    <div className="relative" ref={profileMenuRef}>
      <ProfileButton
        username={displayName}
        imageUrl={imageURL}
        isOpen={isOpen}
        menuId={PROFILE_MENU_ID}
        onClick={toggleMenu}
      />

      <div
        id={PROFILE_MENU_ID}
        role="menu"
        aria-label="프로필 메뉴"
        aria-hidden={!isOpen}
        inert={!isOpen}
        className={`border-lightGray absolute top-full right-0 z-50 mt-1 w-[250px] origin-top-right rounded-lg border bg-white px-5 py-4 shadow-lg transition duration-150 ease-out md:mt-4 ${
          isOpen
            ? 'pointer-events-auto translate-y-0 scale-100 opacity-100'
            : 'pointer-events-none -translate-y-1 scale-95 opacity-0'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="size-10 shrink-0 overflow-hidden rounded-full bg-gray-200">
            {imageURL ? (
              <img src={imageURL} alt={`${displayName} 프로필 이미지`} className="size-full object-cover" />
            ) : (
              <Avatar name={displayName} size={40} />
            )}
          </div>
          <p className="min-w-0 truncate text-base font-semibold text-neutral-900">{displayName}</p>
        </div>

        <p className="mt-4 text-sm text-neutral-500">
          <span className="text-mainGreen font-semibold">{displayName}</span> 님 환영합니다!
        </p>

        <div className="border-lightGray mt-4 border-t pt-2.5">
          <ProfileMenuLink
            to="/me/activity"
            icon={<UserRound className="h-4 w-4 text-neutral-500" />}
            onClick={closeMenu}
          >
            마이페이지
          </ProfileMenuLink>
          <ProfileMenuButton icon={<Bell className="h-4 w-4 text-neutral-500" />} onClick={handleNotificationClick}>
            알림
          </ProfileMenuButton>
        </div>

        {isAdmin && (
          <div className="border-lightGray mt-2 border-t pt-2.5">
            <ProfileMenuLink to="/admin" icon={<Settings className="h-4 w-4 text-neutral-500" />} onClick={closeMenu}>
              관리자페이지
            </ProfileMenuLink>
          </div>
        )}

        <div className="border-lightGray mt-2 border-t pt-2.5">
          <ProfileMenuButton icon={<LogOut className="h-4 w-4 text-neutral-500" />} onClick={handleSignout}>
            로그아웃
          </ProfileMenuButton>
        </div>
      </div>
    </div>
  );
};

const Header = () => {
  const navigate = useNavigate();
  const { isSignedIn, signOut, user, isAdmin } = useAuth();
  const toast = useToast();
  const location = useLocation();
  const { toggle } = useSidebar();

  const handleSignout = () => {
    toast('로그아웃 되었습니다.', 'success');
    signOut();
    navigate('/');
  };

  const handleNotificationClick = () => {
    toast('알림 기능은 준비 중이에요.', 'info');
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
              <HiMenu className="h-4 w-4" />
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
          {isSignedIn ? (
            <HeaderProfileMenu
              username={user?.name}
              isAdmin={isAdmin}
              onSignout={handleSignout}
              onNotificationClick={handleNotificationClick}
            />
          ) : (
            <Button
              onClick={isSignedIn ? handleSignout : () => navigate('/signin')}
              className="border-lightGray rounded-full border text-sm text-nowrap text-black hover:cursor-pointer"
            >
              로그인 / 회원가입
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
