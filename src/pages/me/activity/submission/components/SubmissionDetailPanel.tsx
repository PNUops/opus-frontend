import { ReactNode, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, Clock, Eye, FileCheck } from 'lucide-react';

import { Dialog } from '@components/ui/dialog';
import { useToast } from '@hooks/useToast';
import {
  deleteConfirmMemo,
  getFeedbackFileDownload,
  getSubmissionFileDownload,
  patchConfirmMemo,
  postConfirmMemo,
} from '@apis/submission';
import {
  confirmMemoOption,
  submissionDetailOption,
  submissionFeedbacksOption,
  submissionItemSettingOption,
} from '@queries/submission';
import { downloadFromResponse } from '@utils/download';
import { getApiErrorMessage } from '@utils/error';
import type { MySubmissionListItemDto } from '@dto/meDto';
import type { SubmissionFileResponseDto } from '@dto/submissionDto';
import { VISIBILITY_LABEL } from '@constants/submission';

import { SubmissionUploadModal } from '../../components/SubmissionUploadModal';
import { formatDateTimeWithDay } from '../utils/format';
import { FeedbackList } from './FeedbackList';
import { ConfirmMemo } from './ConfirmMemo';
import { FileChips } from './FileChips';
import { StatusBadge } from './StatusBadge';

interface SubmissionDetailPanelProps {
  contestId: number;
  teamId: number;
  item: MySubmissionListItemDto;
}

export const SubmissionDetailPanel = ({ contestId, teamId, item }: SubmissionDetailPanelProps) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [uploadOpen, setUploadOpen] = useState(false);

  // 제출 항목 설정값 조회 — 시작/마감일시, 지각 제출, 공개 범위, 파일 제약
  const { data: setting } = useQuery(submissionItemSettingOption(contestId, item.submissionItemId));

  // 제출물 상세 조회 — 제출 ID가 있을 때만 (미제출이면 최초 제출 플로우)
  const { data: detail } = useQuery(submissionDetailOption(contestId, item.submissionId ?? 0));
  const files = detail?.files ?? [];

  // 피드백 목록 조회
  const { data: feedbacks = [] } = useQuery(submissionFeedbacksOption(contestId, item.submissionId ?? 0));

  // 확인 메모 조회 — 제출된 항목에만 메모 작성 가능
  const { data: memo = null, isLoading: isMemoLoading } = useQuery(
    confirmMemoOption(contestId, teamId, item.submissionId ?? 0),
  );

  const invalidateMemo = () =>
    queryClient.invalidateQueries(confirmMemoOption(contestId, teamId, item.submissionId ?? 0));

  const saveMemoMutation = useMutation({
    mutationFn: (content: string) =>
      memo
        ? patchConfirmMemo(contestId, teamId, item.submissionId ?? 0, content)
        : postConfirmMemo(contestId, teamId, item.submissionId ?? 0, content),
    onSuccess: () => {
      invalidateMemo();
      toast(memo ? '메모를 수정했어요.' : '메모를 저장했어요.', 'success');
    },
    onError: (error) => toast(getApiErrorMessage(error, '메모 저장에 실패했어요.'), 'error'),
  });

  const deleteMemoMutation = useMutation({
    mutationFn: () => deleteConfirmMemo(contestId, teamId, item.submissionId ?? 0),
    onSuccess: () => {
      invalidateMemo();
      toast('메모를 삭제했어요.', 'success');
    },
    onError: (error) => toast(getApiErrorMessage(error, '메모 삭제에 실패했어요.'), 'error'),
  });

  const handleSaveMemo = (content: string) => {
    if (item.submissionId === null) {
      toast('제출 후 메모를 작성할 수 있어요.', 'error');
      return;
    }
    saveMemoMutation.mutate(content);
  };

  // 제출 파일 단건 다운로드
  const handleDownloadFile = async (file: SubmissionFileResponseDto) => {
    if (item.submissionId === null) return;
    try {
      const response = await getSubmissionFileDownload(contestId, item.submissionId, file.fileId);
      downloadFromResponse(response, file.fileName);
    } catch (error) {
      toast(getApiErrorMessage(error, '파일 다운로드에 실패했어요.'), 'error');
    }
  };

  // 피드백 첨부파일 단건 다운로드
  const handleDownloadFeedbackFile = async (feedbackId: number, file: SubmissionFileResponseDto) => {
    if (item.submissionId === null) return;
    try {
      const response = await getFeedbackFileDownload(contestId, item.submissionId, feedbackId, file.fileId);
      downloadFromResponse(response, file.fileName);
    } catch (error) {
      toast(getApiErrorMessage(error, '파일 다운로드에 실패했어요.'), 'error');
    }
  };

  return (
    <div className="flex flex-col gap-6 rounded-lg p-5">
      {/* 제출물 정보 */}
      <section className="bg-whiteGray flex flex-col gap-4 rounded-xl p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h4 className="text-darkGray text-base font-bold">{item.submissionItemName}</h4>
            <p className="text-midGray text-sm">{item.description}</p>
          </div>
          <button
            type="button"
            onClick={() => setUploadOpen(true)}
            className="border-mainGreen text-mainGreen shrink-0 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-green-50"
          >
            {item.submissionId === null ? '제출하기' : '다시 제출하기'}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
          <InfoItem
            icon={<CalendarDays size={16} />}
            label="시작일시"
            value={formatDateTimeWithDay(setting?.startAt ?? null)}
          />
          <InfoItem
            icon={<CalendarDays size={16} />}
            label="마감일시"
            value={formatDateTimeWithDay(setting?.endAt ?? null)}
          />
          <InfoItem
            icon={<FileCheck size={16} />}
            label="지각 제출"
            value={setting ? (setting.allowLateSubmission ? '허용함' : '허용 안 함') : '-'}
          />
          <InfoItem
            icon={<Eye size={16} />}
            label="공개 범위"
            value={setting ? VISIBILITY_LABEL[setting.visibility] : '-'}
          />
          <InfoItem
            icon={<Clock size={16} />}
            label="최초 제출일시"
            value={formatDateTimeWithDay(detail?.firstSubmittedAt ?? null)}
          />
          <InfoItem
            icon={<Clock size={16} />}
            label="최종 수정일시"
            value={formatDateTimeWithDay(detail?.lastModifiedAt ?? null)}
          />
          <InfoItem
            icon={<Clock size={16} />}
            label="제출 상태"
            value={<StatusBadge status={detail?.status ?? item.status} />}
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-midGray text-sm">제출 파일</span>
          <FileChips files={files} onDownload={handleDownloadFile} />
        </div>
      </section>

      {/* 피드백 */}
      <section className="flex flex-col gap-3">
        <h4 className="text-darkGray text-base font-bold">피드백</h4>
        <FeedbackList feedbacks={feedbacks} onDownloadFile={handleDownloadFeedbackFile} />
      </section>

      {/* 확인 메모 */}
      <section className="flex flex-col gap-2">
        <h4 className="text-darkGray text-base font-bold">확인 메모 (선택)</h4>
        <p className="text-midGray text-sm">피드백을 확인하고 메모로 정리해 프로젝트 개선에 활용해보세요.</p>
        {isMemoLoading ? (
          <div className="bg-lightGray h-16 w-full animate-pulse rounded-lg" />
        ) : (
          <ConfirmMemo memo={memo} onSave={handleSaveMemo} onDelete={() => deleteMemoMutation.mutate()} />
        )}
      </section>

      {/* 제출물 업로드 모달 */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        {uploadOpen && setting && (
          <SubmissionUploadModal
            contestId={contestId}
            submissionItemId={item.submissionItemId}
            teamId={teamId}
            submissionId={item.submissionId}
            submissionItemName={item.submissionItemName}
            description={item.description}
            setting={setting}
            existingFiles={files}
            onClose={() => setUploadOpen(false)}
          />
        )}
      </Dialog>
    </div>
  );
};

const InfoItem = ({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) => {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-midGray shrink-0">{icon}</span>
      <span className="text-midGray w-24 shrink-0">{label}</span>
      <span className="text-darkGray">{value}</span>
    </div>
  );
};
