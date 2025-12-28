import Button from '@components/Button';
import Select from '@components/Select';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getSortStatus, patchSortTeam, sortOptions } from 'apis/teams';
import { useToast } from 'hooks/useToast';
import CustomOrderSection from './CustomOrderSection';

const TeamOrderAdminPage = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  const { data: currentSortOption, isLoading, error } = useQuery({ queryKey: ['sortStatus'], queryFn: getSortStatus });

  const { mutate, isPending } = useMutation({
    mutationFn: patchSortTeam,
    onSuccess: (_, mode) => {
      queryClient.invalidateQueries({ queryKey: ['sortStatus'] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      const label = sortOptions.find((option) => option.value === mode)?.label;
      toast(`프로젝트가 ${label} 정렬로 변경되었어요`, 'success');
    },
    onError: () => {
      toast('프로젝트 정렬 설정에 실패했어요', 'error');
    },
  });

  if (error) return <span className="text-sm">정렬 설정을 불러오지 못했습니다. 다시 시도해 주세요</span>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">정렬 관리</h1>
        <Select onChange={(e) => mutate(e.target.value)} disabled={isLoading || isPending}>
          {sortOptions.map(({ label, value }) => {
            return (
              <option key={value} value={value} selected={value === currentSortOption}>
                {label}
              </option>
            );
          })}
        </Select>
      </div>
      {currentSortOption === 'CUSTOM' && <CustomOrderSection />}
    </div>
  );
};
export default TeamOrderAdminPage;
