import React, { useMemo } from 'react';
import { useToast } from '@hooks/useToast';
import { imageValidator } from '@utils/image';
import { ThumbnailResult } from '@apis/projectEditor';
import { PreviewResult } from '@dto/projectViewerDto';
import SortableImages, { MAX_IMAGES } from './SortableImages';
import type { ImageSlot } from './SortableImages';

import { HiInformationCircle } from 'react-icons/hi';
import { MdOutlineFileUpload } from 'react-icons/md';

interface ImageUploaderSectionProps {
  thumbnail: ThumbnailResult | File | undefined;
  setThumbnail: (thumb: ThumbnailResult | File | undefined) => void;
  previews: (PreviewResult | File)[];
  setPreviews: React.Dispatch<React.SetStateAction<(PreviewResult | File)[]>>;
  setThumbnailToDelete: (value: boolean) => void;
  setPreviewsToDelete: React.Dispatch<React.SetStateAction<number[]>>;
  canSort?: boolean;
  required?: boolean;
}

const ImageUploaderSection = ({
  thumbnail,
  setThumbnail,
  previews,
  setPreviews,
  setThumbnailToDelete,
  setPreviewsToDelete,
  canSort = true,
  required = false,
}: ImageUploaderSectionProps) => {
  const toast = useToast();

  const images: ImageSlot[] = useMemo(() => {
    const thumbnailSlot: ThumbnailResult | File | undefined =
      thumbnail && (thumbnail instanceof File || (thumbnail as ThumbnailResult).status !== 'error')
        ? thumbnail
        : undefined;
    const result: ImageSlot[] = [thumbnailSlot, ...previews];
    return result.slice(0, MAX_IMAGES);
  }, [thumbnail, previews]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (files.length === 0) return;

    const validate = imageValidator(files);
    if (!validate.isValid) {
      validate.message.forEach((msg) => toast(msg, 'error'));
      return;
    }

    const currentImageCount =
      (thumbnail && (thumbnail instanceof File || (thumbnail as ThumbnailResult).status !== 'error') ? 1 : 0) +
      previews.length;
    const newImageCount = currentImageCount + files.length;

    if (newImageCount > MAX_IMAGES) {
      toast(`이미지는 최대 ${MAX_IMAGES}개까지 업로드할 수 있어요`, 'error');
      return;
    }

    const newFiles: File[] = files.filter((file) => file.size > 0);

    const MAX_PREVIEWS = MAX_IMAGES - 1;
    const isEmptyThumbnail =
      !thumbnail || (thumbnail instanceof File ? false : (thumbnail as ThumbnailResult).status === 'error');

    if (isEmptyThumbnail) {
      const first = newFiles[0];
      if (!first) {
        toast('썸네일로 사용할 수 있는 이미지가 없어요', 'error');
        return;
      }
      const rest = newFiles.slice(1);
      const combinedPreviews = [...previews, ...rest].slice(0, MAX_PREVIEWS);
      setThumbnail(first);
      setPreviews(combinedPreviews);
    } else {
      const combined = [...previews, ...newFiles].slice(0, MAX_PREVIEWS);
      setPreviews(combined);
    }

    toast('이미지가 업로드 되었어요', 'success');
  };

  const handleRemove = (index: number) => {
    const target = images[index];
    if (!target) return;

    if (!(target instanceof File) && 'status' in target && target.status === 'processing') {
      toast('이미지 압축 중에는 삭제할 수 없어요', 'info');
      return;
    }

    if (index === 0) {
      if (!(target instanceof File) && 'status' in target && target.status === 'success') {
        setThumbnailToDelete(true);
      }
      setThumbnail(undefined);
      toast('이미지를 삭제했어요', 'info');
      return;
    }

    const previewToRemove = previews[index - 1];
    if (previewToRemove) {
      if (!(previewToRemove instanceof File) && 'id' in previewToRemove) {
        setPreviewsToDelete((prev) => [...prev, (previewToRemove as { id: number }).id]);
      }
    }
    const nextPreviews = previews.filter((_, i) => i !== index - 1);
    setPreviews(nextPreviews);
    toast('프리뷰 이미지를 삭제했어요', 'info');
  };

  const handleReorder = (nextThumbnail: ThumbnailResult | File | undefined, nextPreviews: (PreviewResult | File)[]) => {
    setThumbnail(nextThumbnail);
    setPreviews(nextPreviews);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    const validate = imageValidator(files);
    if (!validate.isValid) {
      validate.message.forEach((msg) => toast(msg, 'error'));
      return;
    }

    const currentImageCount =
      (thumbnail && (thumbnail instanceof File || (thumbnail as ThumbnailResult).status !== 'error') ? 1 : 0) +
      previews.length;
    const newImageCount = currentImageCount + files.length;

    if (newImageCount > MAX_IMAGES) {
      toast(`이미지는 최대 ${MAX_IMAGES}개까지 업로드할 수 있어요`, 'error');
      return;
    }
    const newFiles: File[] = files;

    const MAX_PREVIEWS = MAX_IMAGES - 1;
    const isEmptyThumbnail =
      !thumbnail || (thumbnail instanceof File ? false : (thumbnail as ThumbnailResult).status === 'error');

    if (isEmptyThumbnail) {
      const first = newFiles[0];
      if (!first) {
        toast('썸네일로 사용할 수 있는 이미지가 없어요', 'error');
        return;
      }
      const rest = newFiles.slice(1);
      const combinedPreviews = [...previews, ...rest].slice(0, MAX_PREVIEWS);
      setThumbnail(first);
      setPreviews(combinedPreviews);
    } else {
      const combined = [...previews, ...newFiles].slice(0, MAX_PREVIEWS);
      setPreviews(combined);
    }

    toast('이미지가 업로드 되었어요', 'success');
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

  return (
    <div className="flex flex-col gap-3 text-sm sm:flex-row sm:gap-10">
      <div className="text-exsm flex items-start justify-between gap-3 sm:flex-col sm:justify-normal sm:pt-3 sm:text-sm">
        <div className="text-midGray flex w-25 gap-1">
          <span className={`mr-1 ${required ? 'text-red-500' : 'text-transparent'}`}>*</span>
          <span>이미지</span>
        </div>
        <div className="group relative inline-block">
          <span className="ml-1 inline-flex animate-bounce cursor-help items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs text-green-500">
            <HiInformationCircle /> 가이드
          </span>
          <div className="pointer-events-none absolute top-1/2 right-full z-10 mr-3 w-64 -translate-y-1/2 rounded bg-green-50 p-3 text-xs leading-5 text-green-600 opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-80 group-active:opacity-100 sm:left-full sm:ml-3">
            권장 비율: <strong>3:2</strong> (예: 1500×1000)
            <br />
            최대 이미지 개수: <strong>6개</strong>
            <br />
            최대 용량: <strong>5MB</strong>
            <br />
            허용 확장자: .jpg, .png, .gif, .bmp, .webp
            <br />
            <br />
            ※권장 비율이 아닌 이미지에는 빈 여백이 생길 수 있어요.※
          </div>
        </div>
      </div>

      <div className="flex w-full flex-1 flex-col gap-3 xl:flex-row">
        <div
          className="border-lightGray text-midGray sm:items-around flex flex-1 flex-col items-center justify-center gap-2 rounded border p-6 text-center sm:gap-3 md:gap-5"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <p className="sm:text-exsm text-xs sm:inline">파일을 이곳에 끌어놓아주세요.</p>
          <p className="text-midGray sm:text-exsm my-2 text-xs sm:inline">OR</p>
          <label className="text-mainGreen bg-subGreen hover:bg-emerald-00 flex cursor-pointer rounded-full p-4 font-bold">
            <MdOutlineFileUpload className="sm:hidden" />
            <span className="sm:text-exsm hidden px-4 text-sm sm:inline">파일 업로드</span>
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
          </label>
        </div>
        <SortableImages
          images={images}
          onRemove={handleRemove}
          onReorder={handleReorder}
          onMoveBlocked={(message) => toast(message, 'info')}
          sortable={canSort}
        />
      </div>
    </div>
  );
};

export default ImageUploaderSection;
