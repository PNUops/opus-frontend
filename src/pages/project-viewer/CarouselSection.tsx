import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSwipeable } from 'react-swipeable';

import { getThumbnail, ThumbnailResult } from '@apis/projectEditor';
import { getPreviewImages } from '@apis/projectViewer';
import Spinner from '@components/Spinner';
import DefaultImage from '@assets/basicThumbnail.jpg';
import { PreviewImagesResponseDto, PreviewResult } from '@dto/projectViewerDto';
import { useToast } from '@hooks/useToast';

import { FaSadTear } from 'react-icons/fa';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa6';
import { CgSandClock } from 'react-icons/cg';
import { CiNoWaitingSign } from 'react-icons/ci';

interface CarouselSectionProps {
  teamId: number;
  previewIds: number[];
  youtubeUrl: string;
  isEditor: boolean;
}

type DefaultMedia = { status: 'default'; url: string };
type MediaType = ThumbnailResult | PreviewResult | 'youtube' | DefaultMedia | null;

const getEmbedUrl = (url: string) => {
  try {
    const fixedUrl = url.replace('m.youtube.com', 'www.youtube.com');
    const urlObj = new URL(fixedUrl);

    let videoId = urlObj.searchParams.get('v');

    if (!videoId) {
      if (urlObj.hostname === 'youtu.be') {
        videoId = urlObj.pathname.slice(1);
      } else if (urlObj.pathname.startsWith('/embed/')) {
        videoId = urlObj.pathname.split('/embed/')[1];
      }
    }

    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  } catch {
    return null;
  }
};

const ArrowButton = ({
  direction,
  onClick,
  size = 50,
  className = '',
}: {
  direction: 'left' | 'right';
  onClick: () => void;
  size?: number;
  className?: string;
}) => {
  const Icon = direction === 'left' ? FaChevronLeft : FaChevronRight;

  return (
    <button
      onClick={onClick}
      className={`focus:outline-none ${className} text-lightGray hover:text-mainGreen hover:cursor-pointer hover:bg-[#D1F3E1]/20`}
    >
      <Icon size={size} className="animate-pulse p-2 transition-colors duration-200 ease-in-out" />
    </button>
  );
};

const IndicatorDots = ({
  count,
  currentIndex,
  onClick,
}: {
  count: number;
  currentIndex: number;
  onClick: (index: number) => void;
}) => (
  <>
    {Array.from({ length: count }).map((_, index) => (
      <button
        key={index}
        onClick={() => onClick(index)}
        className={`h-2 w-2 rounded-full transition-all duration-200 hover:cursor-pointer hover:bg-[#D1F3E1] ${
          currentIndex === index ? 'bg-mainGreen' : 'bg-lightGray'
        }`}
      />
    ))}
  </>
);

const ErrorMessage = ({ icon: Icon, message }: { icon: React.ElementType; message: React.ReactNode }) => (
  <div className="text-lightGray absolute inset-0 flex h-full w-full animate-pulse flex-col items-center justify-center gap-5 bg-white px-4">
    <Icon size={40} />
    <span className="text-center text-xs">{message}</span>
  </div>
);

const statusMessageMap: Record<string, { icon: React.ElementType; message: React.ReactNode }> = {
  THUMBNAIL_PROCESSING: {
    icon: CgSandClock,
    message: (
      <>
        서버에서 썸네일을 처리 중이에요.
        <br />
        조금만 기다려주세요!
      </>
    ),
  },
  PREVIEW_PROCESSING: {
    icon: CgSandClock,
    message: (
      <>
        서버에서 미리보기 이미지를 처리 중이에요.
        <br />
        조금만 기다려주세요!
      </>
    ),
  },
  THUMBNAIL_ERR_404: {
    icon: CiNoWaitingSign,
    message: '썸네일 이미지가 아직 업로드되지 않았어요.',
  },
  PREVIEW_NOTFOUND: {
    icon: CiNoWaitingSign,
    message: '미리보기 이미지가 아직 업로드되지 않았어요.',
  },
  THUMBNAIL_ERR_ETC: {
    icon: FaSadTear,
    message: '썸네일을 불러오는 중 알 수 없는 오류가 발생했어요.',
  },
  PREVIEW_ERR_ETC: {
    icon: FaSadTear,
    message: '미리보기 이미지를 불러오는 중 알 수 없는 오류가 발생했어요.',
  },
};

const MediaRenderer = ({
  currentMedia,
  embedUrl,
  imageLoaded,
  setImageLoaded,
  setLoadFailed,
}: {
  currentMedia: MediaType;
  embedUrl: string | null;
  imageLoaded: boolean;
  setImageLoaded: (loaded: boolean) => void;
  setLoadFailed: (failed: boolean) => void;
}) => {
  if (currentMedia === 'youtube' && embedUrl) {
    return <iframe src={embedUrl} title="Youtube Iframe" allowFullScreen className="absolute inset-0 h-full w-full" />;
  }

  if (typeof currentMedia === 'object' && currentMedia?.status === 'default') {
    return <img src={currentMedia.url} alt="기본 이미지" className="absolute inset-0 h-full w-full object-contain" />;
  }

  if (typeof currentMedia === 'object' && currentMedia !== null) {
    if (currentMedia.status === 'success') {
      return (
        <>
          {!imageLoaded && (
            <div className="absolute inset-0 flex h-full w-full items-center justify-center bg-white">
              <Spinner />
            </div>
          )}
          <img
            src={currentMedia.url}
            alt="Project image"
            onLoad={() => setImageLoaded(true)}
            onError={() => setLoadFailed(true)}
            className={`absolute inset-0 h-full w-full bg-gray-50 object-contain transition-opacity duration-200 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </>
      );
    }

    if (currentMedia.status === 'processing' || currentMedia.status === 'error') {
      const messageData = statusMessageMap[currentMedia.code];
      return messageData ? <ErrorMessage icon={messageData.icon} message={messageData.message} /> : null;
    }
  }

  return <ErrorMessage icon={FaSadTear} message="이미지를 찾을 수 없어요." />;
};

const CarouselSection = ({ teamId, previewIds, youtubeUrl, isEditor }: CarouselSectionProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [, setLoadFailed] = useState(false);

  const toast = useToast();
  const imageNotFoundToast = useRef(false);

  const { data: thumbnailResult } = useQuery<ThumbnailResult>({
    queryKey: ['thumbnail', teamId],
    queryFn: () => getThumbnail(teamId),
    refetchInterval: (query) => (query.state.data?.status === 'processing' ? 1500 : false),
  });

  const stablePreviewIds = useMemo(() => [...previewIds], [previewIds]);
  const { data: previewData } = useQuery<PreviewImagesResponseDto>({
    queryKey: ['previewImages', teamId, stablePreviewIds],
    queryFn: () => getPreviewImages(teamId, stablePreviewIds),
    enabled: stablePreviewIds.length > 0,
    refetchInterval: (query) => {
      const data = query.state.data;
      const shouldRefetch = data?.imageResults?.some((result) => result.status === 'processing') ?? false;
      return shouldRefetch ? 1500 : false;
    },
  });

  useEffect(() => {
    if (thumbnailResult?.status === 'error' && thumbnailResult.code === 'THUMBNAIL_NOTFOUND') {
      if (!imageNotFoundToast.current) {
        if (isEditor) {
          toast('썸네일 이미지를 올려주세요.', 'info');
        }
        imageNotFoundToast.current = true;
      }
    } else {
      imageNotFoundToast.current = false;
    }
  }, [thumbnailResult, isEditor, toast]);

  useEffect(() => {
    if (previewIds.length === 0) {
      if (!imageNotFoundToast.current) {
        if (isEditor) {
          toast('작업 결과 미리보기 이미지를 올려주세요.', 'info');
        }
        imageNotFoundToast.current = true;
      } else {
        imageNotFoundToast.current = false;
      }
    }
  }, [previewIds, isEditor, toast]);

  const embedUrl = useMemo(() => getEmbedUrl(youtubeUrl), [youtubeUrl]);

  const rawImages = useMemo(() => {
    const images: MediaType[] = [];

    if (thumbnailResult) {
      images.push(thumbnailResult);
    }

    if (embedUrl) {
      images.push('youtube');
    }

    if (previewData?.imageResults) {
      images.push(...previewData.imageResults);
    }

    const hasValidMedia = images.some(
      (media) => media === 'youtube' || (typeof media === 'object' && media?.status === 'success'),
    );

    if (!hasValidMedia) {
      images.push({ status: 'default', url: DefaultImage });
    }

    return images;
  }, [embedUrl, previewData, thumbnailResult]);

  const visibleImages = useMemo(() => {
    return rawImages.filter((media): media is Exclude<MediaType, null> => {
      if (media === 'youtube') return true;

      if (media && typeof media === 'object') {
        if (media.status === 'success' || media.status === 'processing' || media.status === 'default') {
          return true;
        }

        if (media.status === 'error') {
          return media.code === 'THUMBNAIL_ERR_ETC' || media.code === 'PREVIEW_ERR_ETC';
        }
      }

      return false;
    });
  }, [rawImages]);

  const currentMedia = useMemo(() => visibleImages[currentIndex] ?? null, [visibleImages, currentIndex]);

  useEffect(() => {
    if (currentIndex >= visibleImages.length) {
      setCurrentIndex(0);
    }
  }, [currentIndex, visibleImages.length]);

  useEffect(() => {
    setImageLoaded(false);
    setLoadFailed(false);
  }, [currentMedia]);

  const goToPrev = () => setCurrentIndex((prev) => (prev === 0 ? visibleImages.length - 1 : prev - 1));
  const goToNext = () => setCurrentIndex((prev) => (prev === visibleImages.length - 1 ? 0 : prev + 1));
  const goToSlide = (index: number) => setCurrentIndex(index);

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (visibleImages.length > 1) goToNext();
    },
    onSwipedRight: () => {
      if (visibleImages.length > 1) goToPrev();
    },
    preventScrollOnSwipe: true,
    trackMouse: false,
  });

  return (
    <div {...handlers} className="flex h-full w-full flex-col items-center gap-4">
      <div className="relative flex w-full items-center justify-center">
        <div className="relative w-full max-w-2xl">
          <div className="border-lightGray relative aspect-[3/2] w-full overflow-hidden rounded bg-white">
            <MediaRenderer
              currentMedia={currentMedia}
              embedUrl={embedUrl}
              imageLoaded={imageLoaded}
              setImageLoaded={setImageLoaded}
              setLoadFailed={setLoadFailed}
            />
          </div>
        </div>
      </div>

      {visibleImages.length > 1 && (
        <div className="mt-4 flex w-full max-w-2xl items-center justify-between px-3">
          <ArrowButton direction="left" onClick={goToPrev} size={40} className="rounded-full" />

          <div className="flex gap-5">
            <IndicatorDots count={visibleImages.length} currentIndex={currentIndex} onClick={goToSlide} />
          </div>

          <ArrowButton direction="right" onClick={goToNext} size={40} className="rounded-full" />
        </div>
      )}
    </div>
  );
};

export default CarouselSection;
