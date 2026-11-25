import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ClipboardList, FilePlus2, Megaphone } from 'lucide-react';
import { AdminActionButton } from '@components/admin';
import { Dialog, DialogContent, DialogTitle } from '@components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';
import { postSubmissionItem } from '@apis/submission';
import { getContestTracks } from '@apis/track';
import { contestsOption, contestTeamOption } from '@queries/contest';
import { submissionItemsOption } from '@queries/submission';
import { useToast } from '@hooks/useToast';
import { getApiErrorMessage } from '@utils/error';
import type { SubmissionItemRequestDto } from '@dto/submissionDto';
import type { ContestResponseDto } from '@dto/contestsDto';
import ContestTeamSetting from './team-setting/ContestTeamSetting';
import { SubmissionFormModal } from './submission-manage/components/SubmissionFormModal';

type Action = 'teams' | 'notice' | 'submission';
const actions = [
  {
    id: 'teams',
    title: '팀 일괄 등록',
    description: '엑셀 파일로 참가팀 여러 개를 한 번에 등록합니다.',
    button: '등록 시작',
    icon: ClipboardList,
  },
  {
    id: 'notice',
    title: '대회 공지 작성',
    description: '대회별 공지사항을 새로 작성합니다.',
    button: '공지 작성',
    icon: Megaphone,
  },
  {
    id: 'submission',
    title: '제출 항목 추가',
    description: '필요한 제출 자료와 마감 일시를 설정합니다.',
    button: '항목 추가',
    icon: FilePlus2,
  },
] as const;

const QuickActions = () => {
  const [action, setAction] = useState<Action | null>(null);
  const [contest, setContest] = useState<ContestResponseDto | null>(null);
  const [teamPending, setTeamPending] = useState(false);
  const [submissionDirty, setSubmissionDirty] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const contests = useQuery({
    ...contestsOption(),
    enabled: action !== null && (action === 'teams' || contest === null),
  });
  const tracks = useQuery({
    queryKey: ['tracks', contest?.contestId],
    queryFn: () => getContestTracks(contest!.contestId),
    enabled: action === 'submission' && contest !== null,
  });
  const createSubmission = useMutation({
    mutationFn: (payload: SubmissionItemRequestDto) => postSubmissionItem(contest!.contestId, payload),
    onSuccess: () => {
      const contestId = contest!.contestId;
      queryClient.invalidateQueries({ queryKey: submissionItemsOption(contestId).queryKey });
      toast('제출 항목을 추가했어요.', 'success');
      close();
      navigate(`/admin/contest/${contestId}/submission-manage`);
    },
    onError: (error) => toast(getApiErrorMessage(error, '제출 항목 추가에 실패했어요.'), 'error'),
  });
  const close = () => {
    setAction(null);
    setContest(null);
    setSubmissionDirty(false);
    setConfirmDiscard(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  };
  const requestClose = () => {
    if (action === 'submission' && submissionDirty) setConfirmDiscard(true);
    else close();
  };
  const chooseContest = (selected: ContestResponseDto) => {
    if (action === 'notice') {
      close();
      navigate(`/admin/contest/${selected.contestId}/notices`);
    } else setContest(selected);
  };
  const currentAction = actions.find((item) => item.id === action);

  return (
    <section aria-labelledby="quick-actions-title" className="max-w-[720px]">
      <h2 id="quick-actions-title" className="text-2xl font-bold text-neutral-900">
        빠른 작업
      </h2>
      <p className="mt-2 text-sm text-neutral-600">작업을 선택한 후 대상 대회와 필요한 정보를 입력합니다.</p>
      <div className="mt-4 flex flex-col gap-3">
        {actions.map(({ id, title, description, button, icon: Icon }) => (
          <div
            key={id}
            className={`border-lightGray flex flex-wrap items-center gap-3 rounded-lg border p-4 ${id === 'teams' ? 'bg-[#e8f2f7]' : 'bg-white'}`}
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-blue-50 text-neutral-600">
              <Icon size={20} aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-neutral-900">{title}</h3>
              <p className="mt-1 text-sm text-neutral-600">{description}</p>
            </div>
            <AdminActionButton
              variant={id === 'teams' ? 'default' : 'outline'}
              onClick={(event) => {
                triggerRef.current = event.currentTarget;
                setContest(null);
                createSubmission.reset();
                setAction(id);
              }}
            >
              {button} →
            </AdminActionButton>
          </div>
        ))}
      </div>
      <Dialog
        open={action !== null}
        onOpenChange={(open) => {
          if (!open && !teamPending && !createSubmission.isPending) requestClose();
        }}
      >
        {action && action !== 'teams' && !contest && (
          <DialogContent appearance="admin" className="w-[480px]">
            <div>
              <DialogTitle>{currentAction?.title}</DialogTitle>
              <p className="mt-2 text-sm text-neutral-600">작업할 대회를 선택해 주세요.</p>
            </div>
            {contests.isPending ? (
              <p role="status">대회를 불러오고 있어요.</p>
            ) : contests.isError ? (
              <div role="alert">
                <p>대회를 불러오지 못했어요.</p>
                <AdminActionButton variant="outline" onClick={() => contests.refetch()}>
                  다시 시도
                </AdminActionButton>
              </div>
            ) : contests.data.length === 0 ? (
              <p>등록된 대회가 없습니다.</p>
            ) : (
              <ul className="max-h-72 space-y-2 overflow-y-auto">
                {contests.data.map((item) => (
                  <li key={item.contestId}>
                    <button
                      type="button"
                      onClick={() => chooseContest(item)}
                      className="border-lightGray focus-visible:outline-mainBlue flex min-h-11 w-full items-center justify-between gap-3 rounded-md border px-4 py-3 text-left text-sm hover:bg-blue-50 focus-visible:outline-2"
                    >
                      <span>{item.contestName}</span>
                      <span className="text-mainBlue shrink-0">선택 →</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex justify-end">
              <AdminActionButton variant="outline" onClick={close}>
                취소
              </AdminActionButton>
            </div>
          </DialogContent>
        )}
        {action === 'teams' && (
          <DialogContent appearance="admin" className="w-[600px]" closeDisabled={teamPending}>
            <div>
              <DialogTitle>팀 일괄 등록</DialogTitle>
              <p className="mt-2 text-sm text-neutral-600">대회를 선택한 뒤 참가팀 엑셀 파일을 업로드합니다.</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="quick-team-contest">
                대상 대회 *
              </label>
              {contests.isPending ? (
                <p role="status" className="text-sm">
                  대회를 불러오고 있어요.
                </p>
              ) : contests.isError ? (
                <div role="alert">
                  <p className="text-sm">대회를 불러오지 못했어요.</p>
                  <AdminActionButton variant="outline" onClick={() => contests.refetch()}>
                    다시 시도
                  </AdminActionButton>
                </div>
              ) : contests.data.length === 0 ? (
                <p className="text-sm">등록된 대회가 없습니다.</p>
              ) : (
                <Select
                  value={contest ? String(contest.contestId) : ''}
                  disabled={teamPending}
                  onValueChange={(value) =>
                    setContest(contests.data.find((item) => String(item.contestId) === value) ?? null)
                  }
                >
                  <SelectTrigger id="quick-team-contest" appearance="admin">
                    <SelectValue placeholder="대회를 선택해 주세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {contests.data.map((item) => (
                      <SelectItem key={item.contestId} value={String(item.contestId)}>
                        {item.contestName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <ContestTeamSetting
              contestId={contest?.contestId ?? 0}
              maxFileSizeMb={10}
              onPendingChange={setTeamPending}
              onCancel={close}
              onComplete={() => {
                if (contest) queryClient.invalidateQueries({ queryKey: contestTeamOption(contest.contestId).queryKey });
                close();
              }}
            />
          </DialogContent>
        )}
        {action === 'submission' &&
          contest &&
          (tracks.isPending ? (
            <DialogContent appearance="admin" className="w-[480px]">
              <DialogTitle>제출 항목 추가</DialogTitle>
              <p role="status">대회 정보를 불러오고 있어요.</p>
            </DialogContent>
          ) : tracks.isError ? (
            <DialogContent appearance="admin" className="w-[480px]">
              <DialogTitle>제출 항목 추가</DialogTitle>
              <p role="alert">대회 정보를 불러오지 못했어요.</p>
              <AdminActionButton variant="outline" onClick={() => tracks.refetch()}>
                다시 시도
              </AdminActionButton>
            </DialogContent>
          ) : (
            <SubmissionFormModal
              mode="create"
              contestName={contest.contestName}
              tracks={tracks.data}
              isPending={createSubmission.isPending}
              isError={createSubmission.isError}
              onSubmit={(payload) => createSubmission.mutate(payload)}
              onClose={requestClose}
              onDirtyChange={() => setSubmissionDirty(true)}
            />
          ))}
      </Dialog>
      <Dialog open={confirmDiscard} onOpenChange={setConfirmDiscard}>
        <DialogContent appearance="admin" className="w-[420px]">
          <DialogTitle>작성을 취소하시겠어요?</DialogTitle>
          <p className="text-sm text-neutral-600">입력한 내용은 저장되지 않습니다.</p>
          <div className="flex justify-end gap-3">
            <AdminActionButton variant="outline" onClick={() => setConfirmDiscard(false)}>
              계속 작성
            </AdminActionButton>
            <AdminActionButton onClick={close}>작성 취소</AdminActionButton>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default QuickActions;
