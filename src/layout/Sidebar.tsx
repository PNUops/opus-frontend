import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, CircleDot, FolderOpen } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { ContestResponseDto, GroupedContestResponseDto } from '@dto/contestsDto';
import { cn } from '@utils/classname';
import { useQuery } from '@tanstack/react-query';
import { getGroupedContests } from '@apis/contest';

interface SidebarProps {
  variant?: 'desktop' | 'mobile';
}

const Sidebar = ({ variant = 'desktop' }: SidebarProps) => {
  const { pathname } = useLocation();
  const { data: groups = [], isLoading } = useQuery({ queryKey: ['groupedContests'], queryFn: getGroupedContests });
  const [expandedCategoryId, setExpandedCategoryId] = useState<number | null>(null);
  const activeContestId = Number(pathname.match(/^\/contest\/(\d+)/)?.[1]);
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
    variant === 'desktop' ? ' min-w-sidebar hidden  bg-white lg:block' : 'h-full w-full bg-white';

  return (
    <aside className={containerClassName}>
      <nav className="flex flex-col gap-4 px-4 py-5" aria-label="대회 사이드바">
        <div className="flex flex-col gap-2">
          {isLoading ? (
            <SidebarSkeleton />
          ) : groups.length === 0 ? (
            <div className="border-lightGray text-midGray rounded-lg border bg-white px-4 py-6 text-center text-sm">
              등록된 대회가 없어요.
            </div>
          ) : (
            groups.map((group) => (
              <CategoryGroup
                key={group.categoryId}
                category={group}
                isExpanded={expandedCategoryId === group.categoryId}
                onToggle={() => toggleCategory(group.categoryId)}
              />
            ))
          )}
        </div>
      </nav>
    </aside>
  );
};

interface CategoryGroupProps {
  category: GroupedContestResponseDto;
  isExpanded: boolean;
  onToggle: () => void;
}

const CategoryGroup = ({ category, isExpanded, onToggle }: CategoryGroupProps) => (
  <section
    className={cn(
      'border-lightGray overflow-hidden rounded-lg border bg-white transition-colors',
      isExpanded && 'border-mainGreen/40 bg-green-50/30',
    )}
  >
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors',
        isExpanded ? 'text-mainGreen' : 'hover:bg-whiteGray text-neutral-800',
      )}
      aria-expanded={isExpanded}
    >
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate text-sm font-bold">{category.categoryName}</span>
        <span className={cn('text-xs', isExpanded ? 'text-mainGreen/70' : 'text-midGray')}>
          {category.contests.length}개 대회
        </span>
      </span>
      <ChevronDown
        className={cn('size-4 shrink-0 transition-transform duration-200', isExpanded && 'rotate-180')}
        aria-hidden
      />
    </button>

    <div
      className={cn(
        'grid transition-[grid-template-rows,opacity] duration-200 ease-out',
        isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
      )}
    >
      <div className="min-h-0 overflow-hidden">
        <ContestList contests={category.contests} />
      </div>
    </div>
  </section>
);

interface ContestListProps {
  contests: Pick<ContestResponseDto, 'contestId' | 'contestName' | 'isCurrent'>[];
}

const ContestList = ({ contests }: ContestListProps) => {
  const baseStyle = 'group flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left transition-colors';
  const getLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      baseStyle,
      isActive
        ? 'bg-subGreen text-mainGreen font-semibold'
        : 'text-neutral-700 hover:bg-whiteGray hover:text-mainGreen',
    );
  return (
    <div className="border-lightGray flex flex-col gap-1 border-t bg-white px-2 py-2">
      {contests.map((contest) => (
        <NavLink key={contest.contestId} to={`/contest/${contest.contestId}`} className={getLinkClass}>
          <CircleDot
            className={cn(
              'size-3 shrink-0',
              contest.isCurrent ? 'text-mainGreen fill-mainGreen' : 'text-lightGray group-hover:text-mainGreen',
            )}
            aria-hidden
          />
          <span className="min-w-0 flex-1 truncate text-sm">{contest.contestName}</span>
        </NavLink>
      ))}
    </div>
  );
};

const SidebarSkeleton = () => (
  <div className="flex flex-col gap-2">
    {Array.from({ length: 4 }).map((_, index) => (
      <div key={index} className="border-lightGray rounded-lg border bg-white px-4 py-3">
        <div className="h-4 w-28 animate-pulse rounded bg-neutral-200" />
        <div className="mt-2 h-3 w-14 animate-pulse rounded bg-neutral-100" />
      </div>
    ))}
  </div>
);

export default Sidebar;
