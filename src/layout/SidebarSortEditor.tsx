import { useEffect, useMemo, useRef, useState } from 'react';
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Check,
  ChevronDown,
  CircleDot,
  Folder,
  FolderOpen,
  GripVertical,
  LoaderCircle,
  RotateCcw,
  Settings2,
  X,
} from 'lucide-react';

import {
  getCategoryContestSort,
  getSidebarCategorySort,
  putCategoryContestCustomSort,
  putCategoryContestSort,
  putSidebarCategoryCustomSort,
  putSidebarCategorySort,
} from '@apis/contest';
import { Popover, PopoverContent, PopoverTrigger } from '@components/ui/popover';
import { GroupedContestResponseDto, SidebarSortMode } from '@dto/contestsDto';
import { useToast } from '@hooks/useToast';
import { cn } from '@utils/classname';
import { getApiErrorMessage } from '@utils/error';

type Tone = 'default' | 'editorial';

interface SidebarSortEditorProps {
  groups: GroupedContestResponseDto[];
  expandedCategoryId: number | null;
  onToggleCategory: (categoryId: number) => void;
  onCancel: () => void;
  onSaved: () => void;
  tone: Tone;
}

interface SidebarSortSettings {
  categoryMode: SidebarSortMode;
  contestModes: Record<number, SidebarSortMode>;
}

const SORT_OPTIONS: { mode: SidebarSortMode; label: string; description: string }[] = [
  { mode: 'ASC', label: '가나다순', description: '이름 오름차순' },
  { mode: 'DESC', label: '역순', description: '이름 내림차순' },
  { mode: 'CUSTOM', label: '직접 정렬', description: '끌어서 원하는 순서로' },
];

const collator = new Intl.Collator('ko', { numeric: true, sensitivity: 'base' });

const sortByName = <T,>(items: T[], getName: (item: T) => string, mode: 'ASC' | 'DESC') =>
  [...items].sort((a, b) => collator.compare(getName(a), getName(b)) * (mode === 'ASC' ? 1 : -1));

const SidebarSortEditor = ({
  groups,
  expandedCategoryId,
  onToggleCategory,
  onCancel,
  onSaved,
  tone,
}: SidebarSortEditorProps) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const initializedRef = useRef(false);
  const [localGroups, setLocalGroups] = useState(groups);
  const [categoryMode, setCategoryMode] = useState<SidebarSortMode | null>(null);
  const [contestModes, setContestModes] = useState<Record<number, SidebarSortMode>>({});
  const categoryIds = useMemo(() => groups.map((group) => group.categoryId), [groups]);
  const settingsQueryKey = useMemo(() => ['sidebarSortSettings', ...categoryIds] as const, [categoryIds]);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const settingsQuery = useQuery({
    queryKey: settingsQueryKey,
    queryFn: async (): Promise<SidebarSortSettings> => {
      const [nextCategoryMode, modeEntries] = await Promise.all([
        getSidebarCategorySort(),
        Promise.all(
          categoryIds.map(async (categoryId) => [categoryId, await getCategoryContestSort(categoryId)] as const),
        ),
      ]);

      return {
        categoryMode: nextCategoryMode,
        contestModes: Object.fromEntries(modeEntries),
      };
    },
    retry: 1,
  });

  useEffect(() => {
    if (!settingsQuery.data || initializedRef.current) return;

    initializedRef.current = true;
    setCategoryMode(settingsQuery.data.categoryMode);
    setContestModes(settingsQuery.data.contestModes);
    setLocalGroups(groups);
  }, [groups, settingsQuery.data]);

  const saveMutation = useMutation({
    mutationKey: ['saveSidebarSort'],
    mutationFn: async () => {
      if (!categoryMode) return;

      await Promise.all([
        putSidebarCategorySort(categoryMode),
        ...localGroups.map((group) =>
          putCategoryContestSort(group.categoryId, contestModes[group.categoryId] ?? 'ASC'),
        ),
      ]);

      await Promise.all([
        ...(categoryMode === 'CUSTOM'
          ? [
              putSidebarCategoryCustomSort(
                localGroups.map((group, index) => ({ categoryId: group.categoryId, itemOrder: index + 1 })),
              ),
            ]
          : []),
        ...localGroups
          .filter((group) => contestModes[group.categoryId] === 'CUSTOM')
          .map((group) =>
            putCategoryContestCustomSort(
              group.categoryId,
              group.contests.map((contest, index) => ({ contestId: contest.contestId, itemOrder: index + 1 })),
            ),
          ),
      ]);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['groupedContests'] }),
        queryClient.invalidateQueries({ queryKey: ['sidebarSortSettings'] }),
      ]);
      toast('사이드바 순서를 저장했어요.', 'success');
      onSaved();
    },
    onError: (error) => toast(getApiErrorMessage(error, '사이드바 순서를 저장하지 못했어요.'), 'error'),
  });

  const handleCategoryModeChange = (mode: SidebarSortMode) => {
    setCategoryMode(mode);
    if (mode !== 'CUSTOM') {
      setLocalGroups((current) => sortByName(current, (group) => group.categoryName, mode));
    }
  };

  const handleContestModeChange = (categoryId: number, mode: SidebarSortMode) => {
    setContestModes((current) => ({ ...current, [categoryId]: mode }));
    if (mode !== 'CUSTOM') {
      setLocalGroups((current) =>
        current.map((group) =>
          group.categoryId === categoryId
            ? { ...group, contests: sortByName(group.contests, (contest) => contest.contestName, mode) }
            : group,
        ),
      );
    }
    if (mode === 'CUSTOM' && expandedCategoryId !== categoryId) onToggleCategory(categoryId);
  };

  const handleCategoryDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;

    setLocalGroups((current) => {
      const from = current.findIndex((group) => `category-${group.categoryId}` === active.id);
      const to = current.findIndex((group) => `category-${group.categoryId}` === over.id);
      return from < 0 || to < 0 ? current : arrayMove(current, from, to);
    });
  };

  const handleContestDragEnd = (categoryId: number, { active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;

    setLocalGroups((current) =>
      current.map((group) => {
        if (group.categoryId !== categoryId) return group;
        const from = group.contests.findIndex((contest) => `contest-${contest.contestId}` === active.id);
        const to = group.contests.findIndex((contest) => `contest-${contest.contestId}` === over.id);
        return from < 0 || to < 0 ? group : { ...group, contests: arrayMove(group.contests, from, to) };
      }),
    );
  };

  const isReady = categoryMode !== null && !settingsQuery.isError;
  const hasChanges = useMemo(() => {
    if (!settingsQuery.data || !categoryMode) return false;
    if (categoryMode !== settingsQuery.data.categoryMode) return true;
    if (
      categoryIds.some(
        (categoryId) => (contestModes[categoryId] ?? 'ASC') !== (settingsQuery.data.contestModes[categoryId] ?? 'ASC'),
      )
    ) {
      return true;
    }

    return localGroups.some((group, groupIndex) => {
      const originalGroup = groups[groupIndex];
      if (originalGroup?.categoryId !== group.categoryId) return true;
      return group.contests.some(
        (contest, contestIndex) => originalGroup.contests[contestIndex]?.contestId !== contest.contestId,
      );
    });
  }, [categoryIds, categoryMode, contestModes, groups, localGroups, settingsQuery.data]);

  return (
    <div className="flex flex-col gap-3" aria-label="사이드바 순서 편집">
      <section
        className={cn(
          'rounded-xl border p-3',
          tone === 'editorial' ? 'border-white/15 bg-white/5' : 'border-mainGreen/20 bg-subGreen/45',
        )}
      >
        <div className="mb-3 flex items-start justify-between gap-2">
          <div>
            <h3 className={cn('text-sm font-semibold', tone === 'editorial' ? 'text-white' : 'text-neutral-950')}>
              목록 순서 편집
            </h3>
            <p className={cn('mt-0.5 text-[11px]', tone === 'editorial' ? 'text-white/55' : 'text-neutral-500')}>
              저장 전에는 방문자에게 반영되지 않아요.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={onCancel}
              disabled={saveMutation.isPending}
              className={cn(
                'inline-flex size-8 items-center justify-center rounded-lg transition-colors disabled:opacity-50',
                tone === 'editorial' ? 'text-white/70 hover:bg-white/10' : 'text-neutral-500 hover:bg-white',
              )}
              aria-label="정렬 편집 취소"
            >
              <X className="size-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => saveMutation.mutate()}
              disabled={!isReady || !hasChanges || saveMutation.isPending}
              className={cn(
                'inline-flex h-8 items-center gap-1 rounded-lg px-2.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50',
                tone === 'editorial'
                  ? 'bg-[#bed925] text-[#06172f] hover:bg-[#cde83a]'
                  : 'bg-mainGreen text-white hover:bg-green-700',
              )}
            >
              {saveMutation.isPending ? (
                <LoaderCircle className="size-3.5 animate-spin" aria-hidden />
              ) : (
                <Check className="size-3.5" aria-hidden />
              )}
              저장
            </button>
          </div>
        </div>

        {settingsQuery.isLoading ? (
          <div
            className={cn(
              'flex h-16 items-center justify-center gap-2 text-xs',
              tone === 'editorial' ? 'text-white/60' : 'text-neutral-500',
            )}
          >
            <LoaderCircle className="size-4 animate-spin" aria-hidden />
            정렬 설정을 불러오는 중
          </div>
        ) : settingsQuery.isError ? (
          <div className="flex h-16 flex-col items-center justify-center gap-2 text-center">
            <p className={cn('text-xs', tone === 'editorial' ? 'text-white/65' : 'text-neutral-600')}>
              정렬 설정을 불러오지 못했어요.
            </p>
            <button
              type="button"
              onClick={() => settingsQuery.refetch()}
              className={cn(
                'inline-flex items-center gap-1 text-xs font-semibold underline underline-offset-2',
                tone === 'editorial' ? 'text-[#45d6ec]' : 'text-mainGreen',
              )}
            >
              <RotateCcw className="size-3" aria-hidden />
              다시 시도
            </button>
          </div>
        ) : (
          <SortModePicker value={categoryMode ?? 'ASC'} onChange={handleCategoryModeChange} tone={tone} />
        )}
      </section>

      {isReady && (
        <>
          {categoryMode === 'CUSTOM' && (
            <p className={cn('px-1 text-[11px]', tone === 'editorial' ? 'text-white/55' : 'text-neutral-500')}>
              <GripVertical className="mr-1 inline size-3" aria-hidden />
              손잡이를 끌거나 키보드로 순서를 바꿀 수 있어요.
            </p>
          )}
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleCategoryDragEnd}>
            <SortableContext
              items={localGroups.map((group) => `category-${group.categoryId}`)}
              strategy={verticalListSortingStrategy}
            >
              <ul className="flex flex-col gap-2">
                {localGroups.map((group, index) => (
                  <SortableCategory
                    key={group.categoryId}
                    category={group}
                    position={index + 1}
                    categoryMode={categoryMode}
                    contestMode={contestModes[group.categoryId] ?? 'ASC'}
                    isExpanded={expandedCategoryId === group.categoryId}
                    onToggle={() => onToggleCategory(group.categoryId)}
                    onContestModeChange={(mode) => handleContestModeChange(group.categoryId, mode)}
                    onContestDragEnd={(event) => handleContestDragEnd(group.categoryId, event)}
                    sensors={sensors}
                    tone={tone}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        </>
      )}
    </div>
  );
};

const SortModePicker = ({
  value,
  onChange,
  tone,
  compact = false,
}: {
  value: SidebarSortMode;
  onChange: (mode: SidebarSortMode) => void;
  tone: Tone;
  compact?: boolean;
}) => (
  <div className="grid grid-cols-3 gap-1" role="group" aria-label="정렬 방식">
    {SORT_OPTIONS.map((option) => (
      <button
        key={option.mode}
        type="button"
        onClick={() => onChange(option.mode)}
        className={cn(
          'rounded-lg border px-1.5 text-center font-medium transition-colors',
          compact ? 'min-h-9 text-[11px]' : 'min-h-11 text-xs',
          tone === 'editorial' && value === option.mode && 'border-[#45d6ec]/60 bg-[#102d54] text-white',
          tone === 'editorial' && value !== option.mode && 'border-white/10 text-white/60 hover:bg-white/5',
          tone === 'default' && value === option.mode && 'border-mainGreen text-mainGreen bg-white shadow-sm',
          tone === 'default' && value !== option.mode && 'border-transparent text-neutral-500 hover:bg-white/70',
        )}
        aria-pressed={value === option.mode}
        title={option.description}
      >
        {option.label}
      </button>
    ))}
  </div>
);

type DndSensors = ReturnType<typeof useSensors>;

const SortableCategory = ({
  category,
  position,
  categoryMode,
  contestMode,
  isExpanded,
  onToggle,
  onContestModeChange,
  onContestDragEnd,
  sensors,
  tone,
}: {
  category: GroupedContestResponseDto;
  position: number;
  categoryMode: SidebarSortMode;
  contestMode: SidebarSortMode;
  isExpanded: boolean;
  onToggle: () => void;
  onContestModeChange: (mode: SidebarSortMode) => void;
  onContestDragEnd: (event: DragEndEvent) => void;
  sensors: DndSensors;
  tone: Tone;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `category-${category.categoryId}`,
    disabled: categoryMode !== 'CUSTOM',
  });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative flex flex-col gap-1.5 rounded-xl border p-1.5 transition-shadow',
        tone === 'editorial' ? 'border-white/10 bg-white/[0.03]' : 'border-neutral-200 bg-white',
        isDragging && 'z-20 opacity-90 shadow-xl',
      )}
    >
      <div className="flex min-w-0 items-center gap-1">
        {categoryMode === 'CUSTOM' ? (
          <button
            type="button"
            className={cn(
              'flex size-8 shrink-0 touch-none items-center justify-center rounded-lg transition-colors',
              tone === 'editorial'
                ? 'text-white/40 hover:bg-white/10 hover:text-white'
                : 'text-neutral-400 hover:bg-neutral-100',
            )}
            aria-label={`${position}번째 ${category.categoryName} 카테고리 순서 이동`}
            {...attributes}
            {...listeners}
          >
            <GripVertical className="size-4" aria-hidden />
          </button>
        ) : (
          <span
            className={cn(
              'flex size-8 shrink-0 items-center justify-center text-xs font-semibold',
              tone === 'editorial' ? 'text-white/35' : 'text-neutral-400',
            )}
            aria-hidden
          >
            {position}
          </span>
        )}

        <button
          type="button"
          onClick={onToggle}
          className={cn(
            'flex min-w-0 flex-1 items-center gap-2 rounded-lg py-2 pr-1 text-left text-sm font-semibold transition-colors',
            tone === 'editorial' ? 'text-white hover:bg-white/5' : 'text-neutral-900 hover:bg-neutral-50',
          )}
          aria-expanded={isExpanded}
        >
          {isExpanded ? (
            <FolderOpen className={cn('size-4 shrink-0', tone === 'editorial' ? 'text-[#45d6ec]' : 'text-mainGreen')} />
          ) : (
            <Folder className={cn('size-4 shrink-0', tone === 'editorial' ? 'text-[#45d6ec]' : 'text-mainGreen')} />
          )}
          <span className="min-w-0 flex-1 truncate">{category.categoryName}</span>
          <ChevronDown
            className={cn('size-3.5 shrink-0 transition-transform', isExpanded && 'rotate-180')}
            aria-hidden
          />
        </button>

        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(
                'relative flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors',
                tone === 'editorial'
                  ? 'text-white/55 hover:bg-white/10 hover:text-white'
                  : 'hover:text-mainGreen text-neutral-500 hover:bg-neutral-100',
              )}
              aria-label={`${category.categoryName} 대회 정렬 설정`}
            >
              <Settings2 className="size-4" aria-hidden />
              {contestMode === 'CUSTOM' && (
                <span
                  className={cn(
                    'absolute top-1 right-1 size-1.5 rounded-full',
                    tone === 'editorial' ? 'bg-[#bed925]' : 'bg-mainGreen',
                  )}
                />
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent side="right" align="start" sideOffset={8} className="w-60 p-3 text-neutral-950">
            <div className="mb-3">
              <p className="text-sm font-semibold">대회 순서</p>
              <p className="mt-0.5 text-xs text-neutral-500">{category.categoryName} 안에서 적용돼요.</p>
            </div>
            <SortModePicker value={contestMode} onChange={onContestModeChange} tone="default" compact />
            {contestMode === 'CUSTOM' && (
              <p className="mt-2 text-[11px] leading-4 text-neutral-500">
                폴더를 펼친 뒤 대회를 끌어 순서를 바꿔주세요.
              </p>
            )}
          </PopoverContent>
        </Popover>
      </div>

      <ul
        className={cn(
          'flex flex-col overflow-hidden border-l transition-all duration-200',
          tone === 'editorial' ? 'ml-8 border-[#45d6ec]/30 pl-2' : 'border-mainGreen/25 ml-8 pl-2',
          isExpanded ? 'max-h-96 pb-1 opacity-100' : 'max-h-0 opacity-0',
        )}
      >
        {category.contests.length === 0 ? (
          <li className={cn('px-2 py-2 text-xs', tone === 'editorial' ? 'text-white/40' : 'text-neutral-400')}>
            등록된 대회가 없어요.
          </li>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onContestDragEnd}>
            <SortableContext
              items={category.contests.map((contest) => `contest-${contest.contestId}`)}
              strategy={verticalListSortingStrategy}
            >
              {category.contests.map((contest, index) => (
                <SortableContest
                  key={contest.contestId}
                  contest={contest}
                  position={index + 1}
                  disabled={contestMode !== 'CUSTOM'}
                  tone={tone}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </ul>
    </li>
  );
};

const SortableContest = ({
  contest,
  position,
  disabled,
  tone,
}: {
  contest: GroupedContestResponseDto['contests'][number];
  position: number;
  disabled: boolean;
  tone: Tone;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `contest-${contest.contestId}`,
    disabled,
  });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex min-w-0 items-center gap-1 rounded-lg py-1 pr-1 text-sm',
        tone === 'editorial' ? 'text-white/70' : 'text-neutral-700',
        isDragging && (tone === 'editorial' ? 'z-20 bg-[#102d54] shadow-lg' : 'z-20 bg-white shadow-lg'),
      )}
    >
      {disabled ? (
        <span className="flex size-7 shrink-0 items-center justify-center text-[10px] opacity-50" aria-hidden>
          {position}
        </span>
      ) : (
        <button
          type="button"
          className={cn(
            'flex size-7 shrink-0 touch-none items-center justify-center rounded-md transition-colors',
            tone === 'editorial'
              ? 'text-white/35 hover:bg-white/10 hover:text-white'
              : 'text-neutral-400 hover:bg-neutral-100',
          )}
          aria-label={`${position}번째 ${contest.contestName} 대회 순서 이동`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-3.5" aria-hidden />
        </button>
      )}
      <CircleDot
        className={cn(
          'size-2.5 shrink-0',
          contest.isCurrent &&
            (tone === 'editorial' ? 'fill-[#bed925] text-[#bed925]' : 'fill-mainGreen text-mainGreen'),
          !contest.isCurrent && (tone === 'editorial' ? 'text-white/25' : 'text-lightGray'),
        )}
        aria-hidden
      />
      <span className="min-w-0 flex-1 truncate">{contest.contestName}</span>
    </li>
  );
};

export default SidebarSortEditor;
