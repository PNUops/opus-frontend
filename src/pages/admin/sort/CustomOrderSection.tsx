import { useState, useEffect, Fragment } from 'react';
import { DndContext, DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { PiDotsSixVerticalBold } from 'react-icons/pi';
import { AdminActionButton } from '@components/admin';
import AwardTag from '@components/AwardTag';
import { cn } from '@utils/classname';
import { TeamListItemResponseDto } from '@dto/teams/teamListDto';
import queryClient from '@stores/queryClient';
import { useToast } from '@hooks/useToast';
import { TeamCustomSortData } from '@dto/contestsDto';
import { contestTeamOption } from '@queries/contest';
import { putTeamCustomSort } from '@apis/contest';
import { useContestIdOrRedirect } from '@hooks/useId';

const CustomOrderSection = () => {
  const contestId = useContestIdOrRedirect();
  const [localTeams, setLocalTeams] = useState<TeamListItemResponseDto[]>([]);
  const toast = useToast();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

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
          <span className="text-xs font-normal text-neutral-600">팀명, 프로젝트명, 수상 정보</span>
        </div>
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <SortableContext items={localTeams.map((t) => t.teamId)}>
            <div className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-2 gap-y-3 lg:grid-cols-[max-content_minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)_auto] lg:gap-4">
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
        <AdminActionButton onClick={handleReset} variant="outline" className="max-lg:min-h-11">
          원래대로
        </AdminActionButton>
        <AdminActionButton onClick={handleSave} className="max-lg:min-h-11">
          저장하기
        </AdminActionButton>
      </div>
    </div>
  );
};

const TeamRow = ({ team }: { team: TeamListItemResponseDto }) => {
  const { teamName, projectName, awards } = team;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: team.teamId });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group hover:bg-whiteGray grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 rounded-md p-3 lg:col-span-4 lg:grid-cols-subgrid lg:gap-4',
        isDragging && 'bg-whiteGray',
      )}
    >
      <span className="min-w-0 break-words">{teamName}</span>
      <span className="col-start-1 min-w-0 text-sm break-words text-neutral-600 lg:col-start-auto">{projectName}</span>
      <div className="col-start-1 flex min-w-0 flex-wrap gap-2 lg:col-start-auto">
        {awards.map((award) => (
          <AwardTag key={award.awardName} awardName={award.awardName ?? ''} awardColor={award.awardColor ?? ''} />
        ))}
      </div>
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label={`${teamName} 순서 변경`}
        className="focus-visible:outline-mainBlue col-start-2 row-start-1 row-end-4 flex size-11 touch-none items-center justify-center rounded-md text-neutral-600 hover:bg-neutral-100 focus-visible:outline-2 lg:col-start-auto lg:row-auto"
      >
        <PiDotsSixVerticalBold className="text-lg" aria-hidden />
      </button>
    </div>
  );
};

export default CustomOrderSection;
