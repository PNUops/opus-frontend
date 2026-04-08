import { useState, useEffect, Fragment } from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { PiDotsSixVerticalBold } from 'react-icons/pi';
import { AdminActionButton } from '@components/admin';
import AwardTag from '@components/AwardTag';
import { cn } from 'utils/classname';
import { TeamListItemResponseDto } from 'types/DTO/teams/teamListDto';
import queryClient from 'stores/queryClient';
import { useToast } from 'hooks/useToast';
import { TeamCustomSortData } from 'types/DTO';
import { contestTeamOption } from 'queries/contest';
import { putTeamCustomSort } from 'apis/contest';
import { useContestIdOrRedirect } from 'hooks/useId';

const CustomOrderSection = () => {
  const contestId = useContestIdOrRedirect();
  const [localTeams, setLocalTeams] = useState<TeamListItemResponseDto[]>([]);
  const toast = useToast();

  const { data: teamList } = useSuspenseQuery(contestTeamOption(contestId));
  const customSortMutation = useMutation({
    mutationKey: ['saveCustomSort'],
    mutationFn: (payload: TeamCustomSortData[]) => putTeamCustomSort(contestId, payload),
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
    customSortMutation.mutate(
      localTeams.map((team, i) => ({ teamId: team.teamId, itemOrder: i + 1 })),
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['teams'] });
          toast('정렬이 저장되었어요', 'success');
        },
        onError: () => toast('정렬 저장에 실패했어요'),
      },
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border-2 px-5 py-4">
        <div className="mb-4 flex items-center gap-3">
          <h2 className="text-xl font-semibold">직접 설정</h2>
          <span className="text-midGray text-xs font-normal">팀명, 프로젝트명, 수상 정보</span>
        </div>
        <DndContext onDragEnd={handleDragEnd}>
          <SortableContext items={localTeams.map((t) => t.teamId)}>
            <div className="grid grid-cols-[max-content_max-content_max-content_150px_auto] gap-4">
              {localTeams.map((team, index) => (
                <Fragment key={team.teamId}>
                  <span className="flex items-center justify-center text-center">{index + 1}</span>
                  <TeamRow team={team} />
                </Fragment>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
      <div className="ml-auto flex gap-4">
        <AdminActionButton onClick={handleReset} variant="outline">
          원래대로
        </AdminActionButton>
        <AdminActionButton onClick={handleSave}>저장하기</AdminActionButton>
      </div>
    </div>
  );
};

const TeamRow = ({ team }: { team: TeamListItemResponseDto }) => {
  const { teamName, projectName, awards } = team;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: team.teamId });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <span
      ref={setNodeRef}
      style={style}
      className={cn(
        'group hover:bg-whiteGray col-span-4 grid grid-cols-subgrid items-center gap-10 rounded-md p-3',
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
  );
};

export default CustomOrderSection;
