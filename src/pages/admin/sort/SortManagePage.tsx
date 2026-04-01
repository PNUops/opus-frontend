import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';
import { sortOptions } from '@constants/contest';
import { getSortStatus, putTeamSort } from 'apis/contest';
import { useToast } from 'hooks/useToast';
import CustomOrderSection from './CustomOrderSection';
import { useContestIdOrRedirect } from 'hooks/useId';
import { AdminHeader } from '@components/admin';

const SortManagePage = () => {
  const contestId = useContestIdOrRedirect();
  const queryClient = useQueryClient();
  const toast = useToast();

  const {
    data: currentSortOption,
    isLoading,
    error,
  } = useQuery({ queryKey: ['sortStatus'], queryFn: () => getSortStatus(contestId) });

  const { mutate, isPending } = useMutation({
    mutationKey: ['changeSort'],
    mutationFn: (mode: string) => putTeamSort(contestId, mode),
  });

  const handleChange = (mode: string) => {
    mutate(mode, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['sortStatus'] });
        queryClient.invalidateQueries({ queryKey: ['teams'] });
        const label = sortOptions.find((option) => option.value === mode)?.label;
        toast(`프로젝트가 ${label} 정렬로 변경되었어요`, 'success');
      },
      onError: () => {
        toast('프로젝트 정렬 설정에 실패했어요', 'error');
      },
    });
  };

  if (error) return <span className="text-sm">정렬 설정을 불러오지 못했습니다. 다시 시도해 주세요</span>;

  return (
    <div className="flex flex-col gap-12">
      <AdminHeader title="정렬 관리" description="프로젝트의 정렬 순서를 변경할 수 있습니다.">
        <Select
          onValueChange={handleChange}
          value={currentSortOption || sortOptions[0].value}
          disabled={isLoading || isPending}
        >
          <SelectTrigger
            className="border-subGreen h-10 w-fit min-w-[220px] rounded-none border-0 border-b-2 shadow-none focus:ring-0 focus:ring-offset-0 focus:outline-none"
            iconClassName="stroke-mainGreen opacity-100 h-5 w-5"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map(({ label, value }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </AdminHeader>
      {currentSortOption === 'CUSTOM' && <CustomOrderSection />}
    </div>
  );
};
export default SortManagePage;
