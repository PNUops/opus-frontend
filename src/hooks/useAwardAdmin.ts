import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { patchTeamAward, patchCustomSortTeam } from 'apis/teams';
import { PatchAwardRequestDto, PatchCustomOrderRequestDto } from 'types/DTO';
import { TeamListItemResponseDto } from 'types/DTO/teams/teamListDto';

import { useToast } from 'hooks/useToast';
import useAuth from 'hooks/useAuth';
import useTeamList from 'hooks/useTeamList';

interface AwardPatchInfo extends PatchAwardRequestDto {
  teamId: number;
}

interface AwardState extends PatchAwardRequestDto {
  selectedTeamId?: number;
}

export const useAwardPatchAdmin = (contestId: number) => {
  const { user } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data: teamList } = useTeamList(contestId);

  const [awardState, setAwardState] = useState<AwardState>({
    selectedTeamId: undefined,
    awardName: '',
    awardColor: '',
  });

  const awardPatchSubmitAvailable =
    (awardState.selectedTeamId && awardState.awardName && awardState.awardColor) ?? false;

  useEffect(() => {
    if (!teamList || awardState.selectedTeamId === undefined) return;
    const team = teamList.find((t) => t.teamId === awardState.selectedTeamId);
    if (team) {
      setAwardState((prev) => ({
        ...prev,
        awardName: team.awardName?.trim() || '',
        awardColor: team.awardColor || '',
      }));
    }
  }, [awardState.selectedTeamId, teamList]);

  const awardPatchMutation = useMutation({
    mutationFn: ({ teamId, awardName, awardColor }: AwardPatchInfo) =>
      patchTeamAward(teamId, { awardName, awardColor }),
    onSuccess: () => {
      toast('수상 설정이 반영되었어요', 'success');
      queryClient.invalidateQueries({ queryKey: ['teams', contestId, user?.id ?? 'guest'] });
    },
    onError: () => {
      toast('수상 설정 저장에 실패했어요', 'error');
    },
  });

  const onSelectTeam = (teamId: number) => setAwardState((prev) => ({ ...prev, selectedTeamId: teamId }));
  const onChangeAwardName = (value: string) => setAwardState((prev) => ({ ...prev, awardName: value }));
  const onChangeAwardColor = (color: string) => setAwardState((prev) => ({ ...prev, awardColor: color }));

  const saveAward = (onSuccess?: () => void) => {
    if (awardState.selectedTeamId === undefined) return;
    awardPatchMutation.mutate(
      {
        teamId: awardState.selectedTeamId,
        awardName: awardState.awardName,
        awardColor: awardState.awardColor,
      },
      {
        onSuccess,
      },
    );
  };

  const deleteAward = (onSuccess?: () => void) => {
    if (awardState.selectedTeamId === undefined) return;
    awardPatchMutation.mutate(
      { teamId: awardState.selectedTeamId, awardName: null, awardColor: null },
      {
        onSuccess,
      },
    );
    setAwardState((prev) => ({ ...prev, awardName: '', awardColor: '' }));
  };

  if (!contestId || !teamList) return null;

  return {
    teamList,
    awardPatchSubmitAvailable,
    awardState,
    onSelectTeam,
    onChangeAwardName,
    onChangeAwardColor,
    saveAward,
    deleteAward,
    awardPatchMutation,
  };
};

export const useAwardCustomSortAdmin = (contestId: number, data: TeamListItemResponseDto[]) => {
  const { user } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [rows, setRows] = useState<TeamListItemResponseDto[]>([...data]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  useEffect(() => {
    setRows([...data]);
  }, [data]);

  const customSortMutation = useMutation({
    mutationFn: ({ payload }: { payload: PatchCustomOrderRequestDto }) => patchCustomSortTeam(payload),
    onSuccess: () => {
      toast('정렬이 저장되었어요', 'success');
      queryClient.invalidateQueries({ queryKey: ['teams', contestId, user?.id ?? 'guest'] });
    },
    onError: (error) => toast('정렬 저장에 실패했어요', 'error'),
  });

  const handleDragStart = (index: number) => (e: React.DragEvent) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (index: number) => (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (index: number) => (e: React.DragEvent) => {
    e.preventDefault();
    if (dragIndex === null) return;
    const updated = [...rows];
    const [moved] = updated.splice(dragIndex, 1);
    updated.splice(index, 0, moved);
    setRows(updated);
    setDragIndex(null);
  };

  const handleSaveOrder = ({ onSuccess, onError }: { onSuccess?: () => void; onError?: () => void } = {}) => {
    const teamOrders = rows.map((r, idx) => ({ teamId: r.teamId, itemOrder: idx + 1 }));
    customSortMutation.mutate(
      {
        payload: { contestId, teamOrders },
      },
      {
        onSuccess,
        onError,
      },
    );
  };

  return {
    rows,
    setRows,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleSaveOrder,
  };
};
