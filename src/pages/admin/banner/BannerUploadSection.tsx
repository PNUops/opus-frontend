import { useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MdOutlineFileUpload } from 'react-icons/md';
import { FiX } from 'react-icons/fi';
import { useToast } from '@hooks/useToast';
import { postBanner } from '@apis/banner';
import { cn } from '@components/lib/utils';
import { bannerOption } from '@queries/banner';
import { useContestIdOrRedirect } from '@hooks/useId';
import { AdminActionButton, AdminHeader } from '@components/admin';
import { getApiErrorMessage } from '@utils/error';

const BannerUploadSection = () => {
  const contestId = useContestIdOrRedirect();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [newBannerFile, setNewBannerFile] = useState<File | null>(null);
  const [newBannerPreview, setNewBannerPreview] = useState<string | null>(null);
  const toast = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationKey: ['bannerUpload'],
    mutationFn: (formData: FormData) => postBanner(contestId, formData),
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
    if (fileInputRef.current) fileInputRef.current.value = '';
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
        queryClient.resetQueries({ queryKey: bannerOption(contestId).queryKey });
      },
      onError: (error) => {
        toast(getApiErrorMessage(error, '배너 등록에 실패했습니다.'), 'error');
      },
    });
  };

  return (
    <section className="flex flex-col gap-5">
      <AdminHeader title="신규 배너 등록" />
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
            <img src={newBannerPreview} alt="새 배너 미리보기" className="max-h-48 w-auto" />
            <button
              onClick={handleRemoveFile}
              className="absolute top-[-4px] right-[-4px] rounded-full p-1 hover:bg-gray-200"
            >
              <FiX className="stroke-red-600" size={22} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <MdOutlineFileUpload className="text-4xl text-gray-400" />
            <p className="mt-3 text-lg text-gray-600">새로운 배너 이미지를 업로드 하세요.</p>
            <p className="text-sm text-gray-500">지원되는 파일 형식: jpg, png, webp</p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
      <AdminActionButton
        disabled={!newBannerFile || uploadMutation.isPending}
        className="ml-auto"
        onClick={handleSubmit}
      >
        {uploadMutation.isPending ? '등록 중...' : '등록하기'}
      </AdminActionButton>
    </section>
  );
};

export default BannerUploadSection;
