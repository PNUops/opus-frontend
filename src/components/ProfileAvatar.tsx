import { useEffect, useState } from 'react';

import Avatar from '@components/Avatar';

type ProfileAvatarProps = {
  name?: string | null;
  imageUrl?: string | null;
  size?: number;
  className?: string;
};

const ProfileAvatar = ({ name, imageUrl, size = 32, className }: ProfileAvatarProps) => {
  const [hasImageError, setHasImageError] = useState(false);
  const safeImageUrl = typeof imageUrl === 'string' ? imageUrl.trim() : '';
  const displayName = name?.trim() || 'OPUS_USER';

  useEffect(() => {
    setHasImageError(false);
  }, [safeImageUrl]);

  if (safeImageUrl && !hasImageError) {
    return (
      <img
        src={safeImageUrl}
        alt={`${displayName} 프로필 이미지`}
        width={size}
        height={size}
        className={`rounded-full object-cover ${className ?? ''}`}
        onError={() => setHasImageError(true)}
      />
    );
  }

  return <Avatar name={name} size={size} className={className} />;
};

export default ProfileAvatar;
