import Avatar from 'boring-avatars';

interface AltProfileProps {
  seed?: string;
  imageUrl?: string | null;
  size?: number;
}
const AltProfile = ({ seed, imageUrl, size = 64 }: AltProfileProps) => {
  const safeImageUrl = typeof imageUrl === 'string' ? imageUrl.trim() : '';
  const displayName = seed || 'Unknown';

  if (safeImageUrl) {
    return (
      <img
        src={safeImageUrl}
        alt={displayName}
        width={size}
        height={size}
        className="rounded-full object-cover"
        onError={(e) => {
          e.currentTarget.src = '';
        }}
      />
    );
  }

  return (
    <Avatar
      size={size}
      name={displayName}
      variant="beam"
      colors={['#005baa', '#00a651', '#979797', '#d1f3e1', '#e2e2e2']}
    />
  );
};

export default AltProfile;
