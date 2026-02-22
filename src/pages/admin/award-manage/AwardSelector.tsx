import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@components/ui/popover';
import { deleteContestAward, getContestAwards, createContestAward } from 'apis/award';
import { getTeamAwards, updateTeamAward } from 'apis/team';
import AwardTag from '@components/AwardTag';
import { AwardDto, ContestAwardDto, TeamAwardDto } from 'types/DTO/awardsDto';
import { AWRD_PALETTE } from 'constants/palette';
import useDebounce from 'hooks/useDebounce';
import { deleteTeamAward } from 'apis/team';

interface AwardSelectorProps {
  awards: AwardDto[];
  options?: string[];
  onSelect?: (selected: string[]) => void;
}

const AwardSelector = ({ awards, options, onSelect }: AwardSelectorProps) => {
  const contestId = 1; // 임시 contestId
  const [isOpen, setIsOpen] = useState(false);
  const [newAwardName, setNewAwardName] = useState('');
  const debouncedAwardName = useDebounce(newAwardName, 100);
  const [selectedAwardIds, setSelectedAwardIds] = useState<number[]>([]);
  const debouncedSelectedAwardIds = useDebounce<number[]>(selectedAwardIds, 1000);

  const { data: teamAwards } = useQuery({
    queryKey: ['teamAwards', contestId],
    queryFn: () => getTeamAwards(contestId),
  });

  const { data: contestAwards } = useQuery({
    queryKey: ['contestAwards', contestId],
    queryFn: () => getContestAwards(contestId),
  });

  const teamAwardsList: TeamAwardDto[] = Array.isArray(teamAwards) ? teamAwards : [];
  const contestAwardsList: ContestAwardDto[] = contestAwards ?? [];

  const handleRemoveTeamAward = (awardId: number) => {
    deleteTeamAward(awardId);
    // alert(`삭제 awardId: ${awardId}`);
  };

  const handleRemoveContestAward = (awardId: number) => {
    deleteContestAward(contestId, awardId);
    // alert(`삭제 awardId: ${awardId}`);
  };

  const handleAddTeamAward = (awardIds: number[]) => {
    updateTeamAward(contestId, awardIds);
    // alert(`추가 awardIds: ${awardIds}`);
  };

  const toggleSelectAwardId = (id: number) => {
    setSelectedAwardIds((prev) => {
      const exists = prev.includes(id);
      if (exists) return prev.filter((x) => x !== id);
      return [...prev, id];
    });
  };

  useEffect(() => {
    if (debouncedSelectedAwardIds && debouncedSelectedAwardIds.length > 0) {
      handleAddTeamAward(debouncedSelectedAwardIds);
      setSelectedAwardIds([]);
    }
  }, [debouncedSelectedAwardIds]);

  const handleAddContestAward = (awardName: string, awardColor: string) => {
    createContestAward(contestId, { awardName, awardColor });
    alert(`추가 awardName: ${awardName}, awardColor: ${awardColor}`);
  };

  const filteredTeamAwardsList = teamAwardsList.filter((award) => award.awardName && award.awardColor);

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
                    onRemove={() => handleRemoveTeamAward(award.awardId)}
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
                    handleAddContestAward(newAwardName, color);
                    setNewAwardName('');
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-start gap-3 p-4">
              <p className="text-midGray text-base font-medium">옵션 선택</p>
              {contestAwards &&
                contestAwards.map((award) => (
                  <AwardTag
                    key={award.awardId}
                    awardName={award.awardName}
                    awardColor={award.awardColor}
                    onClick={() => {
                      toggleSelectAwardId(award.awardId);
                      setNewAwardName('');
                      alert('선택 awardId: ' + award.awardId);
                    }}
                    onRemove={() => {
                      handleRemoveContestAward(award.awardId);
                    }}
                  />
                ))}
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default AwardSelector;
