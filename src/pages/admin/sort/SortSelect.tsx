import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';
import { sortOptions } from '@constants/contest';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { putTeamSort } from 'apis/contest';
import { useContestIdOrRedirect } from 'hooks/useId';
import { useToast } from 'hooks/useToast';
import { sortStatusOption } from 'queries/contest';

const SortSelect = () => {
  const contestId = useContestIdOrRedirect();
  const queryClient = useQueryClient();
  const toast = useToast();

  const { data: currentSortOption } = useSuspenseQuery(sortStatusOption(contestId));

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

  return (
    <Select onValueChange={handleChange} value={currentSortOption || sortOptions[0].value} disabled={isPending}>
      <SelectTrigger
        className="border-subGreen h-10 w-fit min-w-[200px] rounded-none border-0 border-b-2 shadow-none focus:ring-0 focus:ring-offset-0 focus:outline-none"
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
  );
};

export default SortSelect;
