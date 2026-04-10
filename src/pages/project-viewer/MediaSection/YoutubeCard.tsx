import { formatEmbedUrl } from '@utils/media';

interface YoutubeCardProps {
  youtubeVidUrl: string;
}

const YoutubeCard = ({ youtubeVidUrl }: YoutubeCardProps) => {
  const embedUrl = formatEmbedUrl(youtubeVidUrl);

  if (!embedUrl) {
    return (
      <div className="text-midGray flex h-50 flex-col items-center justify-center gap-5 rounded border border-gray-200">
        유효하지 않은 유튜브 링크입니다.
      </div>
    );
  }

  return (
    <div className="aspect-video w-full">
      <iframe
        className="h-full w-full rounded"
        src={embedUrl}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
};

export default YoutubeCard;
