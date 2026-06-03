import { useMemo, useState } from 'react';
import dayjs from 'dayjs';

import {
  AdminActionButton,
  AdminDeleteConfirmModal,
  AdminPopoverDeleteButton,
  AdminPopoverEditButton,
  AdminPopoverMenu,
} from '@components/admin';
import FilterDropDown from '@components/FilterDropDown';
import { Dialog } from '@components/ui/dialog';
import { useToast } from '@hooks/useToast';

import { OPERATION_STATUS_FILTER_OPTIONS, VISIBILITY_LABEL } from '@constants/submission';
import { MOCK_SUBMISSIONS, MOCK_TRACKS } from '../mocks/mockSubmissions';
import type {
  SubmissionItemRequestDto,
  SubmissionItemResponseDto,
  SubmissionOperationStatus,
} from '@dto/submissionDto';
import type { SubmissionFormValues } from '../types/submission';
import { AllowLateBadge, OperationStatusBadge } from './SubmissionBadges';
import { SubmissionFormModal } from './SubmissionFormModal';

type ModalState = { mode: 'create' } | { mode: 'edit'; item: SubmissionItemResponseDto } | null;

/** 수정 모달 진입 시 행 데이터를 폼 값으로 변환 (목데이터에 없는 항목은 기본값) */
const toFormValues = (item: SubmissionItemResponseDto): SubmissionFormValues => ({
  name: item.name,
  trackId: MOCK_TRACKS.find((track) => track.trackName === item.trackName)?.trackId ?? null,
  description: '',
  fileFormat: null,
  maxFileSizeMb: 500,
  maxFileCount: 1,
  startAt: item.startAt,
  endAt: item.endAt,
  allowLateSubmission: item.allowLateSubmission,
  visibility: item.visibility,
});

type StatusFilter = SubmissionOperationStatus | '';

const TABLE_HEADERS = ['운영 상태', '제출물 종류', '분과', '시작일시', '마감일시', '지각 제출 허용', '공개 범위', ''];

const formatDateTime = (value: string) => dayjs(value).format('YYYY-MM-DD HH:mm');

interface SubmissionSettingTabProps {
  // "제출 현황 보기" 클릭 시 제출 현황 탭으로 이동
  onViewStatus: (submissionId: number) => void;
}

export const SubmissionSettingTab = ({ onViewStatus }: SubmissionSettingTabProps) => {
  const toast = useToast();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('');
  const [modalState, setModalState] = useState<ModalState>(null);
  const [deleteTarget, setDeleteTarget] = useState<SubmissionItemResponseDto | null>(null);

  // TODO: API 연동 시 목데이터 대체
  const submissions = MOCK_SUBMISSIONS;

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
    // TODO: API 연동 (삭제)
    toast('제출물을 삭제했어요.', 'success');
    setDeleteTarget(null);
  };

  const handleSubmit = (payload: SubmissionItemRequestDto) => {
    // TODO: API 연동 (생성/수정)
    toast(modalState?.mode === 'edit' ? '제출물을 수정했어요.' : '제출물을 추가했어요.', 'success');
    setModalState(null);
    void payload;
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <FilterDropDown<StatusFilter>
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
          + 제출물 추가
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
                  등록된 제출물이 없어요.
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
                      onClick={() => onViewStatus(submission.contestSubmissionItemId)}
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

      <p className="text-midGray text-xs">제출물이 설정된 최신 순서대로 표시됩니다.</p>

      <Dialog open={modalState !== null} onOpenChange={(open) => !open && setModalState(null)}>
        {modalState && (
          <SubmissionFormModal
            mode={modalState.mode}
            tracks={MOCK_TRACKS}
            initialValues={modalState.mode === 'edit' ? toFormValues(modalState.item) : undefined}
            onSubmit={handleSubmit}
            onClose={() => setModalState(null)}
          />
        )}
      </Dialog>

      <Dialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        {deleteTarget && (
          <AdminDeleteConfirmModal
            title={`'${deleteTarget.name}' 제출물을 삭제하시겠어요?`}
            onDelete={handleDeleteConfirm}
          />
        )}
      </Dialog>
    </div>
  );
};
