import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { Loader2, Plus, Search, X } from 'lucide-react';
import { ContestResponseDto } from '@dto/contestsDto';
import Input from '@components/Input';
import { AdminActionButton } from '@components/admin';
import { Dialog, DialogClose, DialogContent, DialogTitle } from '@components/ui/dialog';
import { patchChangeOngoingContest } from '@apis/contest';
import { useToast } from '@hooks/useToast';
import { contestsOption, currentContestOption } from '@queries/contest';

const MAX_ONGOING_CONTESTS = 2;

type ContestChange = Pick<ContestResponseDto, 'contestId' | 'contestName' | 'isCurrent'>;

export const ContestSlots = () => {
  const { data: contests } = useSuspenseQuery(contestsOption());
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [search, setSearch] = useState('');
  const addTriggerRef = useRef<HTMLButtonElement | null>(null);
  const slotsRef = useRef<HTMLDivElement>(null);
  const toast = useToast();
  const queryClient = useQueryClient();
  const ongoingContests = contests.filter((contest) => contest.isCurrent);
  const availableContests = contests.filter((contest) => !contest.isCurrent);
  const keyword = search.trim().toLocaleLowerCase();
  const filteredContests = availableContests.filter((contest) =>
    `${contest.contestName} ${contest.categoryName}`.toLocaleLowerCase().includes(keyword),
  );
  const isFull = ongoingContests.length >= MAX_ONGOING_CONTESTS;

  const changeOngoingContest = useMutation({
    mutationKey: ['changeOngoingContest'],
    mutationFn: ({ contestId, isCurrent }: ContestChange) => patchChangeOngoingContest(contestId, isCurrent),
    onSuccess: async (_, { contestName, isCurrent }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: contestsOption().queryKey }),
        queryClient.invalidateQueries({ queryKey: currentContestOption().queryKey }),
      ]);
      if (isCurrent) {
        setIsPickerOpen(false);
      } else {
        requestAnimationFrame(() => slotsRef.current?.focus());
      }
      toast(
        isCurrent ? `${contestName} 대회를 추가했습니다.` : `${contestName} 대회의 진행 중 설정을 해제했습니다.`,
        'success',
      );
    },
  });

  const toggleOngoingContest = (contest: ContestResponseDto, isCurrent: boolean) => {
    if (changeOngoingContest.isPending || (isCurrent && (isFull || contest.isCurrent))) return;
    changeOngoingContest.mutate({ contestId: contest.contestId, contestName: contest.contestName, isCurrent });
  };

  const openPicker = (trigger: HTMLButtonElement) => {
    if (changeOngoingContest.isPending || isFull) return;
    addTriggerRef.current = trigger;
    setSearch('');
    changeOngoingContest.reset();
    setIsPickerOpen(true);
  };

  return (
    <>
      <div
        ref={slotsRef}
        role="group"
        aria-label="진행 중인 대회 설정"
        tabIndex={-1}
        className="focus-visible:outline-mainBlue grid max-w-[720px] grid-cols-1 gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 sm:grid-cols-2"
      >
        {ongoingContests.map((contest) => {
          const isRemoving =
            changeOngoingContest.isPending && changeOngoingContest.variables?.contestId === contest.contestId;

          return (
            <div
              key={contest.contestId}
              className="flex min-h-20 min-w-0 items-center gap-3 rounded-lg bg-[#e6f2f8] py-3 pr-2 pl-5"
            >
              <p className="min-w-0 flex-1 text-base leading-6 font-medium [overflow-wrap:anywhere] text-neutral-800">
                {contest.contestName}
              </p>
              <span className="bg-mainBlue shrink-0 rounded-full px-2 py-0.5 text-xs leading-5 font-medium text-white">
                진행 중
              </span>
              <button
                type="button"
                aria-label={`${contest.contestName} 진행 중 설정 해제`}
                title="진행 중 설정 해제"
                disabled={changeOngoingContest.isPending}
                onClick={() => toggleOngoingContest(contest, false)}
                className="focus-visible:outline-mainBlue flex size-11 shrink-0 items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-white/70 hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-wait disabled:opacity-50"
              >
                {isRemoving ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : (
                  <X className="size-4" aria-hidden />
                )}
              </button>
            </div>
          );
        })}
        {Array.from({ length: Math.max(0, MAX_ONGOING_CONTESTS - ongoingContests.length) }, (_, index) => (
          <button
            key={`add-${index}`}
            type="button"
            aria-label={`${ongoingContests.length + index + 1}번째 진행 중인 대회 추가`}
            aria-haspopup="dialog"
            disabled={changeOngoingContest.isPending}
            onClick={(event) => openPicker(event.currentTarget)}
            className="hover:border-mainBlue hover:bg-mainBlue/5 hover:text-mainBlue focus-visible:outline-mainBlue group flex min-h-20 min-w-0 items-center justify-center gap-3 rounded-lg border border-dashed border-neutral-300 px-5 py-3 text-neutral-500 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-wait disabled:opacity-50"
          >
            <span className="group-hover:bg-mainBlue/10 flex size-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 transition-colors">
              <Plus className="size-4" aria-hidden />
            </span>
            <span className="text-sm font-medium">대회 추가</span>
          </button>
        ))}
      </div>
      <div className="flex max-w-[720px] flex-wrap items-center justify-between gap-2 text-xs leading-5 text-neutral-500">
        <p>
          {isFull
            ? '다른 대회를 표시하려면 먼저 진행 중 설정을 해제해 주세요.'
            : '대회를 추가하면 메인 페이지에 바로 반영됩니다.'}
        </p>
        <p
          role="status"
          className="shrink-0 tabular-nums"
          aria-label={`진행 중인 대회 ${ongoingContests.length}개, 최대 ${MAX_ONGOING_CONTESTS}개`}
        >
          <span className="text-mainBlue font-medium">{ongoingContests.length}</span> / {MAX_ONGOING_CONTESTS}개 설정됨
        </p>
      </div>
      {changeOngoingContest.isError && !changeOngoingContest.variables?.isCurrent && (
        <p role="alert" className="text-destructive text-sm leading-6">
          설정을 해제하지 못했습니다. 잠시 후 다시 시도해 주세요.
        </p>
      )}
      <Dialog open={isPickerOpen} onOpenChange={(open) => !changeOngoingContest.isPending && setIsPickerOpen(open)}>
        <DialogContent
          appearance="admin"
          className="w-[480px]"
          closeDisabled={changeOngoingContest.isPending}
          aria-describedby="ongoing-contest-picker-description"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            const trigger = addTriggerRef.current;
            if (trigger?.isConnected && !trigger.disabled) trigger.focus();
            else slotsRef.current?.focus();
          }}
        >
          <div>
            <DialogTitle>진행 중인 대회 추가</DialogTitle>
            <p id="ongoing-contest-picker-description" className="mt-2 text-sm leading-6 text-neutral-500">
              추가할 대회를 선택하세요. 선택하면 메인 페이지에 바로 반영됩니다.
            </p>
          </div>
          {availableContests.length > 0 && !isFull && (
            <div className="relative">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400"
                aria-hidden
              />
              <Input
                appearance="admin"
                type="search"
                aria-label="대회 검색"
                placeholder="대회명 또는 카테고리 검색"
                value={search}
                disabled={changeOngoingContest.isPending}
                onChange={(event) => setSearch(event.target.value)}
                className="pl-10 text-sm"
              />
            </div>
          )}
          <div className="max-h-72 overflow-y-auto" aria-busy={changeOngoingContest.isPending}>
            {isFull ? (
              <p className="py-6 text-center text-sm leading-6 text-neutral-500">
                이미 2개의 대회가 설정되어 있습니다.
              </p>
            ) : availableContests.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <p className="text-sm leading-6 text-neutral-500">
                  {contests.length === 0 ? '등록된 대회가 없습니다.' : '추가할 수 있는 대회가 없습니다.'}
                </p>
                <Link
                  to="/admin/contest/create"
                  className="text-mainBlue focus-visible:outline-mainBlue inline-flex min-h-11 items-center gap-1 rounded-md px-3 text-sm font-medium hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  <Plus className="size-4" aria-hidden />새 대회 만들기
                </Link>
              </div>
            ) : filteredContests.length === 0 ? (
              <p role="status" className="py-6 text-center text-sm leading-6 text-neutral-500">
                검색 결과가 없습니다. 다른 검색어를 입력해 주세요.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {filteredContests.map((contest) => {
                  const isAdding =
                    changeOngoingContest.isPending && changeOngoingContest.variables?.contestId === contest.contestId;

                  return (
                    <li key={contest.contestId}>
                      <button
                        type="button"
                        aria-label={`${contest.contestName} 추가`}
                        disabled={changeOngoingContest.isPending}
                        onClick={() => toggleOngoingContest(contest, true)}
                        className="border-lightGray hover:border-mainBlue/40 hover:bg-mainBlue/5 focus-visible:outline-mainBlue flex w-full items-center gap-4 rounded-lg border px-4 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 disabled:cursor-wait disabled:opacity-50"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block text-xs leading-5 text-neutral-500">{contest.categoryName}</span>
                          <span className="mt-1 block text-sm leading-6 font-medium [overflow-wrap:anywhere] text-neutral-900">
                            {contest.contestName}
                          </span>
                        </span>
                        <span className="text-mainBlue inline-flex shrink-0 items-center gap-1 text-sm font-medium">
                          {isAdding ? (
                            <Loader2 className="size-4 animate-spin" aria-hidden />
                          ) : (
                            <Plus className="size-4" aria-hidden />
                          )}
                          {isAdding ? '추가 중' : '추가'}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          {changeOngoingContest.isError && changeOngoingContest.variables?.isCurrent && (
            <p role="alert" className="text-destructive text-sm leading-6">
              대회를 추가하지 못했습니다. 잠시 후 다시 시도해 주세요.
            </p>
          )}
          <div className="flex justify-end">
            <DialogClose asChild>
              <AdminActionButton type="button" variant="outline" disabled={changeOngoingContest.isPending}>
                취소
              </AdminActionButton>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
