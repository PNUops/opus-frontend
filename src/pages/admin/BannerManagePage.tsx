import { useState, useRef } from 'react';
import { Button } from '@components/ui/button';
import { useToast } from 'hooks/useToast';
import { MdOutlineFileUpload, MdImage } from 'react-icons/md';

const BannerManagePage = () => {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentBanner, setCurrentBanner] = useState<string | null>(null);
  const [newBannerFile, setNewBannerFile] = useState<File | null>(null);
  const [newBannerPreview, setNewBannerPreview] = useState<string | null>(null);

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
    setNewBannerPreview(URL.createObjectURL(file));
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleSubmit = () => {
    if (!newBannerFile) {
      toast('새 배너 이미지를 선택해주세요', 'error');
      return;
    }

    // TODO: API 호출로 배너 업로드
    toast('배너가 수정되었습니다', 'success');
    setCurrentBanner(newBannerPreview);
    setNewBannerFile(null);
    setNewBannerPreview(null);
  };

  return (
    <div className="flex flex-col gap-10">
      <section>
        <h2 className="mb-4 text-lg font-bold">현재 배너</h2>
        <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
          {currentBanner ? (
            <img src={currentBanner} alt="현재 배너" className="h-auto w-full object-cover" />
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
      <div className="flex justify-end">
        <Button className="bg-mainBlue hover:bg-blue-600" onClick={handleSubmit} disabled={!newBannerFile}>
          수정하기
        </Button>
      </div>
    </div>
  );
};

export default BannerManagePage;
