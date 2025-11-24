import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useToast } from 'hooks/useToast';
import { getVoteTerm, updateVoteTerm } from 'apis/contests';
import { VoteTermDto } from 'types/DTO';

export const useGetVoteTerm = (contestId: number | undefined) => {
  return useQuery({
    queryKey: ['voteTerm', contestId],
    queryFn: () => getVoteTerm(contestId as number),
    enabled: !!contestId,
  });
};

export const useIsVoteTerm = (contestId: number | undefined) => {
  const { data: voteTermData } = useGetVoteTerm(contestId);

  const isVoteTerm = useMemo(() => {
    if (!voteTermData) return false;

    const now = new Date();
    const startTime = new Date(voteTermData.voteStartAt);
    const endTime = new Date(voteTermData.voteEndAt);

    return now >= startTime && now <= endTime;
  }, [voteTermData]);

  return { isVoteTerm };
};

export const useUpdateVoteTerm = (contestId: number) => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (payload: VoteTermDto) => updateVoteTerm(contestId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voteTerm', contestId] });
      toast('투표 설정이 업데이트 되었어요', 'success');
    },
    onError: () => {
      toast('투표 설정 업데이트에 실패했어요', 'error');
    },
  });
};
