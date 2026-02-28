import { useState, useEffect } from 'react';
import useTeamList from 'hooks/useTeamList';
import { AwardDto } from 'types/DTO/awardsDto';

interface AwardViewState {
  selectedTeamId?: number;
  awards: AwardDto[];
}

export const useAwardViewAdmin = (contestId: number) => {
  const { data: teamList } = useTeamList(contestId);

  const [viewState, setViewState] = useState<AwardViewState>({
    selectedTeamId: undefined,
    awards: [],
  });

  useEffect(() => {
    if (!teamList || viewState.selectedTeamId === undefined) return;

    const team = teamList.find((t) => t.teamId === viewState.selectedTeamId);
    if (team) {
      setViewState((prev) => ({
        ...prev,
        awards: [...team.awards],
      }));
    }
  }, [viewState.selectedTeamId, teamList]);

  const onSelectTeam = (teamId: number) => {
    setViewState((prev) => ({ ...prev, selectedTeamId: teamId === 0 ? undefined : teamId }));
  };

  return {
    teamList: teamList ?? [],
    selectedTeamId: viewState.selectedTeamId,
    awards: viewState.awards,
    onSelectTeam,
  };
};
