import { useState, useRef, useEffect } from 'react';
import { Button } from '@components/ui/button';
import { useToast } from 'hooks/useToast';
import { MdOutlineFileUpload, MdImage } from 'react-icons/md';
import { useParams } from 'react-router-dom';
import useBanner from 'hooks/useBanner';

const BannerManagePage = () => {
  const { contestId: paramContestId } = useParams<{ contestId: string }>();
  const contestId = paramContestId ? Number(paramContestId) : undefined;

  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newBannerFile, setNewBannerFile] = useState<File | null>(null);
  const [newBannerPreview, setNewBannerPreview] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (newBannerPreview) URL.revokeObjectURL(newBannerPreview);
    };
  }, [newBannerPreview]);

  const {
    currentBanner: fetchedBanner,
    refetch: refetchBanner,
    uploadFile,
    isUploading,
    removeBanner,
    isDeleting,
  } = useBanner(contestId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
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
    if (newBannerPreview) URL.revokeObjectURL(newBannerPreview);
    setNewBannerPreview(URL.createObjectURL(file));
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
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
    if (newBannerPreview) URL.revokeObjectURL(newBannerPreview);
    setNewBannerPreview(URL.createObjectURL(file));
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleSubmit = () => {
    if (!contestId) {
      toast('업로드할 대회 ID가 제공되지 않았습니다', 'error');
      return;
    }

    if (!newBannerFile) {
      toast('새 배너 이미지를 선택해주세요', 'error');
      return;
    }

    uploadFile(newBannerFile)
      .then((res: any) => {
        console.log('banner upload success', res);
        toast('배너가 등록되었습니다', 'success');
        refetchBanner();
        setNewBannerFile(null);
        if (newBannerPreview) URL.revokeObjectURL(newBannerPreview);
        setNewBannerPreview(null);
      })
      .catch((err: any) => {
        console.error('banner upload error', err);
        const status = err?.response?.status;
        if (status === 400) toast('이미지 파일이 없습니다', 'error');
        else if (status === 401) toast('권한이 없습니다 (로그인 필요)', 'error');
        else if (status === 403) toast('권한이 없습니다', 'error');
        else if (status === 404) toast('대회를 찾을 수 없습니다', 'error');
        else toast('서버 오류가 발생했습니다', 'error');
      });
  };

  const handleDelete = () => {
    if (!contestId) {
      toast('삭제할 대회 ID가 제공되지 않았습니다', 'error');
      return;
    }

    if (!window.confirm('정말로 배너를 삭제하시겠습니까?')) return;

    removeBanner()
      .then(() => {
        console.log('banner delete success');
        toast('배너가 삭제되었습니다', 'success');
        refetchBanner();
      })
      .catch((err: any) => {
        console.error('banner delete error', err);
        const status = err?.response?.status;
        if (status === 401) toast('권한이 없습니다 (로그인 필요)', 'error');
        else if (status === 403) toast('권한이 없습니다', 'error');
        else if (status === 404) toast('대회를 찾을 수 없습니다', 'error');
        else toast('서버 오류가 발생했습니다', 'error');
      });
  };

  return (
    <div className="flex flex-col gap-10">
      <section>
        <h2 className="mb-4 text-lg font-bold">현재 배너</h2>
        <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
          {fetchedBanner ? (
            <img src={fetchedBanner} alt="현재 배너" className="h-auto w-full object-cover" />
          ) : (
            <div className="flex h-48 flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
              <div className="rounded-full bg-gray-200 p-4 shadow-sm">
                <MdImage className="text-3xl text-gray-400" />
              </div>
              <p className="mt-4 text-lg font-medium text-gray-600">등록된 배너가 없습니다</p>
              <p className="mt-1 text-sm text-gray-500">아래에서 새로운 배너를 업로드해주세요</p>
            </div>
          )}
        </div>
      </section>
      <section>
        <h2 className="mb-4 text-lg font-bold">배너 수정</h2>
        <div
          className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-gray-300 p-10 transition-colors hover:border-gray-400"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
        >
          {newBannerPreview ? (
            <img src={newBannerPreview} alt="새 배너 미리보기" className="max-h-48 w-auto rounded" />
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
      </section>
      <div className="flex justify-end gap-3">
        <Button
          className="bg-mainBlue hover:bg-blue-600"
          onClick={handleSubmit}
          disabled={!newBannerFile || !contestId || isUploading}
        >
          {isUploading ? '업로드 중...' : '수정하기'}
        </Button>

        <Button className="bg-mainRed hover:bg-red-600" onClick={handleDelete} disabled={!fetchedBanner || isDeleting}>
          {isDeleting ? '삭제 중...' : '삭제하기'}
        </Button>
      </div>
    </div>
  );
};

export default BannerManagePage;
