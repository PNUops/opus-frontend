import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useContestId } from '@hooks/useId';
import { contestsOption } from '@queries/contest';
import { useEffect } from 'react';

interface ContestSelectProps {
  contestId: string;
  onChange: (value: string) => void;
}

const ContestSelect = ({ contestId, onChange }: ContestSelectProps) => {
  const contestIdParam = useContestId();
  const { data: contests } = useSuspenseQuery(contestsOption());

  useEffect(() => {
    if (contestIdParam) onChange(contestIdParam.toString());
    else if (!contestIdParam && contests[0]) onChange(contests[0].contestId.toString());
  }, [contests, contestIdParam]);

  return (
    <Select onValueChange={onChange} value={contestId}>
      <SelectTrigger
        className="border-subGreen h-10 w-fit min-w-[220px] rounded-none border-0 border-b-2 shadow-none focus:ring-0 focus:ring-offset-0 focus:outline-none"
        iconClassName="stroke-mainGreen opacity-100 h-5 w-5"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {contests?.map((contest) => (
          <SelectItem key={contest.contestId} value={`${contest.contestId}`}>
            {contest.contestName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default ContestSelect;
