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
import FilterDropDown from '@components/FilterDropDown';
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

const TABLE_HEADERS = ['운영 상태', '제출 항목', '분과', '시작일시', '마감일시', '지각 제출 허용', '공개 범위', ''];

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
    onSuccess: () => {
      toast('제출 항목을 수정했어요.', 'success');
      invalidateList();
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
    setModalState({ mode: 'edit', item: submission });
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.contestSubmissionItemId);
  };

  const handleSubmit = (payload: SubmissionItemRequestDto) => {
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
          variant="outline"
          size="sm"
          className="border-mainBlue text-mainBlue hover:bg-blue-50"
          onClick={() => setModalState({ mode: 'create' })}
        >
          + 제출 항목 추가
        </AdminActionButton>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] border-collapse">
          <thead>
            <tr className="border-lightGray border-b">
              {TABLE_HEADERS.map((header, index) => (
                <th
                  key={header || `col-${index}`}
                  className="px-4 py-3 text-left text-sm font-medium whitespace-nowrap"
                >
                  {header}
                </th>
              ))}
              <th className="px-4 py-3 text-center text-sm font-medium whitespace-nowrap">작업</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubmissions.length === 0 ? (
              <tr>
                <td colSpan={TABLE_HEADERS.length + 1} className="text-midGray py-12 text-center text-sm">
                  등록된 제출 항목이 없어요.
                </td>
              </tr>
            ) : (
              filteredSubmissions.map((submission) => (
                <tr key={submission.contestSubmissionItemId} className="border-lightGray border-b last:border-b-0">
                  <td className="px-4 py-4">
                    <OperationStatusBadge status={submission.operationStatus} />
                  </td>
                  <td className="text-darkGray px-4 py-4 text-sm font-medium whitespace-nowrap">{submission.name}</td>
                  <td className="px-4 py-4 text-sm whitespace-nowrap text-gray-600">
                    {submission.trackName ?? '전체'}
                  </td>
                  <td className="px-4 py-4 text-sm whitespace-nowrap text-gray-600">
                    {formatDateTime(submission.startAt)}
                  </td>
                  <td className="px-4 py-4 text-sm whitespace-nowrap text-gray-600">
                    {formatDateTime(submission.endAt)}
                  </td>
                  <td className="px-4 py-4">
                    <AllowLateBadge allowLate={submission.allowLateSubmission} />
                  </td>
                  <td className="px-4 py-4 text-sm whitespace-nowrap text-gray-600">
                    {VISIBILITY_LABEL[submission.visibility]}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <button
                      onClick={() => onViewStatus(submission.name)}
                      className="border-mainBlue text-mainBlue rounded-md border px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors hover:bg-blue-50"
                    >
                      제출 현황 보기
                    </button>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-center">
                      <AdminPopoverMenu>
                        <AdminPopoverEditButton onEdit={() => handleEdit(submission)} />
                        <AdminPopoverDeleteButton onDelete={() => setDeleteTarget(submission)} />
                      </AdminPopoverMenu>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-midGray text-xs">제출 항목이 설정된 최신 순서대로 표시됩니다.</p>

      <Dialog open={modalState !== null} onOpenChange={(open) => !open && setModalState(null)}>
        {modalState &&
          (modalState.mode === 'create' ? (
            <SubmissionFormModal
              mode="create"
              tracks={tracks}
              onSubmit={handleSubmit}
              onClose={() => setModalState(null)}
            />
          ) : editSetting ? (
            <SubmissionFormModal
              mode="edit"
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
          />
        )}
      </Dialog>
    </div>
  );
};

const FormModalLoading = () => (
  <DialogContent className="w-[600px] max-w-[92vw] items-stretch gap-5">
    <DialogTitle className="text-xl font-bold text-gray-900">제출 항목 수정</DialogTitle>
    <p className="text-midGray py-10 text-center text-sm">설정값을 불러오고 있어요.</p>
  </DialogContent>
);
