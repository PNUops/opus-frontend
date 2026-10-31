import { AdminResponsiveList } from '@components/admin/AdminResponsiveList';
import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';

import {
  AdminActionButton,
  AdminDeleteConfirmModal,
  AdminPopoverDeleteButton,
  AdminPopoverEditButton,
  AdminPopoverMenu,
} from '@components/admin';
import { AdminFilterSelect as FilterDropDown } from '@components/admin/AdminFilterSelect';
import { Dialog, DialogContent, DialogTitle } from '@components/ui/dialog';
import { useToast } from '@hooks/useToast';
import { useContestIdOrRedirect } from '@hooks/useId';
import { deleteSubmissionItem, patchSubmissionItem, postSubmissionItem } from '@apis/submission';
import { getContestTracks } from '@apis/track';
import { submissionItemSettingOption, submissionItemsOption } from '@queries/submission';
import { getApiErrorMessage } from '@utils/error';

import { OPERATION_STATUS_FILTER_OPTIONS, VISIBILITY_LABEL } from '@constants/submission';
import type {
  SubmissionItemRequestDto,
  SubmissionItemResponseDto,
  SubmissionItemSettingResponseDto,
  SubmissionOperationStatus,
} from '@dto/submissionDto';
import type { SubmissionFormValues } from '../types/submission';
import { AllowLateBadge, OperationStatusBadge } from './SubmissionBadges';
import { SubmissionFormModal } from './SubmissionFormModal';

type ModalState = { mode: 'create' } | { mode: 'edit'; item: SubmissionItemResponseDto } | null;

/** 설정값 확인 응답을 수정 폼 값으로 변환 */
const settingToFormValues = (setting: SubmissionItemSettingResponseDto): SubmissionFormValues => ({
  name: setting.name,
  trackId: setting.contestTrackId ?? null,
  description: setting.description ?? '',
  fileFormats: setting.allowedFileFormats,
  maxFileSizeMb: setting.maxFileSizeMb,
  maxFileCount: setting.maxFileCount,
  startAt: setting.startAt,
  endAt: setting.endAt,
  allowLateSubmission: setting.allowLateSubmission,
  visibility: setting.visibility,
});

type StatusFilter = SubmissionOperationStatus | '';

const formatDateTime = (value: string) => dayjs(value).format('YYYY-MM-DD HH:mm');

interface SubmissionSettingTabProps {
  // "제출 현황 보기" 클릭 시 해당 제출물 종류명으로 제출 현황 탭 필터링하며 이동
  onViewStatus: (submissionItemName: string) => void;
}

export const SubmissionSettingTab = ({ onViewStatus }: SubmissionSettingTabProps) => {
  const toast = useToast();
  const contestId = useContestIdOrRedirect();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('');
  const [modalState, setModalState] = useState<ModalState>(null);
  const [deleteTarget, setDeleteTarget] = useState<SubmissionItemResponseDto | null>(null);

  const { data: submissions } = useSuspenseQuery(submissionItemsOption(contestId));

  // 대상 분과 선택용 분과 목록
  const { data: tracks = [] } = useQuery({
    queryKey: ['tracks', contestId],
    queryFn: () => getContestTracks(contestId),
    enabled: !!contestId,
  });

  // 수정 모드일 때 기존 설정값 조회 (모달 초기값)
  const editItemId = modalState?.mode === 'edit' ? modalState.item.contestSubmissionItemId : 0;
  const { data: editSetting } = useQuery(submissionItemSettingOption(contestId, editItemId));

  const invalidateList = () => queryClient.invalidateQueries({ queryKey: submissionItemsOption(contestId).queryKey });

  const createMutation = useMutation({
    mutationFn: (payload: SubmissionItemRequestDto) => postSubmissionItem(contestId, payload),
    onSuccess: () => {
      toast('제출 항목을 추가했어요.', 'success');
      invalidateList();
      setModalState(null);
    },
    onError: (error) => toast(getApiErrorMessage(error, '제출 항목 추가에 실패했어요.'), 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: SubmissionItemRequestDto }) =>
      patchSubmissionItem(contestId, id, payload),
    onSuccess: (_data, { id }) => {
      toast('제출 항목을 수정했어요.', 'success');
      invalidateList();
      // 개별 설정값 캐시도 무효화 — 안 하면 다시 수정 진입 시 이전 값이 채워짐
      queryClient.invalidateQueries({ queryKey: submissionItemSettingOption(contestId, id).queryKey });
      setModalState(null);
    },
    onError: (error) => toast(getApiErrorMessage(error, '제출 항목 수정에 실패했어요.'), 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteSubmissionItem(contestId, id),
    onSuccess: () => {
      toast('제출 항목을 삭제했어요.', 'success');
      invalidateList();
      setDeleteTarget(null);
    },
    onError: (error) => toast(getApiErrorMessage(error, '제출 항목 삭제에 실패했어요.'), 'error'),
  });

  const filteredSubmissions = useMemo(
    () => (statusFilter === '' ? submissions : submissions.filter((item) => item.operationStatus === statusFilter)),
    [submissions, statusFilter],
  );

  const statusFilterLabel =
    OPERATION_STATUS_FILTER_OPTIONS.find((option) => option.value === statusFilter)?.label ?? '운영 상태';

  const handleEdit = (submission: SubmissionItemResponseDto) => {
    updateMutation.reset();
    setModalState({ mode: 'edit', item: submission });
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget || deleteMutation.isPending) return;
    deleteMutation.mutate(deleteTarget.contestSubmissionItemId);
  };

  const handleSubmit = (payload: SubmissionItemRequestDto) => {
    if (createMutation.isPending || updateMutation.isPending) return;
    if (modalState?.mode === 'edit') {
      updateMutation.mutate({ id: modalState.item.contestSubmissionItemId, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <FilterDropDown<StatusFilter>
          variant="select"
          label={statusFilter === '' ? '운영 상태' : statusFilterLabel}
          value={statusFilter}
          options={OPERATION_STATUS_FILTER_OPTIONS}
          onChange={setStatusFilter}
        />
        <AdminActionButton
          onClick={() => {
            createMutation.reset();
            setModalState({ mode: 'create' });
          }}
        >
          + 제출 항목 추가
        </AdminActionButton>
      </div>

      <AdminResponsiveList
        label="제출 항목 설정 목록"
        items={filteredSubmissions}
        getKey={(submission) => submission.contestSubmissionItemId}
        primaryKey="name"
        emptyText="등록된 제출 항목이 없어요."
        columns={[
          {
            key: 'status',
            label: '운영 상태',
            render: (submission) => <OperationStatusBadge status={submission.operationStatus} />,
          },
          { key: 'name', label: '제출 항목', render: (submission) => submission.name },
          { key: 'track', label: '분과', render: (submission) => submission.trackName ?? '전체' },
          {
            key: 'start',
            label: '시작일시',
            render: (submission) => formatDateTime(submission.startAt),
            className: 'whitespace-nowrap',
          },
          {
            key: 'end',
            label: '마감일시',
            render: (submission) => formatDateTime(submission.endAt),
            className: 'whitespace-nowrap',
          },
          {
            key: 'late',
            label: '지각 제출 허용',
            render: (submission) => <AllowLateBadge allowLate={submission.allowLateSubmission} />,
          },
          { key: 'visibility', label: '공개 범위', render: (submission) => VISIBILITY_LABEL[submission.visibility] },
        ]}
        actions={(submission) => (
          <>
            <button
              type="button"
              onClick={() => onViewStatus(submission.name)}
              className="border-mainBlue text-mainBlue min-h-11 rounded-md border px-3 py-2 text-xs font-medium whitespace-nowrap hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              제출 현황 보기
            </button>
            <AdminPopoverMenu>
              <AdminPopoverEditButton onEdit={() => handleEdit(submission)} />
              <AdminPopoverDeleteButton
                onDelete={() => {
                  deleteMutation.reset();
                  setDeleteTarget(submission);
                }}
              />
            </AdminPopoverMenu>
          </>
        )}
      />

      <p className="text-xs text-neutral-600">제출 항목이 설정된 최신 순서대로 표시됩니다.</p>

      <Dialog open={modalState !== null} onOpenChange={(open) => !open && setModalState(null)}>
        {modalState &&
          (modalState.mode === 'create' ? (
            <SubmissionFormModal
              mode="create"
              isPending={createMutation.isPending}
              isError={createMutation.isError}
              tracks={tracks}
              onSubmit={handleSubmit}
              onClose={() => setModalState(null)}
            />
          ) : editSetting ? (
            <SubmissionFormModal
              mode="edit"
              isPending={updateMutation.isPending}
              isError={updateMutation.isError}
              tracks={tracks}
              initialValues={settingToFormValues(editSetting)}
              onSubmit={handleSubmit}
              onClose={() => setModalState(null)}
            />
          ) : (
            <FormModalLoading />
          ))}
      </Dialog>

      <Dialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        {deleteTarget && (
          <AdminDeleteConfirmModal
            title={`'${deleteTarget.name}' 제출 항목을 삭제하시겠어요?`}
            onDelete={handleDeleteConfirm}
            isPending={deleteMutation.isPending}
            isError={deleteMutation.isError}
          />
        )}
      </Dialog>
    </div>
  );
};

const FormModalLoading = () => (
  <DialogContent appearance="admin" className="w-[600px] max-w-[92vw] items-stretch gap-5">
    <DialogTitle className="text-xl font-bold text-gray-900">제출 항목 수정</DialogTitle>
    <p className="py-10 text-center text-sm text-neutral-600">설정값을 불러오고 있어요.</p>
  </DialogContent>
);
