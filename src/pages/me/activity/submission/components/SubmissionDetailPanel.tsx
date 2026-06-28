import { ReactNode, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CalendarDays, Clock, Eye, FileCheck } from 'lucide-react';

import { Dialog } from '@components/ui/dialog';
import { useToast } from '@hooks/useToast';
import { getFeedbackFileDownload, getSubmissionFileDownload } from '@apis/submission';
import { submissionDetailOption, submissionFeedbacksOption } from '@queries/submission';
import { downloadFromResponse } from '@utils/download';
import { getApiErrorMessage } from '@utils/error';
import type { ConfirmMemoResponseDto, MySubmissionListItemDto } from '@dto/meDto';
import type { SubmissionFileResponseDto } from '@dto/submissionDto';
import { VISIBILITY_LABEL } from '@constants/submission';

import { SubmissionUploadModal } from '../../components/SubmissionUploadModal';
import { getMockSubmissionSetting } from '../mocks/mockMySubmission';
import { formatDateTimeWithDay } from '../utils/format';
import { FeedbackList } from './FeedbackList';
import { ConfirmMemo } from './ConfirmMemo';
import { FileChips } from './FileChips';
import { StatusBadge } from './StatusBadge';

interface SubmissionDetailPanelProps {
  contestId: number;
  item: MySubmissionListItemDto;
  memo: ConfirmMemoResponseDto | null;
  onSaveMemo: (content: string) => void;
  onDeleteMemo: () => void;
}

export const SubmissionDetailPanel = ({
  contestId,
  item,
  memo,
  onSaveMemo,
  onDeleteMemo,
}: SubmissionDetailPanelProps) => {
  const toast = useToast();
  const [uploadOpen, setUploadOpen] = useState(false);

  // 제출물 설정값 확인 API에서 시작/마감일시, 지각 제출, 공개 범위, 파일 제약을 가져옴
  const setting = getMockSubmissionSetting(item.submissionItemId);

  // 제출물 상세 조회 — 제출 ID가 있을 때만 (미제출이면 최초 제출 플로우)
  const { data: detail } = useQuery(submissionDetailOption(contestId, item.submissionId ?? 0));
  const files = detail?.files ?? [];

  // 피드백 목록 조회
  const { data: feedbacks = [] } = useQuery(submissionFeedbacksOption(contestId, item.submissionId ?? 0));

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
    <div className="border-subGreen flex flex-col gap-6 rounded-xl border bg-green-50/30 p-5">
      {/* 제출물 정보 */}
      <section className="flex flex-col gap-4 rounded-xl bg-white p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h4 className="text-darkGray text-base font-bold">{item.submissionTypeName}</h4>
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
          <InfoItem icon={<CalendarDays size={16} />} label="시작일시" value={formatDateTimeWithDay(setting.startAt)} />
          <InfoItem icon={<CalendarDays size={16} />} label="마감일시" value={formatDateTimeWithDay(setting.endAt)} />
          <InfoItem
            icon={<FileCheck size={16} />}
            label="지각 제출"
            value={setting.allowLateSubmission ? '허용함' : '허용 안 함'}
          />
          <InfoItem icon={<Eye size={16} />} label="공개 범위" value={VISIBILITY_LABEL[setting.visibility]} />
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
        <ConfirmMemo memo={memo} onSave={onSaveMemo} onDelete={onDeleteMemo} />
      </section>

      {/* 제출물 업로드 모달 */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        {uploadOpen && (
          <SubmissionUploadModal
            contestId={contestId}
            submissionItemId={item.submissionItemId}
            submissionId={item.submissionId}
            submissionTypeName={item.submissionTypeName}
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
