interface AltProfileProps {
  seed?: string;
  imageUrl?: string | null;
  size?: number;
}

const palette = ['#005baa', '#00a651', '#979797', '#d1f3e1', '#e2e2e2'];

const getColorFromSeed = (seed: string) => {
  const hash = Array.from(seed).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return palette[hash % palette.length];
};

const getInitial = (seed: string) => seed.trim().charAt(0).toUpperCase() || '?';

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
    <span
      className="inline-flex items-center justify-center rounded-full text-sm font-semibold text-white"
      style={{
        width: size,
        height: size,
        backgroundColor: getColorFromSeed(displayName),
        fontSize: Math.max(12, Math.floor(size * 0.42)),
      }}
      aria-label={displayName}
    >
      {getInitial(displayName)}
    </span>
  );
};

export default AltProfile;
