import ProfileAvatar from '@components/ProfileAvatar';

interface ProfileButtonProps {
  onClick?: () => void;
  username?: string;
  imageUrl?: string | null;
  isOpen?: boolean;
  menuId?: string;
}

const ProfileButton = ({ onClick, username, imageUrl, isOpen = false, menuId }: ProfileButtonProps) => {
  return (
    <button
      type="button"
      className="focus-visible:ring-mainGreen size-8 overflow-hidden rounded-full bg-gray-300 transition hover:ring-2 hover:ring-gray-200 focus-visible:ring-2 focus-visible:outline-none"
      onClick={onClick}
      aria-label="프로필 메뉴 열기"
      aria-haspopup="menu"
      aria-expanded={isOpen}
      aria-controls={isOpen ? menuId : undefined}
    >
      <ProfileAvatar name={username} imageUrl={imageUrl} />
    </button>
  );
};

export default ProfileButton;
