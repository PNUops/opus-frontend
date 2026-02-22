import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getAllContests, postAllContests, deleteContest } from 'apis/contest';
import { getSortStatus, getAllTeams, deleteTeam } from 'apis/team';
import { useToast } from 'hooks/useToast';
import { TeamListItemResponseDto } from 'types/DTO/teams/teamListDto';
import { SortOption } from 'apis/team';

type DeleteModalState = {
  type: 'contest' | 'team' | null;
  targetId: number | null;
};

type ContestAdminState = {
  contestName: string;
  currentContestName: string;
  currentContestId: number;
  contestTeams: TeamListItemResponseDto[];
  isEditModalOpen: boolean;
  isDeleteModalOpen: boolean;
  editContestId: number;
  editContestName: string;
};

const useContestAdmin = () => {
  const [state, setState] = useState<ContestAdminState>({
    contestName: '',
    currentContestName: '불러오는 중...',
    currentContestId: 1,
    contestTeams: [],
    isEditModalOpen: false,
    isDeleteModalOpen: false,
    editContestId: 0,
    editContestName: '',
  });

  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({
    type: null,
    targetId: null,
  });

  const { data: contests, refetch: refetchContests } = useQuery({
    queryKey: ['contests'],
    queryFn: getAllContests,
    staleTime: 0,
  });

  const { data: currentTeams, refetch: refetchTeams } = useQuery({
    queryKey: ['teams', state.currentContestId],
    queryFn: async () => {
      return await getAllTeams(state.currentContestId);
    },
    enabled: state.currentContestId > 0,
  });

  const { data: sortStatus } = useQuery<SortOption>({
    queryKey: ['sortStatus'],
    queryFn: async () => {
      return await getSortStatus();
    },
  });

  const awardPatchSectionAvailable = sortStatus === 'CUSTOM';

  const toast = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (contests?.[0] && state.currentContestName === '불러오는 중...') {
      const firstContest = contests[0];
      setState((prev) => ({
        ...prev,
        currentContestName: firstContest.contestName,
        currentContestId: firstContest.contestId,
      }));
    }
  }, [contests, state.currentContestName]);

  useEffect(() => {
    if (currentTeams) {
      setState((prev) => ({ ...prev, contestTeams: currentTeams }));
    }
  }, [currentTeams]);

  const handleAddContest = async () => {
    const trimmedName = state.contestName.trim();
    if (!trimmedName) {
      toast('대회명이 비어있습니다.', 'error');
      return;
    }

    try {
      await postAllContests(trimmedName);
      console.log('대회 추가 후 캐시 무효화');
      await queryClient.invalidateQueries({ queryKey: ['contests'] });
      setState((prev) => ({ ...prev, contestName: '' }));
      toast('대회가 추가되었습니다.', 'success');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '대회 추가에 실패했습니다.';
      toast(errorMessage, 'error');
      setState((prev) => ({ ...prev, contestName: '' }));
    }
  };

  const handleContestChange = async (contestName: string, contestId: number) => {
    try {
      setState((prev) => ({
        ...prev,
        currentContestName: contestName,
        currentContestId: contestId,
      }));
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '팀 정보를 불러오는데 실패했습니다.';
      toast(errorMessage, 'error');
    }
  };

  const handleDeleteContest = async (contestId: number) => {
    try {
      const teams = await getAllTeams(contestId);
      if (teams.length > 0) {
        toast('팀이 남아있으면 삭제할 수 없습니다.', 'info');
        return;
      }
      await deleteContest(contestId);
      await queryClient.invalidateQueries({ queryKey: ['contests'] });
      toast('대회가 삭제되었습니다.', 'success');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '대회 삭제에 실패했습니다.';
      toast(errorMessage, 'error');
    }
  };

  const handleDeleteTeam = async (teamId: number) => {
    try {
      await deleteTeam(teamId);
      await queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast('팀이 삭제되었습니다.', 'success');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '팀 삭제에 실패했습니다.';
      toast(errorMessage, 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.type || !deleteModal.targetId) return;
    if (deleteModal.type === 'contest') {
      await handleDeleteContest(deleteModal.targetId);
    } else if (deleteModal.type === 'team') {
      await handleDeleteTeam(deleteModal.targetId);
    }
    setState((prev) => ({ ...prev, isDeleteModalOpen: false }));
    setDeleteModal({ type: null, targetId: null });
  };

  const openDeleteModal = (type: 'contest' | 'team', targetId: number) => {
    setState((prev) => ({ ...prev, isDeleteModalOpen: true }));
    setDeleteModal({ type, targetId });
  };

  const closeDeleteModal = () => {
    setState((prev) => ({ ...prev, isDeleteModalOpen: false }));
    setDeleteModal({ type: null, targetId: null });
  };

  const openEditModal = (contestId: number, contestName: string) =>
    setState((prev) => ({
      ...prev,
      isEditModalOpen: true,
      editContestId: contestId,
      editContestName: contestName,
    }));
  const closeEditModal = () => setState((prev) => ({ ...prev, isEditModalOpen: false }));

  return {
    state,
    contests,
    toast,
    handleAddContest,
    handleDeleteContest,
    handleContestChange,
    openDeleteModal,
    closeDeleteModal,
    openEditModal,
    closeEditModal,
    setContestName: (name: string) => setState((prev) => ({ ...prev, contestName: name })),
    deleteModal,
    handleDelete,
    awardPatchSectionAvailable,
    refetchTeams,
  };
};

export default useContestAdmin;
