import ProfileAvatar from '@components/ProfileAvatar';

interface ProfileButtonProps {
  onClick?: () => void;
  username?: string;
  imageUrl?: string | null;
  isOpen?: boolean;
  menuId?: string;
  unreadNotificationCount?: number;
}

const ProfileButton = ({
  onClick,
  username,
  imageUrl,
  isOpen = false,
  menuId,
  unreadNotificationCount = 0,
}: ProfileButtonProps) => {
  const hasUnreadNotification = unreadNotificationCount > 0;
  const unreadNotificationLabel = unreadNotificationCount > 99 ? '99+' : String(unreadNotificationCount);

  return (
    <button
      type="button"
      className="focus-visible:ring-mainGreen relative size-8 rounded-full transition hover:ring-2 hover:ring-gray-200 focus-visible:ring-2 focus-visible:outline-none"
      onClick={onClick}
      aria-label={
        hasUnreadNotification ? `프로필 메뉴 열기, 읽지 않은 알림 ${unreadNotificationCount}개` : '프로필 메뉴 열기'
      }
      aria-haspopup="menu"
      aria-expanded={isOpen}
      aria-controls={isOpen ? menuId : undefined}
    >
      <span className="block size-8 overflow-hidden rounded-full bg-gray-300">
        <ProfileAvatar name={username} imageUrl={imageUrl} />
      </span>
      {hasUnreadNotification && (
        <span
          className="bg-mainRed absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-white px-1 text-[10px] leading-none font-bold text-white"
          aria-hidden="true"
        >
          {unreadNotificationLabel}
        </span>
      )}
    </button>
  );
};

export default ProfileButton;
