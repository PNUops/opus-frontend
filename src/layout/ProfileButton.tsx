import { useImageBlob } from '@hooks/useImageBlob';
import { myProfileImageOption } from '@queries/me';
import Avatar from '@components/Avatar';

interface ProfileButtonProps {
  onClick?: () => void;
  username?: string;
}

const ProfileButton = ({ onClick, username }: ProfileButtonProps) => {
  const { imageURL } = useImageBlob(myProfileImageOption());

  return (
    <button className="size-8 rounded-full bg-gray-300" onClick={onClick}>
      {imageURL ? (
        <img src={imageURL} alt="Profile" className="size-full rounded-full object-cover" />
      ) : (
        <Avatar name={username} />
      )}
    </button>
  );
};

export default ProfileButton;
