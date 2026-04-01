import { useState, useEffect } from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useParams } from 'react-router-dom';
import Button from '@components/Button';
import useTeamList from 'hooks/useTeamList';
import { TeamListItemResponseDto } from 'types/DTO/teams/teamListDto';
import { PiDotsSixVerticalBold } from 'react-icons/pi';
import { cn } from 'utils/classname';
import Spinner from '@components/Spinner';
import { useMutation } from '@tanstack/react-query';
import { patchCustomSortTeam } from 'apis/team';
import queryClient from 'stores/queryClient';
import { PatchCustomOrderRequestDto } from 'types/DTO';
import { useToast } from 'hooks/useToast';
import useAuth from 'hooks/useAuth';
import AwardTag from '@components/AwardTag';

const CustomOrderSection = () => {
  const toast = useToast();
  const { user } = useAuth();
  const { contestId: contestIdParam } = useParams();
  const contestId = Number(contestIdParam);
  const { data: teamList, isLoading, error } = useTeamList(contestId);
  const [localTeams, setLocalTeams] = useState<TeamListItemResponseDto[]>([]);

  const customSortMutation = useMutation({
    mutationFn: ({ payload }: { payload: PatchCustomOrderRequestDto }) => patchCustomSortTeam(payload),
    onSuccess: () => {
      toast('정렬이 저장되었어요', 'success');
      queryClient.invalidateQueries({ queryKey: ['teams', contestId, user?.id ?? 'guest'] });
    },
    onError: () => toast('정렬 저장에 실패했어요'),
  });

  useEffect(() => {
    if (teamList) setLocalTeams([...teamList]);
  }, [teamList]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setLocalTeams((teams) => {
      const from = teams.findIndex((t) => t.teamId === active.id);
      const to = teams.findIndex((t) => t.teamId === over.id);
      return arrayMove(teams, from, to);
    });
  };

  const handleReset = () => {
    if (teamList) setLocalTeams([...teamList]);
  };

  const handleSave = () => {
    customSortMutation.mutate({
      payload: {
        contestId: contestId,
        teamOrders: localTeams.map((team, i) => ({ teamId: team.teamId, itemOrder: i + 1 })),
      },
    });
  };

  if (isLoading) return <Spinner />;
  if (error) return <span>팀 목록을 불러오지 못했습니다. 다시 시도해 주세요</span>;

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border p-4">
        <div className="mb-4 flex items-center gap-2">
          <h2 className="text-xl font-semibold">직접 설정</h2>
          <span className="text-midGray text-xs font-normal">팀명, 프로젝트명, 수상 정보</span>
        </div>

        <DndContext onDragEnd={handleDragEnd}>
          <SortableContext items={localTeams.map((t) => t.teamId)}>
            <div className="grid grid-cols-[max-content_max-content_max-content_150px_auto] gap-4">
              {localTeams.map((team, index) => (
                <>
                  <span key={`index-${team.teamId}`} className="flex items-center justify-center text-center">
                    {index + 1}
                  </span>
                  <TeamRow key={team.teamId} team={team} />
                </>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <div className="ml-auto flex gap-4">
        <Button onClick={handleReset} className="border-mainBlue text-mainBlue border text-[15px]">
          원래대로
        </Button>
        <Button onClick={handleSave} className="bg-mainBlue text-[15px] font-light">
          저장하기
        </Button>
      </div>
    </div>
  );
};

const TeamRow = ({ team }: { team: TeamListItemResponseDto }) => {
  const { teamName, projectName, awards } = team;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: team.teamId });
  const style = { transform: CSS.Transform.toString(transform), transition };

  // TODO: API 개발 완료 시 테스트 필요
  return (
    <>
      <span
        ref={setNodeRef}
        style={style}
        className={cn(
          'group hover:bg-whiteGray col-span-4 grid grid-cols-subgrid items-center gap-4 rounded-md p-3',
          isDragging ? 'cursor-grabbing' : 'cursor-grab',
        )}
        {...attributes}
        {...listeners}
      >
        <span className="break-all">{teamName}</span>
        <span className="break-all">{projectName}</span>
        {awards.length > 0 ? (
          awards.map((award) => (
            <AwardTag key={award.awardName} awardName={award.awardName ?? ''} awardColor={award.awardColor ?? ''} />
          ))
        ) : (
          <span />
        )}
        <PiDotsSixVerticalBold className="text-midGray ml-auto text-lg opacity-0 group-hover:opacity-100" />
      </span>
    </>
  );
};

export default CustomOrderSection;
