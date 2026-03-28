import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MdImage } from 'react-icons/md';
import { deleteBanner } from 'apis/banner';
import { useToast } from 'hooks/useToast';
import { useImageBlob } from 'hooks/useImageBlob';
import { bannerOption } from 'queries/banner';
import { useContestIdOrRedirect } from 'hooks/useId';
import QueryWrapper from 'providers/QueryWrapper';
import { AdminActionButton, AdminHeader } from '@components/admin';

const CurrentBannerSection = () => {
  const contestId = useContestIdOrRedirect();
  const toast = useToast();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationKey: ['bannerDelete'],
    mutationFn: () => deleteBanner(contestId),
  });

  const handleDelete = () => {
    if (!window.confirm('정말로 배너를 삭제하시겠습니까?')) return;

    deleteMutation.mutate(undefined, {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: bannerOption(contestId).queryKey });
        toast('배너가 삭제되었습니다', 'success');
      },
      onError: (error: any) => {
        toast(error.response?.data?.message || '배너 삭제에 실패했습니다.', 'error');
      },
    });
  };

  return (
    <section className="flex flex-col gap-5">
      <AdminHeader title="현재 배너" />
      <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
        <QueryWrapper loadingStyle="h-40 my-0" errorStyle="h-40">
          <BannerImage />
        </QueryWrapper>
      </div>
      <AdminActionButton
        className="ml-auto"
        variant="destructive"
        disabled={deleteMutation.isPending}
        onClick={handleDelete}
      >
        {deleteMutation.isPending ? '삭제 중...' : '현재 배너 삭제'}
      </AdminActionButton>
    </section>
  );
};

export default CurrentBannerSection;

const BannerImage = () => {
  const contestId = useContestIdOrRedirect();
  const { imageURL } = useImageBlob(bannerOption(contestId));

  if (imageURL) return <img src={imageURL} alt="현재 배너" className="w-full" />;
  else
    return (
      <div className="bg-whiteGray flex h-40 flex-col items-center justify-center">
        <div className="rounded-full bg-gray-200 p-3 shadow-sm">
          <MdImage className="text-2xl text-gray-400" />
        </div>
        <p className="mt-4 text-lg text-gray-600">등록된 배너가 없습니다</p>
        <p className="mt-1 text-sm text-gray-500">아래에서 새로운 배너를 업로드해주세요</p>
      </div>
    );
};
