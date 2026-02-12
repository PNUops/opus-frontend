import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { MdImage } from 'react-icons/md';
import { useParams } from 'react-router-dom';
import Button from '@components/Button';
import { API_BASE_URL } from '@constants/index';
import { deleteBanner } from 'apis/banner';
import { useToast } from 'hooks/useToast';

interface CurrentBannerSectionProps {
  bannerVersion: number;
  onBannerUpdate: () => void;
}

const CurrentBannerSection = ({ bannerVersion, onBannerUpdate }: CurrentBannerSectionProps) => {
  const { contestId } = useParams();
  const toast = useToast();
  const [bannerURL, setBannerURL] = useState<string | null>(null);

  const deleteMutation = useMutation({
    mutationKey: ['banner', Number(contestId ?? 0)],
    mutationFn: () => deleteBanner(Number(contestId ?? 0)),
  });

  useEffect(() => {
    if (contestId) setBannerURL(`${API_BASE_URL}/api/contests/${contestId}/image/banner?v=${bannerVersion}`);
  }, [contestId, bannerVersion]);

  const handleImageError = () => {
    setBannerURL(null);
  };

  const handleDelete = () => {
    if (!window.confirm('정말로 배너를 삭제하시겠습니까?')) return;

    deleteMutation.mutate(undefined, {
      onSuccess: () => {
        onBannerUpdate();
        toast('배너가 삭제되었습니다', 'success');
      },
      onError: (error: any) => {
        toast(error.response?.data?.message || '배너 삭제에 실패했습니다.', 'error');
      },
    });
  };

  return (
    <section className="flex flex-col gap-5">
      <h2 className="text-lg font-bold">현재 배너</h2>
      <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
        {bannerURL ? (
          <img src={bannerURL} alt="현재 배너" className="h-auto w-full object-cover" onError={handleImageError} />
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
      <Button
        className="bg-mainRed disabled:bg-midGray ml-auto px-4 py-1 hover:bg-red-600"
        onClick={handleDelete}
        disabled={!bannerURL || deleteMutation.isPending}
      >
        {deleteMutation.isPending ? '삭제 중...' : '현재 배너 삭제'}
      </Button>
    </section>
  );
};

export default CurrentBannerSection;
