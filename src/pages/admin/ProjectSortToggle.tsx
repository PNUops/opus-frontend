import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from 'hooks/useToast';
import { getSortStatus, patchSortTeam, SortOption, sortOptions } from 'apis/teams';

const ProjectSortToggle = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  const { data: selected, isLoading, error } = useQuery({ queryKey: ['sortStatus'], queryFn: getSortStatus });

  const mutation = useMutation({
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

  const handleToggle = (mode: SortOption) => {
    mutation.mutate(mode);
  };

  if (error) {
    return (
      <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-center lg:gap-15">
        <span className="text-sm font-medium whitespace-nowrap">- 프로젝트 정렬 설정</span>
        <div className="border-lightGray flex flex-1 items-center justify-center rounded-md border p-4">
          <span className="text-sm">정렬 설정을 불러오지 못했습니다. 다시 시도해 주세요</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-center lg:gap-15">
      <span className="text-sm font-medium whitespace-nowrap">- 프로젝트 정렬 설정</span>
      <div className="border-lightGray flex flex-1 items-center justify-center gap-1 rounded-md border p-1">
        {sortOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => handleToggle(option.value)}
            disabled={option.value == selected || isLoading || mutation.isPending}
            className={`h-10 flex-1 cursor-pointer rounded-sm text-sm transition-colors ${
              selected === option.value ? 'bg-mainGreen text-white' : 'hover:bg-lightGray/70 text-black'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProjectSortToggle;
