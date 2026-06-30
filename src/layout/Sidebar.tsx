import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { ChevronDown, CircleDot, Folder, FolderOpen } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { ContestResponseDto, GroupedContestResponseDto } from '@dto/contestsDto';
import { cn } from '@utils/classname';
import { useQuery } from '@tanstack/react-query';
import { getGroupedContests } from '@apis/contest';
import { useContestId } from '@hooks/useId';
import { Tooltip, TooltipContent, TooltipTrigger } from '@components/ToolTip';

interface SidebarProps {
  variant?: 'desktop' | 'mobile';
}

const Sidebar = ({ variant = 'desktop' }: SidebarProps) => {
  const activeContestId = useContestId();
  const { data: groups = [], isLoading } = useQuery({ queryKey: ['groupedContests'], queryFn: getGroupedContests });
  const [expandedCategoryId, setExpandedCategoryId] = useState<number | null>(null);
  const currentCategoryId = useMemo(
    () => groups.find((group) => group.contests.some((contest) => contest.isCurrent))?.categoryId ?? null,
    [groups],
  );
  const activeCategoryId = useMemo(
    () =>
      Number.isInteger(activeContestId)
        ? (groups.find((group) => group.contests.some((contest) => contest.contestId === activeContestId))
            ?.categoryId ?? null)
        : null,
    [activeContestId, groups],
  );

  useEffect(() => {
    if (activeCategoryId !== null) {
      setExpandedCategoryId(activeCategoryId);
      return;
    }

    setExpandedCategoryId((prev) => prev ?? currentCategoryId ?? groups[0]?.categoryId ?? null);
  }, [activeCategoryId, currentCategoryId, groups]);

  const toggleCategory = (categoryId: number) => {
    setExpandedCategoryId((prev) => (prev === categoryId ? null : categoryId));
  };

  const containerClassName =
    variant === 'desktop' ? 'min-w-sidebar hidden bg-white lg:block' : 'h-full w-full bg-white';

  return (
    <aside className={containerClassName}>
      <nav className="flex flex-col gap-5 p-5 md:p-6" aria-label="대회 사이드바">
        <div className="flex items-center gap-3 px-4 py-2">
          <FolderOpen className="text-mainGreen size-5 shrink-0" />
          <h2 className="truncate text-base font-semibold text-neutral-950">대회 목록</h2>
        </div>

        <ul className="ml-3 flex flex-col gap-3">
          {isLoading ? (
            <SidebarSkeleton />
          ) : groups.length === 0 ? (
            <li className="text-midGray px-4 py-6 text-center text-sm">등록된 대회가 없어요.</li>
          ) : (
            groups.map((group) => (
              <CategoryGroup
                key={group.categoryId}
                category={group}
                isExpanded={expandedCategoryId === group.categoryId}
                isActive={activeCategoryId === group.categoryId}
                onToggle={() => toggleCategory(group.categoryId)}
              />
            ))
          )}
        </ul>
      </nav>
    </aside>
  );
};

interface CategoryGroupProps {
  category: GroupedContestResponseDto;
  isActive: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}

const CategoryGroup = ({ category, isActive, isExpanded, onToggle }: CategoryGroupProps) => (
  <li className="flex flex-col gap-2">
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'hover:text-mainGreen flex min-w-0 items-center gap-3 rounded-lg px-4 py-3 text-left text-base font-semibold transition-all',
        (isActive || isExpanded) && 'bg-subGreen text-mainGreen',
        !isActive && !isExpanded && 'hover:bg-whiteGray text-neutral-900',
      )}
      aria-expanded={isExpanded}
    >
      {isExpanded ? (
        <FolderOpen className="size-5 shrink-0" aria-hidden />
      ) : (
        <Folder className="size-5 shrink-0" aria-hidden />
      )}
      <SidebarTooltipText content={category.categoryName} className="min-w-0 flex-1 truncate">
        {category.categoryName}
      </SidebarTooltipText>
      <span
        className={cn(
          'shrink-0 rounded-full px-2 py-0.5 text-xs font-medium',
          isActive || isExpanded ? 'text-mainGreen bg-white/60' : 'bg-whiteGray text-midGray',
        )}
      >
        {category.contests.length}
      </span>
      <ChevronDown
        className={cn('size-4 shrink-0 transition-transform duration-200', isExpanded && 'rotate-180')}
        aria-hidden
      />
    </button>

    <ul
      className={cn(
        'border-mainGreen/30 ml-5 flex flex-col gap-2 overflow-hidden border-l pl-4 transition-all duration-200 ease-out',
        isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0',
      )}
    >
      <ContestList contests={category.contests} />
    </ul>
  </li>
);

interface ContestListProps {
  contests: Pick<ContestResponseDto, 'contestId' | 'contestName' | 'isCurrent'>[];
}

const ContestList = ({ contests }: ContestListProps) => {
  const baseStyle = 'group flex min-w-0 items-center gap-2 py-1 text-sm transition-all hover:text-mainGreen';
  const getLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(baseStyle, isActive ? 'font-semibold text-mainGreen' : 'text-neutral-700');
  return (
    <>
      {contests.map((contest) => (
        <li key={contest.contestId}>
          <NavLink to={`/contest/${contest.contestId}`} className={getLinkClass}>
            <CircleDot
              className={cn(
                'size-3 shrink-0',
                contest.isCurrent ? 'fill-mainGreen text-mainGreen' : 'text-lightGray group-hover:text-mainGreen',
              )}
              aria-hidden
            />
            <SidebarTooltipText content={contest.contestName} className="min-w-0 flex-1 truncate">
              {contest.contestName}
            </SidebarTooltipText>
          </NavLink>
        </li>
      ))}
    </>
  );
};

const SidebarTooltipText = ({
  content,
  className,
  children,
}: {
  content: string;
  className?: string;
  children: ReactNode;
}) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <span className={className}>{children}</span>
    </TooltipTrigger>
    <TooltipContent side="right" sideOffset={8} className="max-w-80 text-left leading-5 break-keep text-neutral-900">
      {content}
    </TooltipContent>
  </Tooltip>
);

const SidebarSkeleton = () => (
  <>
    {Array.from({ length: 4 }).map((_, index) => (
      <li key={index} className="rounded-lg px-4 py-3">
        <div className="h-5 w-32 animate-pulse rounded bg-neutral-200" />
      </li>
    ))}
  </>
);

export default Sidebar;
