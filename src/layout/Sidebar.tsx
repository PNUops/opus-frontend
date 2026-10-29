import { type ReactElement, type ReactNode, useEffect, useId, useMemo, useRef, useState } from 'react';
import { ChevronDown, ListRestart, MessageSquareShare } from 'lucide-react';
import { NavLink, useMatch } from 'react-router-dom';
import { GroupedContestResponseDto } from '@dto/contestsDto';
import { cn } from '@utils/classname';
import { useQuery } from '@tanstack/react-query';
import { getGroupedContests } from '@apis/contest';
import { Tooltip, TooltipContent, TooltipTrigger } from '@components/ToolTip';
import { EXTERNAL_LINKS } from '@constants/external-links';
import useAuth from '@hooks/useAuth';
import SidebarSortEditor from '@layout/SidebarSortEditor';

type Tone = 'default' | 'editorial';
const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2';

interface SidebarProps {
  variant?: 'desktop' | 'mobile';
  tone?: Tone;
  footer?: ReactNode;
  onNavigate?: () => void;
}

const FullName = ({ name, children }: { name: string; children: ReactElement }) => (
  <Tooltip>
    <TooltipTrigger asChild>{children}</TooltipTrigger>
    <TooltipContent
      side="right"
      sideOffset={8}
      collisionPadding={16}
      className="max-w-[min(320px,calc(100vw-32px))] text-left leading-6 break-words text-neutral-900"
    >
      {name}
    </TooltipContent>
  </Tooltip>
);

const Sidebar = ({ variant = 'desktop', tone = 'default', footer, onNavigate }: SidebarProps) => {
  const isEditorial = tone === 'editorial';
  const { isAdmin } = useAuth();
  const contestRoute = useMatch('/contest/:contestId/*');
  const activeContestId = contestRoute ? Number(contestRoute.params.contestId) : null;
  const query = useQuery({ queryKey: ['groupedContests'], queryFn: getGroupedContests });
  const groups = query.data ?? [];
  const [expanded, setExpanded] = useState<number | null | undefined>();
  const [isSorting, setIsSorting] = useState(false);
  const sortButtonRef = useRef<HTMLButtonElement>(null);
  const closeSortEditor = () => {
    setIsSorting(false);
    requestAnimationFrame(() => sortButtonRef.current?.focus({ preventScroll: true }));
  };
  const activeCategoryId = useMemo(
    () => groups.find((group) => group.contests.some((contest) => contest.contestId === activeContestId))?.categoryId,
    [activeContestId, groups],
  );
  const defaultCategoryId =
    activeCategoryId ??
    groups.find((group) => group.contests.some((contest) => contest.isCurrent))?.categoryId ??
    groups[0]?.categoryId ??
    null;
  const expandedCategoryId = expanded === undefined ? defaultCategoryId : expanded;

  useEffect(() => setExpanded(undefined), [activeCategoryId]);
  const toggleCategory = (id: number) => setExpanded(expandedCategoryId === id ? null : id);
  const controlClass = cn(
    focusClass,
    isEditorial ? 'focus-visible:outline-[#45d6ec]' : 'focus-visible:outline-mainBlue',
  );

  return (
    <nav
      aria-label="대회 사이드바"
      className={cn('flex h-full min-h-0 flex-col text-sm', isEditorial ? 'text-[#f8f6f0]' : 'text-neutral-900')}
    >
      <div
        className={cn(
          'flex shrink-0 items-center justify-between gap-2 px-5',
          variant === 'desktop' ? 'pt-5 pb-3' : 'pb-2',
        )}
      >
        {variant === 'desktop' ? (
          <h2 className="py-3 text-base font-medium">대회 목록</h2>
        ) : (
          <span className="sr-only">카테고리별 대회 탐색</span>
        )}
        {isAdmin && !isSorting && !query.isPending && groups.length > 0 && (
          <button
            type="button"
            onClick={() => setIsSorting(true)}
            ref={sortButtonRef}
            className={cn(
              'ml-auto flex min-h-11 items-center gap-1.5 rounded-md px-2 text-xs',
              controlClass,
              isEditorial ? 'text-white/70 hover:bg-white/5' : 'hover:bg-whiteGray text-neutral-600',
            )}
          >
            <ListRestart size={16} aria-hidden /> 정렬
          </button>
        )}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-4">
        {query.isError && (
          <div role="alert" className="px-2 py-4 text-sm leading-6">
            <p>{query.data ? '목록을 새로 불러오지 못했어요.' : '대회 목록을 불러오지 못했어요.'}</p>
            <button
              type="button"
              onClick={() => void query.refetch()}
              disabled={query.isFetching}
              className={cn('min-h-11 underline underline-offset-4 disabled:opacity-50', controlClass)}
            >
              다시 시도
            </button>
          </div>
        )}
        {isSorting && isAdmin ? (
          <SidebarSortEditor
            groups={groups}
            expandedCategoryId={expandedCategoryId}
            onToggleCategory={toggleCategory}
            onCancel={closeSortEditor}
            onSaved={closeSortEditor}
            tone={tone}
          />
        ) : query.isPending ? (
          <div role="status" className="space-y-4 px-3 py-4">
            <span className="sr-only">대회 목록을 불러오고 있어요.</span>
            {Array.from({ length: 4 }, (_, i) => (
              <div
                key={i}
                aria-hidden
                className={cn(
                  'h-5 animate-pulse rounded motion-reduce:animate-none',
                  isEditorial ? 'bg-white/10' : 'bg-neutral-100',
                )}
              />
            ))}
          </div>
        ) : groups.length === 0 && !query.isError ? (
          <p className={cn('px-2 py-8 text-center leading-6', isEditorial ? 'text-white/65' : 'text-neutral-600')}>
            등록된 대회가 없어요.
          </p>
        ) : (
          <ul className="space-y-2">
            {groups.map((group) => (
              <CategoryGroup
                key={group.categoryId}
                category={group}
                isExpanded={expandedCategoryId === group.categoryId}
                onToggle={() => toggleCategory(group.categoryId)}
                tone={tone}
                mobile={variant === 'mobile'}
                activeContestId={activeContestId}
                onNavigate={onNavigate}
              />
            ))}
          </ul>
        )}
      </div>
      <div className={cn('shrink-0 border-t px-3 py-2', isEditorial ? 'border-white/20' : 'border-lightGray')}>
        <a
          href={EXTERNAL_LINKS.FEEDBACK}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'flex min-h-11 items-center gap-2 rounded-md px-3 text-sm',
            controlClass,
            isEditorial ? 'text-white/75 hover:bg-white/5' : 'hover:bg-whiteGray text-neutral-600',
          )}
        >
          <MessageSquareShare size={18} aria-hidden />
          <span>의견 보내기</span>
        </a>
        {footer}
      </div>
    </nav>
  );
};

const CategoryGroup = ({
  category,
  isExpanded,
  onToggle,
  tone,
  mobile,
  activeContestId,
  onNavigate,
}: {
  category: GroupedContestResponseDto;
  isExpanded: boolean;
  onToggle: () => void;
  tone: Tone;
  mobile: boolean;
  activeContestId: number | null;
  onNavigate?: () => void;
}) => {
  const listId = useId();
  const editorial = tone === 'editorial';
  const focus = cn(focusClass, editorial ? 'focus-visible:outline-[#45d6ec]' : 'focus-visible:outline-mainBlue');
  return (
    <li>
      <FullName name={category.categoryName}>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isExpanded}
          aria-controls={listId}
          className={cn(
            'flex min-h-11 w-full items-start gap-2 rounded-md px-3 py-3 text-left text-sm font-medium',
            focus,
            editorial ? 'text-white/85 hover:bg-white/5' : 'hover:bg-whiteGray text-neutral-700',
          )}
        >
          <ChevronDown
            size={16}
            aria-hidden
            className={cn(
              'mt-0.5 shrink-0 transition-transform motion-reduce:transition-none',
              !isExpanded && '-rotate-90',
            )}
          />
          <span className={cn('min-w-0 leading-5 break-words', !mobile && 'line-clamp-2')}>
            {category.categoryName}
          </span>
        </button>
      </FullName>
      <ul
        id={listId}
        hidden={!isExpanded}
        className={cn(
          isExpanded ? 'ml-5 space-y-1 border-l pl-2' : 'hidden',
          editorial ? 'border-white/20' : 'border-lightGray',
        )}
      >
        {category.contests.length === 0 ? (
          <li className={cn('px-3 py-4 text-xs', editorial ? 'text-white/60' : 'text-neutral-500')}>
            등록된 대회가 없어요.
          </li>
        ) : (
          category.contests.map((contest) => (
            <li key={contest.contestId}>
              <FullName name={contest.contestName}>
                <NavLink
                  to={`/contest/${contest.contestId}`}
                  onClick={onNavigate}
                  viewTransition={editorial}
                  className={cn(
                    'flex min-h-11 items-center rounded-r-md border-l-2 px-3 py-2.5 text-sm leading-6',
                    focus,
                    activeContestId === contest.contestId
                      ? editorial
                        ? 'border-[#45d6ec] bg-[#102d54] font-medium text-white'
                        : 'border-mainGreen bg-subGreen/50 font-medium text-neutral-950'
                      : editorial
                        ? 'border-transparent text-white/70 hover:bg-white/5 hover:text-white'
                        : 'hover:bg-whiteGray border-transparent text-neutral-600 hover:text-neutral-900',
                  )}
                >
                  <span className={cn('min-w-0 break-words', !mobile && 'line-clamp-2')}>{contest.contestName}</span>
                </NavLink>
              </FullName>
            </li>
          ))
        )}
      </ul>
    </li>
  );
};

export default Sidebar;
