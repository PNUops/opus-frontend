import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@components/ui/popover';
import { deleteContestAward, getContestAwards, createContestAward } from 'apis/award';
import { getTeamAwards, updateTeamAward } from 'apis/team';
import AwardTag from '@components/AwardTag';
import { AwardDto, ContestAwardDto, TeamAwardDto } from 'types/DTO/awardsDto';
import { AWRD_PALETTE } from 'constants/palette';
import useDebounce from 'hooks/useDebounce';
import { useToast } from 'hooks/useToast';

interface AwardSelectorProps {
  contestId: number;
  teamId: number;
  awards: AwardDto[];
}

const AwardSelector = ({ contestId, teamId, awards }: AwardSelectorProps) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [newAwardName, setNewAwardName] = useState('');
  const debouncedAwardName = useDebounce(newAwardName, 100);

  const { data: teamAwards } = useQuery({
    queryKey: ['teamAwards', teamId],
    queryFn: () => getTeamAwards(teamId),
    enabled: Boolean(teamId),
  });

  const { data: contestAwards } = useQuery({
    queryKey: ['contestAwards', contestId],
    queryFn: () => getContestAwards(contestId),
  });

  const teamAwardsList: TeamAwardDto[] = Array.isArray(teamAwards) ? teamAwards : [];
  const contestAwardsList: ContestAwardDto[] = contestAwards ?? [];
  const selectedAwardIds = useMemo(() => teamAwardsList.map((award) => award.awardId), [teamAwardsList]);

  const invalidateAwardQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['teamAwards', teamId] });
    queryClient.invalidateQueries({ queryKey: ['contestAwards', contestId] });
    queryClient.invalidateQueries({ queryKey: ['teams', contestId] });
  };

  const { mutate: mutateTeamAwards, isPending: isUpdatingTeamAwards } = useMutation({
    mutationFn: (awardIds: number[]) => updateTeamAward(teamId, awardIds),
    onSuccess: () => {
      invalidateAwardQueries();
    },
    onError: (error: any) => {
      toast(error.response?.data?.message || '팀 수상 수정에 실패했습니다.', 'error');
    },
  });

  const { mutate: mutateCreateContestAward, isPending: isCreatingContestAward } = useMutation({
    mutationFn: ({ awardName, awardColor }: { awardName: string; awardColor: string }) =>
      createContestAward(contestId, { awardName, awardColor }),
    onSuccess: () => {
      invalidateAwardQueries();
      setNewAwardName('');
      toast('새 상훈을 추가했습니다.');
    },
    onError: (error: any) => {
      toast(error.response?.data?.message || '상훈 추가에 실패했습니다.', 'error');
    },
  });

  const { mutate: mutateDeleteContestAward, isPending: isDeletingContestAward } = useMutation({
    mutationFn: (awardId: number) => deleteContestAward(contestId, awardId),
    onSuccess: () => {
      invalidateAwardQueries();
      toast('상훈을 삭제했습니다.');
    },
    onError: (error: any) => {
      toast(error.response?.data?.message || '상훈 삭제에 실패했습니다.', 'error');
    },
  });

  const handleToggleTeamAward = (awardId: number) => {
    const exists = selectedAwardIds.includes(awardId);
    const nextAwardIds = exists ? selectedAwardIds.filter((id) => id !== awardId) : [...selectedAwardIds, awardId];
    mutateTeamAwards(nextAwardIds);
  };

  const handleRemoveTeamAward = (awardId: number) => {
    const nextAwardIds = selectedAwardIds.filter((id) => id !== awardId);
    mutateTeamAwards(nextAwardIds);
  };

  const handleAddContestAward = (awardName: string, awardColor: string) => {
    if (!awardName.trim()) {
      toast('상훈 이름을 입력해주세요.', 'error');
      return;
    }
    mutateCreateContestAward({ awardName: awardName.trim(), awardColor });
  };

  const filteredTeamAwardsList = teamAwardsList.filter(
    (award) => Boolean(award.awardName) && Boolean(award.awardColor),
  );
  const isPendingAction = isUpdatingTeamAwards || isCreatingContestAward || isDeletingContestAward;

  return (
    <div className="flex w-full items-center gap-4">
      <label className="w-30 flex-shrink-0 text-sm leading-none">상훈 명칭</label>
      <Popover
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          setNewAwardName('');
        }}
      >
        <PopoverTrigger asChild>
          <div className="hover:bg-whiteGray flex min-h-[44px] flex-1 cursor-pointer items-center justify-between rounded-md p-2">
            {awards.length > 0 ? (
              <div className="flex gap-3">
                {awards.map((award, index) => (
                  <AwardTag key={index} awardName={award.awardName ?? ''} awardColor={award.awardColor ?? ''} />
                ))}
              </div>
            ) : (
              <p className="text-midGray">해당 팀에 등록된 상이 없습니다.</p>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="flex min-h-[var(--radix-popover-trigger-height)] w-fit flex-col overflow-hidden p-0 text-sm shadow-xl"
          sideOffset={-44}
        >
          <div className="bg-whiteGray flex items-center gap-4 p-4">
            {filteredTeamAwardsList.length > 0 && (
              <div className="flex items-center gap-3">
                {filteredTeamAwardsList.map((award, index) => (
                  <AwardTag
                    key={index}
                    awardName={award.awardName ?? ''}
                    awardColor={award.awardColor ?? ''}
                    onRemove={() => {
                      if (!isPendingAction) handleRemoveTeamAward(award.awardId);
                    }}
                  />
                ))}
              </div>
            )}
            <div className="inline-grid min-w-[50px] items-center">
              <span className="invisible col-start-1 row-start-1 px-1 whitespace-pre">{newAwardName}</span>
              <input
                className="col-start-1 row-start-1 w-full bg-transparent outline-none"
                value={newAwardName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewAwardName(e.target.value)}
                placeholder={newAwardName ? '' : '추가 상훈 입력...'}
                autoFocus
              />
            </div>
          </div>
          {debouncedAwardName ? (
            <div className="flex flex-col items-start gap-3 p-4">
              <p className="text-midGray text-base font-medium">옵션 선택</p>
              {AWRD_PALETTE.map((color) => (
                <AwardTag
                  key={color}
                  awardName={debouncedAwardName}
                  awardColor={color}
                  onClick={() => {
                    if (isPendingAction) return;
                    handleAddContestAward(newAwardName, color);
                    setNewAwardName('');
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-start gap-3 p-4">
              <p className="text-midGray text-base font-medium">옵션 선택</p>
              {contestAwardsList.map((award) => (
                <div
                  key={award.awardId}
                  className={
                    selectedAwardIds.includes(award.awardId) ? 'rounded-full ring-2 ring-blue-300 ring-offset-1' : ''
                  }
                >
                  <AwardTag
                    awardName={award.awardName}
                    awardColor={award.awardColor}
                    onClick={() => {
                      if (isPendingAction) return;
                      handleToggleTeamAward(award.awardId);
                      setNewAwardName('');
                    }}
                    onRemove={() => {
                      if (isPendingAction) return;
                      mutateDeleteContestAward(award.awardId);
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default AwardSelector;
