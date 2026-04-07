import { useEffect, useMemo } from 'react';
import { FiX } from 'react-icons/fi';
import { MdBrokenImage, MdOutlineFileUpload } from 'react-icons/md';
import { CgSandClock } from 'react-icons/cg';
import { HiInformationCircle } from 'react-icons/hi';

import { PosterResult } from 'apis/projectEditor';
import { useToast } from 'hooks/useToast';
import { imageValidator } from 'utils/image';

interface PosterUploaderSectionProps {
  poster: PosterResult | File | undefined;
  setPoster: (poster: PosterResult | File | undefined) => void;
  setPosterToDelete: (value: boolean) => void;
  required?: boolean;
}

const PosterUploaderSection = ({
  poster,
  setPoster,
  setPosterToDelete,
  required = false,
}: PosterUploaderSectionProps) => {
  const toast = useToast();

  const posterUrl = useMemo(() => {
    if (!poster) return '';
    if (poster instanceof File) return URL.createObjectURL(poster);
    if (poster.status === 'success') return poster.url;
    return '';
  }, [poster]);

  useEffect(() => {
    return () => {
      if (posterUrl.startsWith('blob:')) {
        URL.revokeObjectURL(posterUrl);
      }
    };
  }, [posterUrl]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const validate = imageValidator(file);
    if (!validate.isValid) {
      validate.message.forEach((msg) => toast(msg, 'error'));
      return;
    }

    setPoster(file);
    toast('포스터가 업로드 되었어요', 'success');
  };

  const handleRemove = () => {
    if (!poster) return;

    if (!(poster instanceof File) && poster.status === 'processing') {
      toast('압축 중인 포스터는 삭제할 수 없어요', 'info');
      return;
    }

    if (!(poster instanceof File) && poster.status === 'success') {
      setPosterToDelete(true);
    }
    setPoster(undefined);
    toast('포스터를 삭제했어요', 'info');
  };

  const renderContent = () => {
    if (!poster) {
      return (
        <div className="text-midGray flex h-full w-full flex-col items-center justify-center gap-3">
          <MdOutlineFileUpload size={24} />
          <p className="sm:text-exsm text-xs sm:inline">포스터를 업로드 해주세요.</p>
        </div>
      );
    }

    if (poster instanceof File || poster.status === 'success') {
      return <img src={posterUrl} alt="포스터" className="h-full w-full object-contain" />;
    }

    if (poster.status === 'processing') {
      return (
        <div className="text-lightGray flex h-full w-full flex-col items-center justify-center gap-3">
          <CgSandClock size={24} />
          <span className="text-xs">포스터 압축 중...</span>
        </div>
      );
    }

    return (
      <div className="text-lightGray flex h-full w-full flex-col items-center justify-center gap-3">
        <MdBrokenImage size={24} />
        <span className="text-xs">포스터를 불러올 수 없어요</span>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-3 text-sm sm:flex-row sm:gap-10">
      <div className="text-exsm flex items-start justify-between gap-3 sm:flex-col sm:justify-normal sm:pt-2 sm:text-sm">
        <div className="text-midGray flex w-25 gap-1">
          <span className={`mr-1 ${required ? 'text-red-500' : 'text-transparent'}`}>*</span>
          <span>포스터</span>
        </div>
        <div className="group relative inline-block">
          <span className="ml-1 inline-flex animate-bounce cursor-help items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs text-green-500">
            <HiInformationCircle /> 가이드
          </span>
          <div className="pointer-events-none absolute top-1/2 right-full z-10 mr-3 w-64 -translate-y-1/2 rounded bg-green-50 p-3 text-xs leading-5 text-green-600 opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-80 group-active:opacity-100 sm:left-full sm:ml-3">
            권장 비율: <strong>2:3</strong> (예: 1000×1500)
            <br />
            최대 이미지 개수: <strong>1개</strong>
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
      <div className="flex flex-1 flex-col gap-3">
        <div className="border-lightGray relative h-[260px] w-[160px] overflow-hidden rounded border bg-white">
          {renderContent()}
          {poster && (
            <button
              type="button"
              onClick={handleRemove}
              className="border-lightGray bg-whiteGray absolute top-2 right-2 rounded-full border p-1"
            >
              <FiX size={13} className="text-midGray" />
            </button>
          )}
        </div>
        <label className="text-mainGreen bg-subGreen inline-flex w-fit cursor-pointer rounded-full px-4 py-2 text-xs font-bold hover:bg-emerald-100">
          {poster ? '포스터 변경' : '포스터 업로드'}
          <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
        </label>
      </div>
    </div>
  );
};

export default PosterUploaderSection;
