import { useState, useEffect, useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useMediaQuery } from '@react-hookz/web';
import { useSwipeable } from 'react-swipeable';
import { useToast } from '@hooks/useToast';
import { ThumbnailResult, getThumbnail } from '@apis/projectEditor';
import { getPreviewImages } from '@apis/projectViewer';
import { PreviewResult, PreviewImagesResponseDto } from '@dto/projectViewerDto';

import Spinner from '@components/Spinner';
import DefaultImage from '@assets/basicThumbnail.jpg';

import { FaChevronLeft, FaChevronRight } from 'react-icons/fa6';
import { FaSadTear } from 'react-icons/fa';
import { CgSandClock } from 'react-icons/cg';
import { CiNoWaitingSign } from 'react-icons/ci';

interface CarouselSectionProps {
  teamId: number;
  previewIds: number[];
  youtubeUrl: string;
  isEditor: boolean;
}

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
  onClick: (i: number) => void;
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
  <div className="text-lightGray border-lightGray flex h-full w-full animate-pulse flex-col items-center justify-center gap-5 border">
    <Icon size={40} />
    <span className="text-center text-xs">{message}</span>
  </div>
);

type DefaultMedia = { status: 'default'; url: string };
type MediaType = ThumbnailResult | PreviewResult | 'youtube' | DefaultMedia | null;

const MediaRenderer = ({
  currentMedia,
  embedUrl,
  imageLoaded,
  setImageLoaded,
  setLoadFailed,
  isEditor,
}: {
  currentMedia: MediaType;
  embedUrl: string | null;
  imageLoaded: boolean;
  setImageLoaded: (loaded: boolean) => void;
  setLoadFailed: (failed: boolean) => void;
  isEditor: boolean;
}) => {
  if (currentMedia === 'youtube' && embedUrl) {
    return <iframe src={embedUrl} title="Youtube Iframe" allowFullScreen className="aspect-video w-full" />;
  }

  if (typeof currentMedia === 'object' && currentMedia?.status === 'default') {
    return <img src={currentMedia.url} alt="기본 이미지" className="w-full object-contain" />;
  }

  const statusMessageMap: Record<string, { icon: React.ElementType; message: React.ReactNode; isError?: boolean }> = {
    THUMBNAIL_PROCESSING: {
      icon: CgSandClock,
      message: (
        <>
          서버에서 썸네일을 압축 중이에요
          <br />
          조금만 기다려주세요!
        </>
      ),
    },
    PREVIEW_PROCESSING: {
      icon: CgSandClock,
      message: (
        <>
          서버에서 프리뷰 이미지를 압축 중이에요
          <br />
          조금만 기다려주세요!
        </>
      ),
    },
    THUMBNAIL_ERR_404: {
      icon: CiNoWaitingSign,
      message: '썸네일 이미지가 아직 업로드되지 않았어요',
      isError: true,
    },
    PREVIEW_ERR_404: {
      icon: CiNoWaitingSign,
      message: '프리뷰 이미지가 아직 업로드되지 않았어요',
      isError: true,
    },
    THUMBNAIL_ERR_ETC: {
      icon: FaSadTear,
      message: '썸네일 로드 중 알 수 없는 오류가 발생했어요',
      isError: true,
    },
    PREVIEW_ERR_ETC: {
      icon: FaSadTear,
      message: '프리뷰 이미지 로드 중 알 수 없는 오류가 발생했어요',
      isError: true,
    },
  };

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
            className={`w-full bg-gray-50 object-contain transition-opacity duration-200 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </>
      );
    } else if (currentMedia.status === 'processing') {
      const messageData = statusMessageMap[currentMedia.code];
      return messageData ? <ErrorMessage icon={messageData.icon} message={messageData.message} /> : null;
    } else if (currentMedia.status === 'error') {
      const messageData = statusMessageMap[currentMedia.code];
      return messageData ? <ErrorMessage icon={messageData.icon} message={messageData.message} /> : null;
    }
  }
  return <ErrorMessage icon={FaSadTear} message="이미지를 찾을 수 없거나 올바르지 않아요" />;
};

const CarouselSection = ({ teamId, previewIds, youtubeUrl, isEditor }: CarouselSectionProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const isMobile = useMediaQuery('(max-width:640px)');

  // TECHWEEK: 포스터 처리를 위한 state
  const [isFirstPosterTall, setIsFirstPosterTall] = useState(false);

  const toast = useToast();
  const thumbnailNotFoundToast = useRef(false);

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

  // useEffect(() => {
  //   if (thumbnailResult?.status === 'error' && thumbnailResult.code === 'THUMBNAIL_NOTFOUND') {
  //     if (!thumbnailNotFoundToast.current) {
  //       if (isEditor) {
  //         toast('썸네일 이미지를 올려주세요', 'info');
  //       }
  //       thumbnailNotFoundToast.current = true;
  //     }
  //   } else {
  //     thumbnailNotFoundToast.current = false;
  //   }
  // }, [thumbnailResult, isEditor, toast]);

  // TECHWEEK: 포스터 없을 때 토스트
  useEffect(() => {
    if (previewIds.length === 0) {
      if (!thumbnailNotFoundToast.current) {
        if (isEditor) {
          toast('졸업과제 포스터를 올려주세요', 'info');
        }
        thumbnailNotFoundToast.current = true;
      } else {
        thumbnailNotFoundToast.current = false;
      }
    }
  }, [previewIds, isEditor, toast]);

  const embedUrl = useMemo(() => getEmbedUrl(youtubeUrl), [youtubeUrl]);
  const rawImages = useMemo(() => {
    const images: MediaType[] = [];
    // if (previewData?.imageResults) {
    //   images.push(...(previewData.imageResults[0] ? [previewData.imageResults[0]] : []));
    // }
    // if (embedUrl) {
    //   images.push('youtube');
    // }
    // if (thumbnailResult) {
    //   images.push(thumbnailResult);
    // }
    // if (previewData?.imageResults) {
    //   images.push(...(previewData.imageResults[1] ? previewData.imageResults.slice(1) : []));
    // }

    // TECHWEEK: 포스터 처리를 위한 로직
    const imageResults = previewData?.imageResults ?? [];

    if (imageResults.length > 0 && imageResults[0]) {
      images.push(imageResults[0]); // 포스터 역할을 할 previewData.imageResults[0]을 맨 앞에 push 하기
    }

    if (embedUrl) {
      images.push('youtube');
    }

    if (thumbnailResult) {
      images.push(thumbnailResult);
    }

    if (imageResults.length > 1) {
      images.push(...imageResults.slice(1));
    }

    const hasValidMedia = images.some(
      (media) => media === 'youtube' || (typeof media === 'object' && media?.status === 'success'),
    );

    if (!hasValidMedia) images.push({ status: 'default', url: DefaultImage });

    return images;
  }, [embedUrl, thumbnailResult, previewData]);

  const visibleImages = useMemo(() => {
    return rawImages.filter((media): media is MediaType => {
      if (media === 'youtube') return true;
      if (media && typeof media === 'object') {
        if (media.status === 'success' || media.status === 'processing') return true;
        if (media.status === 'error') {
          return 'code' in media && (media.code === 'THUMBNAIL_ERR_ETC' || media.code === 'PREVIEW_ERR_ETC');
        }
        if (media.status === 'default') return true;
      }
      return false;
    });
  }, [rawImages]);

  const currentMedia = useMemo(() => visibleImages[currentIndex] || null, [visibleImages, currentIndex]);

  const isFirstPreviewActive = useMemo(() => {
    const first = previewData?.imageResults?.[0];
    if (!first) return false;
    const media = visibleImages[currentIndex];
    if (!media || typeof media !== 'object') return false;
    // Only compare URLs when both items are successful preview results (they expose `url`)
    if ('status' in media && media.status === 'success' && first.status === 'success') {
      return media.url === first.url;
    }
    return false;
  }, [previewData, visibleImages, currentIndex]);

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
        <div className={`relative w-full max-w-2xl ${isFirstPreviewActive ? 'max-h-[800vh] sm:max-h-[700vh]' : ''}`}>
          <div className="border-lightGray relative w-full overflow-hidden rounded">
            {isFirstPreviewActive && typeof currentMedia === 'object' && currentMedia?.status === 'success' ? (
              <img
                src={(currentMedia as any).url}
                alt="포스터"
                onLoad={() => setImageLoaded(true)}
                onError={() => setLoadFailed(true)}
                className="w-full bg-gray-50 object-contain"
              />
            ) : (
              <div className="w-full">
                <MediaRenderer
                  currentMedia={currentMedia}
                  embedUrl={embedUrl}
                  imageLoaded={imageLoaded}
                  setImageLoaded={setImageLoaded}
                  setLoadFailed={setLoadFailed}
                  isEditor={isEditor}
                />
              </div>
            )}
          </div>

          {/* {!isMobile && visibleImages.length > 1 && (
            <>
              <button
                onClick={goToPrev}
                aria-label="이전"
                className="absolute top-0 bottom-0 left-0 flex items-center px-2"
                style={{ zIndex: 20 }}
              >
                <span className="rounded-full p-2 transition-colors group-hover:bg-[#D1F3E1]/25">
                  <FaChevronLeft size={50} className="text-lightGray/50 hover:text-mainGreen" />
                </span>
              </button>

              <button
                onClick={goToNext}
                aria-label="다음"
                className="absolute top-0 right-0 bottom-0 flex items-center px-2"
                style={{ zIndex: 20 }}
              >
                <span className="rounded-full p-2 transition-colors group-hover:bg-[#D1F3E1]/25">
                  <FaChevronRight size={50} className="text-lightGray/50 hover:text-mainGreen" />
                </span>
              </button>
            </>
          )} */}
        </div>
      </div>

      {visibleImages.length > 1 && (
        // TECHWEEK: PC와 모바일 indicator 위치 같도록
        // <div
        //   className={`mt-4 flex items-center ${!isMobile ? 'justify-center' : 'justify-between'} w-full max-w-2xl px-3`}
        // >
        <div className="mt-4 flex w-full max-w-2xl items-center justify-between px-3">
          {/* TECHWEEK: PC와 모바일 indicator 위치 같도록 */}
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
