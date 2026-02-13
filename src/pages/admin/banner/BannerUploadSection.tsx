import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MdOutlineFileUpload } from 'react-icons/md';
import { FiX } from 'react-icons/fi';
import { useToast } from 'hooks/useToast';
import { postBanner } from 'apis/banner';
import Button from '@components/Button';
import { cn } from '@components/lib/utils';
import { bannerOption } from 'queries/banner';

const BannerUploadSection = () => {
  const { contestId } = useParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [newBannerFile, setNewBannerFile] = useState<File | null>(null);
  const [newBannerPreview, setNewBannerPreview] = useState<string | null>(null);
  const toast = useToast();

  const { refetch: refetchBanner } = useQuery(bannerOption(Number(contestId ?? 0)));
  const uploadMutation = useMutation({
    mutationKey: ['banner', Number(contestId ?? 0)],
    mutationFn: (formData: FormData) => postBanner(Number(contestId ?? 0), formData),
  });

  useEffect(() => {
    return () => {
      if (newBannerPreview) URL.revokeObjectURL(newBannerPreview);
    };
  }, [newBannerPreview]);

  const setFileAndPreview = (file?: File) => {
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast('지원되는 파일 형식: jpg, png, webp', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast('파일 크기는 5MB 이하여야 합니다', 'error');
      return;
    }

    setNewBannerFile(file);
    setNewBannerPreview(URL.createObjectURL(file));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileAndPreview(file);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    setFileAndPreview(file);
  };

  const handleRemoveFile = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setNewBannerFile(null);
    setNewBannerPreview(null);
  };

  const handleSubmit = () => {
    if (!contestId) return;
    if (!newBannerFile) return toast('배너 이미지를 등록해주세요.', 'error');

    const formData = new FormData();
    formData.append('image', newBannerFile);

    uploadMutation.mutate(formData, {
      onSuccess: () => {
        setNewBannerFile(null);
        setNewBannerPreview(null);
        refetchBanner();
      },
      onError: (error: any) => {
        toast(error.response?.data?.message || '배너 등록에 실패했습니다.', 'error');
      },
    });
  };

  return (
    <section className="flex flex-col gap-5">
      <h2 className="text-lg font-bold">신규 배너 등록</h2>
      <div
        className={cn(
          'hover:border-mainBlue flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-gray-300 p-10 transition-colors hover:bg-blue-50',
          {
            'border-mainBlue bg-blue-50': isDragging,
          },
        )}
        onDrop={handleDrop}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
      >
        {newBannerPreview ? (
          <div className="relative">
            <img src={newBannerPreview} alt="새 배너 미리보기" className="max-h-48 w-auto rounded" />
            <button
              onClick={handleRemoveFile}
              className="absolute top-[-4px] right-[-4px] rounded-full p-1 hover:bg-gray-200"
            >
              <FiX className="stroke-red-600" size={22} />
            </button>
          </div>
        ) : (
          <>
            <MdOutlineFileUpload className="text-4xl text-gray-400" />
            <p className="text-gray-500">새로운 배너 이미지를 업로드 하세요.</p>
            <p className="text-sm text-gray-400">지원되는 파일 형식: jpg, png, webp</p>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
      <Button
        className="bg-mainBlue ml-auto px-4 py-1 hover:bg-blue-600"
        onClick={handleSubmit}
        disabled={!newBannerFile || !contestId || uploadMutation.isPending}
      >
        {uploadMutation.isPending ? '등록 중...' : '등록하기'}
      </Button>
    </section>
  );
};

export default BannerUploadSection;
