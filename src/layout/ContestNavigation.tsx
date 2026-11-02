import { type PointerEvent as ReactPointerEvent, type ReactNode, useEffect, useRef, useState } from 'react';
import { NavLink, useLocation, useMatch } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, ListRestart, Search, X } from 'lucide-react';
import { getGroupedContests } from '@apis/contest';
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from '@components/ui/popover';
import { type GroupedContestResponseDto } from '@dto/contestsDto';
import useAuth from '@hooks/useAuth';
import SidebarSortEditor from './SidebarSortEditor';
import { cn } from '@utils/classname';

const PREVIEW_COUNT = 5;
const HOVER_OPEN_DELAY = 120;
const HOVER_CLOSE_DELAY = 200;
const normalize = (value: string) => value.toLocaleLowerCase('ko').replace(/\s+/g, '');
const focusClass =
  '[&_:focus-visible:not(input)]:outline-2 [&_:focus-visible:not(input)]:outline-offset-[3px] [&_:focus-visible:not(input)]:outline-(--contest-accent)';
const triggerClass =
  'inline-flex min-h-11 shrink-0 items-center justify-center gap-1 rounded-md p-2 text-sm font-medium whitespace-nowrap text-inherit transition-[background-color] duration-150 ease-[ease] hover:bg-(--contest-selected) aria-expanded:bg-(--contest-selected) data-[selected]:bg-(--contest-selected) sm:gap-2 sm:px-3';
const gridClass = 'grid grid-cols-1 items-start gap-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
const actionClass =
  'inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-md p-2 text-[13px] hover:bg-(--contest-surface-muted) disabled:opacity-50';
const skeletonClass = 'animate-pulse rounded-sm bg-(--contest-surface-muted) motion-reduce:animate-none';

const ContestNavigation = ({
  children,
  editorial,
}: {
  children: (navigation: ReactNode) => ReactNode;
  editorial: boolean;
}) => {
  const location = useLocation();
  const contestRoute = useMatch('/contest/:contestId/*');
  const activeContestId = contestRoute ? Number(contestRoute.params.contestId) : null;
  const { isAdmin } = useAuth();
  const query = useQuery({ queryKey: ['groupedContests'], queryFn: getGroupedContests });
  const groups = query.data ?? [];
  const activeCategoryId = groups.find((group) =>
    group.contests.some((contest) => contest.contestId === activeContestId),
  )?.categoryId;
  const [open, setOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<number[]>([]);
  const [isSorting, setIsSorting] = useState(false);
  const [sortCategoryId, setSortCategoryId] = useState<number | null>(null);
  const navigationRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);
  const sortButtonRef = useRef<HTMLButtonElement>(null);
  const keyboardOpenRef = useRef(false);
  const restoreFocusRef = useRef(true);
  const hoverOpenTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hoverCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const themeClass = editorial
    ? '[--contest-surface:#06172f] [--contest-surface-muted:#0a2242] [--contest-ink:#f8f6f0] [--contest-accent:#45d6ec] [--contest-selected:#102d54]'
    : '[--contest-surface:#fff] [--contest-surface-muted:#f7f8fa] [--contest-ink:#262626] [--contest-accent:#00a651] [--contest-selected:#e8f7ef]';

  const cancelHoverTimers = () => {
    if (hoverOpenTimerRef.current !== null) clearTimeout(hoverOpenTimerRef.current);
    if (hoverCloseTimerRef.current !== null) clearTimeout(hoverCloseTimerRef.current);
    hoverOpenTimerRef.current = null;
    hoverCloseTimerRef.current = null;
  };

  const changeOpen = (next: boolean) => {
    cancelHoverTimers();
    setOpen(next);
    if (!next) {
      setSearch('');
      setExpandedGroups([]);
      setSelectedCategoryId(null);
      setIsSorting(false);
    }
  };

  useEffect(() => {
    changeOpen(false);
  }, [location.key, location.pathname, location.search, location.hash]);

  useEffect(() => () => cancelHoverTimers(), []);

  const term = normalize(search.trim());
  const filteredGroups = groups.flatMap((group) => {
    if (!term || normalize(group.categoryName).includes(term)) return [group];
    const contests = group.contests.filter((contest) => normalize(contest.contestName).includes(term));
    return contests.length ? [{ ...group, contests }] : [];
  });
  const closeSortEditor = () => {
    setIsSorting(false);
    requestAnimationFrame(() => sortButtonRef.current?.focus({ preventScroll: true }));
  };

  const prepareTrigger = (button: HTMLButtonElement, keyboard: boolean) => {
    cancelHoverTimers();
    lastTriggerRef.current = button;
    keyboardOpenRef.current = keyboard;
    restoreFocusRef.current = true;
  };

  const revealCategory = (categoryId: number) => {
    requestAnimationFrame(() =>
      panelRef.current
        ?.querySelector<HTMLElement>(`[data-category-id="${categoryId}"]`)
        ?.scrollIntoView({ block: 'nearest' }),
    );
  };

  const openOnHover = (event: ReactPointerEvent<HTMLButtonElement>, categoryId: number | null) => {
    if (event.pointerType !== 'mouse' || event.buttons !== 0) return;
    cancelHoverTimers();
    if (isSorting || (open && selectedCategoryId === categoryId)) return;
    const button = event.currentTarget;
    hoverOpenTimerRef.current = setTimeout(
      () => {
        prepareTrigger(button, false);
        restoreFocusRef.current = false;
        setSelectedCategoryId(categoryId);
        setSearch('');
        changeOpen(true);
        if (categoryId !== null) revealCategory(categoryId);
      },
      open ? 0 : HOVER_OPEN_DELAY,
    );
  };

  const closeOnHoverLeave = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType !== 'mouse') return;
    cancelHoverTimers();
    if (isSorting) return;
    hoverCloseTimerRef.current = setTimeout(() => {
      hoverCloseTimerRef.current = null;
      const activeElement = document.activeElement;
      if (
        activeElement instanceof Element &&
        (activeElement.closest('[data-sidebar-sort-settings]') ||
          (panelRef.current?.contains(activeElement) &&
            (keyboardOpenRef.current || activeElement instanceof HTMLInputElement)) ||
          (keyboardOpenRef.current && navigationRef.current?.contains(activeElement)))
      ) {
        return;
      }
      restoreFocusRef.current = false;
      changeOpen(false);
    }, HOVER_CLOSE_DELAY);
  };

  return (
    <Popover open={open} onOpenChange={changeOpen}>
      <PopoverAnchor asChild>
        {children(
          <nav
            ref={navigationRef}
            aria-label="대회 카테고리"
            className={cn('flex min-w-0 items-center gap-2.5 text-(--contest-ink)', themeClass, focusClass)}
            onPointerEnter={cancelHoverTimers}
            onPointerLeave={closeOnHoverLeave}
          >
            <PopoverTrigger asChild>
              <button
                type="button"
                className={triggerClass}
                aria-label={open ? '대회 탐색 닫기' : '대회 탐색 열기'}
                aria-controls={open ? 'contest-mega-menu' : undefined}
                onPointerEnter={(event) => openOnHover(event, null)}
                onPointerLeave={cancelHoverTimers}
                onClick={(event) => {
                  prepareTrigger(event.currentTarget, event.detail === 0);
                  setSelectedCategoryId(null);
                }}
                onKeyDown={(event) => {
                  if (event.key !== 'ArrowDown') return;
                  event.preventDefault();
                  prepareTrigger(event.currentTarget, true);
                  setSelectedCategoryId(null);
                  changeOpen(true);
                }}
              >
                <span className="sm:hidden">대회</span>
                <span className="hidden sm:inline">대회 탐색</span>
                <ChevronDown size={15} aria-hidden className={cn('transition-transform', open && 'rotate-180')} />
              </button>
            </PopoverTrigger>
            <div className="hidden min-w-0 items-center gap-1.5 overflow-x-auto [scrollbar-width:thin] xl:flex">
              {groups.map((group) => {
                const selected = open ? selectedCategoryId === group.categoryId : activeCategoryId === group.categoryId;
                return (
                  <button
                    key={group.categoryId}
                    type="button"
                    className={triggerClass}
                    data-selected={selected || undefined}
                    aria-expanded={open && selectedCategoryId === group.categoryId}
                    aria-controls={open ? 'contest-mega-menu' : undefined}
                    aria-haspopup="dialog"
                    onPointerEnter={(event) => openOnHover(event, group.categoryId)}
                    onPointerLeave={cancelHoverTimers}
                    onClick={(event) => {
                      prepareTrigger(event.currentTarget, event.detail === 0);
                      const next = !(open && selectedCategoryId === group.categoryId);
                      changeOpen(next);
                      setSelectedCategoryId(next ? group.categoryId : null);
                      setSearch('');
                      if (next && open) {
                        revealCategory(group.categoryId);
                      }
                    }}
                    onKeyDown={(event) => {
                      if (event.key !== 'ArrowDown') return;
                      event.preventDefault();
                      prepareTrigger(event.currentTarget, true);
                      setSelectedCategoryId(group.categoryId);
                      changeOpen(true);
                      if (open) {
                        panelRef.current
                          ?.querySelector<HTMLAnchorElement>(`[data-category-id="${group.categoryId}"] a`)
                          ?.focus();
                      }
                    }}
                  >
                    {group.categoryName}
                    <ChevronDown
                      size={14}
                      aria-hidden
                      className={cn('transition-transform', open && selected && 'rotate-180')}
                    />
                  </button>
                );
              })}
            </div>
          </nav>,
        )}
      </PopoverAnchor>

      <PopoverContent
        id="contest-mega-menu"
        aria-label="대회 탐색"
        align="center"
        sideOffset={0}
        collisionPadding={0}
        className={cn(
          'z-40 max-h-[min(640px,var(--radix-popover-content-available-height))] w-screen max-w-full origin-top overflow-hidden rounded-none rounded-b-2xl border-0 bg-(--contest-surface) p-0 text-(--contest-ink) shadow-[0_18px_32px_-20px_rgb(15_23_42/28%)] motion-reduce:data-[state=closed]:animate-none motion-reduce:data-[state=open]:animate-none',
          themeClass,
          focusClass,
        )}
        onPointerEnter={cancelHoverTimers}
        onPointerLeave={closeOnHoverLeave}
        onKeyDownCapture={() => {
          keyboardOpenRef.current = true;
          cancelHoverTimers();
        }}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          if (keyboardOpenRef.current) {
            const selector = selectedCategoryId === null ? 'input' : `[data-category-id="${selectedCategoryId}"] a`;
            (panelRef.current?.querySelector<HTMLElement>(selector) ?? panelRef.current)?.focus();
          }
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          if (restoreFocusRef.current) lastTriggerRef.current?.focus({ preventScroll: true });
        }}
        onInteractOutside={(event) => {
          if (event.target instanceof Node && navigationRef.current?.contains(event.target)) event.preventDefault();
          else restoreFocusRef.current = false;
        }}
        onEscapeKeyDown={(event) => {
          if (event.target instanceof Element && event.target.closest('[data-sidebar-sort-settings]')) {
            event.preventDefault();
          }
          restoreFocusRef.current = true;
        }}
      >
        <div
          ref={panelRef}
          className="mx-auto flex max-h-[inherit] w-full max-w-[1448px] flex-col outline-none"
          tabIndex={-1}
        >
          <div className="flex shrink-0 flex-wrap items-center gap-3 px-6 pt-5 pb-3 lg:px-12">
            <h2 className="text-lg font-semibold tracking-tight">대회 둘러보기</h2>
            {!isSorting && (
              <label className="order-3 flex min-h-11 flex-1 basis-full items-center gap-2.5 rounded-md bg-(--contest-surface-muted) px-3.5 text-(--contest-ink) focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-(--contest-accent) sm:order-none sm:ml-auto sm:max-w-[340px] sm:basis-[0%]">
                <Search size={17} aria-hidden />
                <span className="sr-only">대회 검색</span>
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="대회 이름, 카테고리 검색"
                  autoComplete="off"
                  className="w-full min-w-0 bg-transparent py-2.5 text-sm outline-none focus-visible:outline-none"
                />
              </label>
            )}
            <div className="ml-auto flex items-center gap-1">
              {isAdmin && !isSorting && groups.length > 0 && (
                <button
                  ref={sortButtonRef}
                  type="button"
                  className={actionClass}
                  onClick={() => {
                    setSortCategoryId(activeCategoryId ?? groups[0]?.categoryId ?? null);
                    setIsSorting(true);
                  }}
                >
                  <ListRestart size={17} aria-hidden /> 정렬
                </button>
              )}
              <button
                type="button"
                aria-label="대회 탐색 닫기"
                className={actionClass}
                onClick={() => {
                  restoreFocusRef.current = true;
                  changeOpen(false);
                }}
              >
                <X size={20} aria-hidden />
              </button>
            </div>
          </div>

          <div className="min-h-0 overflow-y-auto overscroll-contain px-6 pt-2 pb-6 [scrollbar-color:#c6cbd1_transparent] [scrollbar-width:thin] lg:px-12">
            {query.isError && (
              <div role="alert" className="mb-4 flex flex-wrap items-center gap-3 text-sm">
                <p>{query.data ? '목록을 새로 불러오지 못했어요.' : '대회 목록을 불러오지 못했어요.'}</p>
                <button
                  type="button"
                  className={cn(actionClass, 'underline underline-offset-4')}
                  disabled={query.isFetching}
                  onClick={() => void query.refetch()}
                >
                  다시 시도
                </button>
              </div>
            )}
            {isSorting && isAdmin ? (
              <div className="mx-auto max-w-2xl">
                <SidebarSortEditor
                  groups={groups}
                  expandedCategoryId={sortCategoryId}
                  onToggleCategory={(id) => setSortCategoryId(sortCategoryId === id ? null : id)}
                  onCancel={closeSortEditor}
                  onSaved={closeSortEditor}
                  tone={editorial ? 'editorial' : 'default'}
                />
              </div>
            ) : query.isPending ? (
              <div role="status" className={gridClass}>
                <span className="sr-only">대회 목록을 불러오고 있어요.</span>
                {Array.from({ length: 3 }, (_, i) => (
                  <div key={i} aria-hidden className="space-y-4 py-3">
                    <div className={cn(skeletonClass, 'h-12')} />
                    <div className={cn(skeletonClass, 'h-5 w-4/5')} />
                    <div className={cn(skeletonClass, 'h-5 w-3/5')} />
                  </div>
                ))}
              </div>
            ) : filteredGroups.length === 0 && !query.isError ? (
              <p role="status" className="py-10 text-center text-sm opacity-65">
                {term ? '검색 결과가 없어요. 다른 이름으로 검색해 보세요.' : '등록된 대회가 없어요.'}
              </p>
            ) : (
              <nav aria-label="대회 목록" className={gridClass}>
                {filteredGroups.map((group) => (
                  <ContestCategory
                    key={group.categoryId}
                    group={group}
                    activeContestId={activeContestId}
                    highlighted={selectedCategoryId === group.categoryId}
                    expanded={!!term || expandedGroups.includes(group.categoryId)}
                    onExpand={() => setExpandedGroups([...expandedGroups, group.categoryId])}
                    onNavigate={() => changeOpen(false)}
                    editorial={editorial}
                  />
                ))}
              </nav>
            )}
            {!!term && !query.isPending && (
              <p role="status" className="sr-only">
                검색 결과 {filteredGroups.reduce((count, group) => count + group.contests.length, 0)}개 대회
              </p>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

const ContestCategory = ({
  group,
  activeContestId,
  highlighted,
  expanded,
  onExpand,
  onNavigate,
  editorial,
}: {
  group: GroupedContestResponseDto;
  activeContestId: number | null;
  highlighted: boolean;
  expanded: boolean;
  onExpand: () => void;
  onNavigate: () => void;
  editorial: boolean;
}) => {
  const visibleContests = expanded
    ? group.contests
    : group.contests.filter((contest, index) => index < PREVIEW_COUNT || contest.contestId === activeContestId);
  const remaining = group.contests.length - visibleContests.length;

  return (
    <section data-category-id={group.categoryId} className="min-w-0">
      <h3
        className="flex min-h-12 items-center justify-between gap-3 rounded-lg bg-(--contest-surface-muted) px-4 py-3 text-[15px] font-semibold data-[highlighted]:bg-(--contest-selected)"
        data-highlighted={highlighted || undefined}
      >
        <span className="min-w-0 break-words">{group.categoryName}</span>
        <span className="shrink-0 text-xs font-normal opacity-50">{group.contests.length}</span>
      </h3>
      <ul className="mt-2 space-y-1">
        {visibleContests.length === 0 ? (
          <li className="px-4 py-3 text-sm opacity-50">등록된 대회가 없어요.</li>
        ) : (
          visibleContests.map((contest) => (
            <li key={contest.contestId}>
              <NavLink
                to={`/contest/${contest.contestId}`}
                onClick={onNavigate}
                viewTransition={editorial}
                className="flex min-h-11 items-center gap-2 rounded-r-md border-l-2 border-transparent px-3.5 py-2.5 text-sm hover:bg-(--contest-surface-muted) data-[current]:border-(--contest-accent) data-[current]:bg-(--contest-selected) data-[current]:font-semibold data-[current]:hover:bg-(--contest-selected)"
                data-current={activeContestId === contest.contestId || undefined}
              >
                <span className="min-w-0 flex-1 leading-6 break-words">{contest.contestName}</span>
                {contest.isCurrent && (
                  <span className="shrink-0 rounded-[4px] bg-(--contest-selected) px-1.5 py-0.5 text-[10px] leading-normal font-medium text-(--contest-accent)">
                    현재
                  </span>
                )}
              </NavLink>
            </li>
          ))
        )}
      </ul>
      {remaining > 0 && (
        <button
          type="button"
          className="mt-1 flex min-h-11 items-center gap-1.5 rounded-md px-4 py-2.5 text-xs hover:bg-(--contest-surface-muted)"
          onClick={onExpand}
        >
          {group.categoryName} 더 보기 <span className="opacity-50">+{remaining}</span>
          <ChevronDown size={14} aria-hidden />
        </button>
      )}
    </section>
  );
};

export default ContestNavigation;
