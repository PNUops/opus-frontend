import BoringAvatar from 'boring-avatars';

const OPUS_AVATAR_COLORS = ['#005BAA', '#2D9CDB', '#00A651', '#56CC9D', '#F2C94C'];

type AvatarProps = {
  name?: string | null;
  size?: number;
  className?: string;
};

const Avatar = ({ name, size = 32, className }: AvatarProps) => {
  const seed = name?.trim() || 'OPUS_USER';

  return <BoringAvatar name={seed} variant="beam" colors={OPUS_AVATAR_COLORS} size={size} className={className} />;
};

export default Avatar;
