import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { defaultRankFilter } from '@constants/statistics';
import { useContestIdOrRedirect } from 'hooks/useId';
import { voteRankingOption } from 'queries/statistics';

interface VoteFilterSelectProps {
  selectedFilter: string;
  onChange: (value: string) => void;
}

const VoteFilterSelect = ({ selectedFilter, onChange }: VoteFilterSelectProps) => {
  const contestId = useContestIdOrRedirect();
  const { data: voteRanking } = useSuspenseQuery(voteRankingOption(contestId));

  const filters = useMemo(() => {
    if (!voteRanking) return defaultRankFilter;
    const uniq = Array.from(new Set(voteRanking.map((r) => r.trackName)));
    return [...defaultRankFilter, ...uniq];
  }, [voteRanking]);

  return (
    <Select onValueChange={onChange} value={selectedFilter}>
      <SelectTrigger
        className="border-subGreen h-10 w-fit min-w-[180px] rounded-none border-0 border-b-2 shadow-none focus:ring-0 focus:ring-offset-0 focus:outline-none"
        iconClassName="stroke-mainGreen opacity-100 h-5 w-5"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {filters.map((filter) => (
          <SelectItem key={filter} value={filter}>
            {filter}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default VoteFilterSelect;
