import { useState, useRef, useEffect } from 'react';
import { Button } from '@components/ui/button';
import { useToast } from 'hooks/useToast';
import { MdOutlineFileUpload, MdImage } from 'react-icons/md';
import { useMutation } from '@tanstack/react-query';
import { getAccessToken } from 'utils/token';
import { API_BASE_URL } from '@constants/index';
import { useParams } from 'react-router-dom';
import useAuth from 'hooks/useAuth';
import { isTokenExpired, getUserFromToken } from 'utils/token';
import { useQuery } from '@tanstack/react-query';
import { getBannerUrl, deleteBanner, postBanner } from 'apis/contests';

interface BannerManagePageProps {
  contestId?: number;
}

const BannerManagePage = ({ contestId: propContestId }: BannerManagePageProps) => {
  const { contestId: paramContestId } = useParams<{ contestId?: string }>();
  const contestId = propContestId ?? (paramContestId ? Number(paramContestId) : undefined);

  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentBanner, setCurrentBanner] = useState<string | null>(null);
  const [newBannerFile, setNewBannerFile] = useState<File | null>(null);
  const [newBannerPreview, setNewBannerPreview] = useState<string | null>(null);

  const { isSignedIn, isAdmin } = useAuth();

  const mutation = useMutation({
    mutationFn: (formData: FormData) => {
      if (!contestId) throw new Error('contestId is required');
      return postBanner(contestId!, formData);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => {
      if (!contestId) throw new Error('contestId is required');
      return deleteBanner(contestId!);
    },
  });

  const prevBlobUrlRef = useRef<string | null>(null);

  const { data: bannerBlobUrl, refetch: refetchBanner } = useQuery({
    queryKey: ['banner', contestId],
    queryFn: () => getBannerUrl(contestId!),
    enabled: !!contestId,
  });

  useEffect(() => {
    if (!bannerBlobUrl) {
      if (prevBlobUrlRef.current) {
        URL.revokeObjectURL(prevBlobUrlRef.current);
        prevBlobUrlRef.current = null;
      }
      setCurrentBanner(null);
      return;
    }

    if (prevBlobUrlRef.current) {
      URL.revokeObjectURL(prevBlobUrlRef.current);
    }
    prevBlobUrlRef.current = bannerBlobUrl;
    setCurrentBanner(bannerBlobUrl);

    return () => {
      if (prevBlobUrlRef.current) {
        URL.revokeObjectURL(prevBlobUrlRef.current);
        prevBlobUrlRef.current = null;
      }
    };
  }, [bannerBlobUrl]);

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
    if (!contestId) {
      toast('업로드할 대회 ID가 제공되지 않았습니다', 'error');
      return;
    }

    if (!newBannerFile) {
      toast('새 배너 이미지를 선택해주세요', 'error');
      return;
    }

    // check token validity/roles before sending
    const token = getAccessToken();
    if (!token || isTokenExpired(token as string)) {
      toast('세션이 만료되었거나 로그인 정보가 없습니다. 다시 로그인해주세요.', 'error');
      return;
    }

    const decoded = getUserFromToken(token as string);
    if (!decoded || !decoded.roles?.includes('ROLE_관리자')) {
      toast('관리자 권한이 필요합니다.', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('image', newBannerFile);

    console.log('isSignedIn, isAdmin, token:', isSignedIn, isAdmin, token);

    mutation.mutate(formData, {
      onSuccess: (res: any) => {
        console.log('banner upload success', res);
        toast('배너가 등록되었습니다', 'success');
        // after successful upload, refetch banner
        refetchBanner();
        setNewBannerFile(null);
        setNewBannerPreview(null);
      },
      onError: (err: any) => {
        console.error('banner upload error', err);
        const status = err?.response?.status;
        if (status === 400) toast('이미지 파일이 없습니다', 'error');
        else if (status === 401) toast('권한이 없습니다 (로그인 필요)', 'error');
        else if (status === 403) toast('권한이 없습니다', 'error');
        else if (status === 404) toast('대회를 찾을 수 없습니다', 'error');
        else toast('서버 오류가 발생했습니다', 'error');
      },
    });
  };

  const handleDelete = () => {
    if (!contestId) {
      toast('삭제할 대회 ID가 제공되지 않았습니다', 'error');
      return;
    }

    if (!window.confirm('정말로 배너를 삭제하시겠습니까?')) return;

    deleteMutation.mutate(undefined, {
      onSuccess: (res: any) => {
        console.log('banner delete success', res);
        toast('배너가 삭제되었습니다', 'success');
        // revoke any existing blob url and clear
        if (prevBlobUrlRef.current) {
          URL.revokeObjectURL(prevBlobUrlRef.current);
          prevBlobUrlRef.current = null;
        }
        setCurrentBanner(null);
        refetchBanner();
      },
      onError: (err: any) => {
        console.error('banner delete error', err);
        const status = err?.response?.status;
        if (status === 401) toast('권한이 없습니다 (로그인 필요)', 'error');
        else if (status === 403) toast('권한이 없습니다', 'error');
        else if (status === 404) toast('대회를 찾을 수 없습니다', 'error');
        else toast('서버 오류가 발생했습니다', 'error');
      },
    });
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
        <div className="flex items-center gap-4">
          {!isSignedIn ? (
            <p className="text-sm text-red-500">
              로그인이 필요합니다.{' '}
              <a href="/signin" className="underline">
                로그인하러 가기
              </a>
            </p>
          ) : !isAdmin ? (
            <p className="text-sm text-red-500">관리자 권한이 필요합니다</p>
          ) : null}

          <div className="flex items-center gap-3">
            <Button
              className="bg-mainBlue hover:bg-blue-600"
              onClick={handleSubmit}
              disabled={!newBannerFile || !contestId || mutation.isLoading || !isSignedIn || !isAdmin}
            >
              {mutation.isLoading ? '업로드 중...' : '수정하기'}
            </Button>

            <Button
              className="bg-mainRed hover:bg-red-600"
              onClick={handleDelete}
              disabled={!currentBanner || deleteMutation.isLoading || !isSignedIn || !isAdmin}
            >
              {deleteMutation.isLoading ? '삭제 중...' : '삭제하기'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannerManagePage;
