import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { ChevronDown, CircleDot, Folder, FolderOpen, MessageSquareShare } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { ContestResponseDto, GroupedContestResponseDto } from '@dto/contestsDto';
import { cn } from '@utils/classname';
import { useQuery } from '@tanstack/react-query';
import { getGroupedContests } from '@apis/contest';
import { useContestId } from '@hooks/useId';
import { Tooltip, TooltipContent, TooltipTrigger } from '@components/ToolTip';
import { EXTERNAL_LINKS } from '@constants/external-links';

interface SidebarProps {
  variant?: 'desktop' | 'mobile';
  tone?: 'default' | 'editorial';
}

const Sidebar = ({ variant = 'desktop', tone = 'default' }: SidebarProps) => {
  const isEditorial = tone === 'editorial';
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

  const containerClassName = cn(
    variant === 'desktop' ? 'hidden w-[280px] min-w-[280px] shrink-0 lg:block' : 'h-full w-full',
    isEditorial ? 'border-r border-white/35 bg-[#06172f] text-[#f8f6f0]' : 'bg-white',
  );

  return (
    <aside className={containerClassName}>
      <nav className={cn('flex flex-col gap-5', isEditorial ? 'p-5' : 'p-5 md:p-6')} aria-label="대회 사이드바">
        <div className="flex items-center gap-3 px-4 py-2">
          <FolderOpen className={cn('size-5 shrink-0', isEditorial ? 'text-[#45d6ec]' : 'text-mainGreen')} />
          <h2 className={cn('truncate text-base font-semibold', isEditorial ? 'text-[#f8f6f0]' : 'text-neutral-950')}>
            대회 목록
          </h2>
        </div>

        <ul className={cn('flex flex-col gap-3', isEditorial ? 'ml-0' : 'ml-3')}>
          {isLoading ? (
            <SidebarSkeleton tone={tone} />
          ) : groups.length === 0 ? (
            <li className={cn('px-4 py-6 text-center text-sm', isEditorial ? 'text-white/55' : 'text-midGray')}>
              등록된 대회가 없어요.
            </li>
          ) : (
            groups.map((group) => (
              <CategoryGroup
                key={group.categoryId}
                category={group}
                isExpanded={expandedCategoryId === group.categoryId}
                isActive={activeCategoryId === group.categoryId}
                onToggle={() => toggleCategory(group.categoryId)}
                tone={tone}
              />
            ))
          )}
        </ul>

        <div className={cn('border-t pt-4', isEditorial ? 'border-white/20' : 'border-lightGray')}>
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href={EXTERNAL_LINKS.FEEDBACK}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition-colors',
                  isEditorial
                    ? 'text-white/75 hover:bg-white/5 hover:text-white'
                    : 'hover:bg-whiteGray hover:text-mainGreen text-neutral-700',
                )}
              >
                <MessageSquareShare
                  className={cn('size-5 shrink-0', isEditorial ? 'text-[#45d6ec]' : 'text-mainGreen')}
                  aria-hidden
                />
                <span>의견 보내기</span>
              </a>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              sideOffset={8}
              className="max-w-64 text-left leading-5 break-keep text-neutral-900"
            >
              OPUS 사용 중 발견한 문제나 개선 의견을 남겨주세요.
            </TooltipContent>
          </Tooltip>
        </div>
      </nav>
    </aside>
  );
};

interface CategoryGroupProps {
  category: GroupedContestResponseDto;
  isActive: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  tone: 'default' | 'editorial';
}

const CategoryGroup = ({ category, isActive, isExpanded, onToggle, tone }: CategoryGroupProps) => (
  <li className="flex flex-col gap-2">
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'flex min-w-0 items-center gap-3 rounded-lg px-4 py-3 text-left text-base font-semibold transition-all',
        tone === 'editorial' && 'gap-2 px-3 text-sm',
        tone === 'editorial' && (isActive || isExpanded) && 'bg-[#102d54] text-white',
        tone === 'editorial' && !isActive && !isExpanded && 'text-white/75 hover:bg-white/5 hover:text-white',
        tone === 'default' && (isActive || isExpanded) && 'bg-subGreen text-mainGreen',
        tone === 'default' && !isActive && !isExpanded && 'hover:bg-whiteGray hover:text-mainGreen text-neutral-900',
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
          tone === 'editorial' && 'hidden',
          tone === 'editorial' && (isActive || isExpanded) && 'bg-[#bed925] text-[#06172f]',
          tone === 'editorial' && !isActive && !isExpanded && 'bg-white/10 text-white/60',
          tone === 'default' && (isActive || isExpanded) && 'text-mainGreen bg-white/60',
          tone === 'default' && !isActive && !isExpanded && 'bg-whiteGray text-midGray',
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
        'ml-5 flex flex-col gap-2 overflow-hidden border-l pl-4 transition-all duration-200 ease-out',
        tone === 'editorial' ? 'border-[#45d6ec]/35' : 'border-mainGreen/30',
        isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0',
      )}
    >
      <ContestList contests={category.contests} tone={tone} />
    </ul>
  </li>
);

interface ContestListProps {
  contests: Pick<ContestResponseDto, 'contestId' | 'contestName' | 'isCurrent'>[];
  tone: 'default' | 'editorial';
}

const ContestList = ({ contests, tone }: ContestListProps) => {
  const baseStyle = cn(
    'group flex min-w-0 items-center gap-2 py-1 text-sm transition-all',
    tone === 'editorial' ? 'hover:text-[#45d6ec]' : 'hover:text-mainGreen',
  );
  const getLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      baseStyle,
      tone === 'editorial' && (isActive ? 'font-semibold text-white' : 'text-white/65'),
      tone === 'default' && (isActive ? 'font-semibold text-mainGreen' : 'text-neutral-700'),
    );
  return (
    <>
      {contests.map((contest) => (
        <li key={contest.contestId}>
          <NavLink to={`/contest/${contest.contestId}`} className={getLinkClass}>
            <CircleDot
              className={cn(
                'size-3 shrink-0',
                tone === 'editorial' && contest.isCurrent && 'fill-[#bed925] text-[#bed925]',
                tone === 'editorial' && !contest.isCurrent && 'text-white/25 group-hover:text-[#45d6ec]',
                tone === 'default' && contest.isCurrent && 'fill-mainGreen text-mainGreen',
                tone === 'default' && !contest.isCurrent && 'text-lightGray group-hover:text-mainGreen',
              )}
              aria-hidden
            />
            <SidebarTooltipText
              content={contest.contestName}
              className={cn(
                'min-w-0 flex-1',
                tone === 'editorial' ? 'leading-5 break-keep whitespace-normal' : 'truncate',
              )}
            >
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

const SidebarSkeleton = ({ tone }: { tone: 'default' | 'editorial' }) => (
  <>
    {Array.from({ length: 4 }).map((_, index) => (
      <li key={index} className="rounded-lg px-4 py-3">
        <div
          className={cn('h-5 w-32 animate-pulse rounded', tone === 'editorial' ? 'bg-white/10' : 'bg-neutral-200')}
        />
      </li>
    ))}
  </>
);

export default Sidebar;
