import Avatar from 'boring-avatars';

interface AltProfileProps {
  seed?: string;
  imageUrl?: string | null;
  size?: number;
}
const AltProfile = ({ seed, imageUrl, size = 64 }: AltProfileProps) => {
  const isValidImage = imageUrl?.trim();
  if (isValidImage) {
    return (
      <img
        src={imageUrl || undefined}
        alt={seed}
        width={size}
        height={size}
        className="rounded-full object-cover"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
    );
  }
  return (
    <Avatar
      size={size}
      name={seed || 'Unknown'}
      variant="beam"
      colors={['#005baa', '#00a651', '#979797', '#d1f3e1', '#e2e2e2']}
    />
  );
};

export default AltProfile;
