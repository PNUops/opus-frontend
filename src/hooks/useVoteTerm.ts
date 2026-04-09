import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { voteTermOption } from '@queries/votes';

export const useIsVoteTerm = (contestId: number | undefined) => {
  const { data: voteTermData } = useQuery(voteTermOption(contestId ?? 0));

  const isVoteTerm = useMemo(() => {
    if (!voteTermData) return false;

    const now = new Date();
    const startTime = new Date(voteTermData.voteStartAt);
    const endTime = new Date(voteTermData.voteEndAt);

    return now >= startTime && now <= endTime;
  }, [voteTermData]);

  return { isVoteTerm };
};
