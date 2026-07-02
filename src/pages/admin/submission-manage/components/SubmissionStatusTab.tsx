import { ReactNode, useMemo, useState } from 'react';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { Clock, Download, Eye, MessageSquare, RefreshCw, Search, Users } from 'lucide-react';
import type { SubmissionFileResponseDto } from '@dto/submissionDto';

import FilterDropDown from '@components/FilterDropDown';
import Pagination from '@components/Pagination';
import { Sheet, SheetContent, SheetTitle } from '@components/ui/sheet';
import { useToast } from '@hooks/useToast';
import { useContestIdOrRedirect } from '@hooks/useId';
import { cn } from '@components/lib/utils';
import { getFeedbackFileDownload, getSubmissionFileDownload, getSubmissionFilesDownload } from '@apis/submission';
import { submissionDetailOption, submissionFeedbacksOption, submissionStatusesOption } from '@queries/submission';
import { downloadFromResponse } from '@utils/download';
import { getApiErrorMessage } from '@utils/error';
import { SUBMISSION_STATUS_FILTER_OPTIONS } from '@constants/submission';
import type { SubmissionStatus, SubmissionStatusResponseDto } from '@dto/submissionDto';

import { SubmissionStatusBadge } from './SubmissionBadges';
import { SubmissionDetailDrawer } from './SubmissionDetailDrawer';
import { SubmissionFeedbackDrawer } from './SubmissionFeedbackDrawer';

const TABLE_HEADERS = ['팀 이름', '분과', '제출 항목', '제출 상태', '최초 제출일시', '최종 제출일시'];
const PAGE_SIZE = 10;

type StatusFilter = SubmissionStatus | '';

const formatDateTime = (value: string | null) => (value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '-');

const toNameOptions = (values: string[], placeholder: string) => [
  { label: placeholder, value: '' },
  ...[...new Set(values)].map((v) => ({ label: v, value: v })),
];

const percent = (count: number, total: number) => (total === 0 ? 0 : Math.round((count / total) * 1000) / 10);

interface SubmissionStatusTabProps {
  /** 제출물 설정 탭에서 "제출 현황 보기"로 진입 시 초기 제출물 필터 (제출물 종류명) */
  initialTypeFilter?: string;
}

export const SubmissionStatusTab = ({ initialTypeFilter = '' }: SubmissionStatusTabProps) => {
  const toast = useToast();
  const contestId = useContestIdOrRedirect();
  const [typeFilter, setTypeFilter] = useState(initialTypeFilter);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('');
  const [trackFilter, setTrackFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [detailTarget, setDetailTarget] = useState<SubmissionStatusResponseDto | null>(null);
  const [feedbackTarget, setFeedbackTarget] = useState<SubmissionStatusResponseDto | null>(null);

  // 제출 현황 전체 목록 (필터·페이지네이션은 아래 State에서 처리)
  const { data: submissions } = useSuspenseQuery(submissionStatusesOption(contestId));

  // 제출 상세 조회 (상세보기 / 피드백 Drawer 공용)
  const { data: detailData } = useQuery(submissionDetailOption(contestId, detailTarget?.submissionId ?? 0));
  const { data: feedbackDetailData } = useQuery(submissionDetailOption(contestId, feedbackTarget?.submissionId ?? 0));
  const { data: feedbacks = [] } = useQuery(submissionFeedbacksOption(contestId, feedbackTarget?.submissionId ?? 0));

  // 제출 파일 단건 다운로드
  const handleDownloadFile = async (submissionId: number, file: SubmissionFileResponseDto) => {
    try {
      const response = await getSubmissionFileDownload(contestId, submissionId, file.fileId);
      downloadFromResponse(response, file.fileName);
    } catch (error) {
      toast(getApiErrorMessage(error, '파일 다운로드에 실패했어요.'), 'error');
    }
  };

  // 제출물 파일 전체 다운로드 (zip)
  const handleDownloadSubmission = async (submission: SubmissionStatusResponseDto) => {
    if (submission.submissionId === null) return;
    try {
      const response = await getSubmissionFilesDownload(contestId, submission.submissionId);
      downloadFromResponse(response, `${submission.teamName}_${submission.submissionItemName}.zip`);
    } catch (error) {
      toast(getApiErrorMessage(error, '제출물 다운로드에 실패했어요.'), 'error');
    }
  };

  // 피드백 첨부파일 단건 다운로드
  const handleDownloadFeedbackFile = async (
    submissionId: number,
    feedbackId: number,
    file: SubmissionFileResponseDto,
  ) => {
    try {
      const response = await getFeedbackFileDownload(contestId, submissionId, feedbackId, file.fileId);
      downloadFromResponse(response, file.fileName);
    } catch (error) {
      toast(getApiErrorMessage(error, '파일 다운로드에 실패했어요.'), 'error');
    }
  };

  const typeOptions = useMemo(
    () =>
      toNameOptions(
        submissions.map((s) => s.submissionItemName),
        '제출 항목',
      ),
    [submissions],
  );
  const trackOptions = useMemo(
    () =>
      toNameOptions(
        submissions.map((s) => s.trackName),
        '분과',
      ),
    [submissions],
  );

  const stats = useMemo(() => {
    const total = submissions.length;
    const submitted = submissions.filter((s) => s.status === 'SUBMITTED').length;
    const late = submissions.filter((s) => s.status === 'LATE').length;
    const notSubmitted = submissions.filter(
      (s) => s.status === 'NOT_SUBMITTED' || s.status === 'NOT_SUBMITTED_AFTER_DEADLINE',
    ).length;
    return { total, submitted, late, notSubmitted };
  }, [submissions]);

  const filtered = useMemo(
    () =>
      submissions.filter(
        (s) =>
          (typeFilter === '' || s.submissionItemName === typeFilter) &&
          (statusFilter === '' || s.status === statusFilter) &&
          (trackFilter === '' || s.trackName === trackFilter) &&
          (search === '' || s.teamName?.toLowerCase().includes(search.trim().toLowerCase())),
      ),
    [submissions, typeFilter, statusFilter, trackFilter, search],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedRows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const resetToFirstPage = () => setPage(1);

  const handleReset = () => {
    setTypeFilter('');
    setStatusFilter('');
    setTrackFilter('');
    setSearch('');
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* 필터 */}
      <div className="flex flex-wrap items-center gap-2">
        <FilterDropDown
          variant="select"
          label={typeOptions.find((o) => o.value === typeFilter)?.label ?? '제출 항목'}
          value={typeFilter}
          options={typeOptions}
          onChange={(v) => {
            setTypeFilter(v);
            resetToFirstPage();
          }}
        />
        <FilterDropDown<StatusFilter>
          variant="select"
          label={SUBMISSION_STATUS_FILTER_OPTIONS.find((o) => o.value === statusFilter)?.label ?? '제출 상태'}
          value={statusFilter}
          options={SUBMISSION_STATUS_FILTER_OPTIONS}
          onChange={(v) => {
            setStatusFilter(v);
            resetToFirstPage();
          }}
        />
        <FilterDropDown
          variant="select"
          label={trackOptions.find((o) => o.value === trackFilter)?.label ?? '분과'}
          value={trackFilter}
          options={trackOptions}
          onChange={(v) => {
            setTrackFilter(v);
            resetToFirstPage();
          }}
        />
        <div className="relative flex-1">
          <Search size={16} className="text-midGray absolute top-1/2 left-3 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              resetToFirstPage();
            }}
            placeholder="팀 이름으로 검색"
            className="border-lightGray placeholder:text-midGray h-9 w-full rounded-md border pr-3 pl-9 text-sm focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={handleReset}
          aria-label="필터 초기화"
          className="border-lightGray text-midGray flex h-9 w-9 items-center justify-center rounded-md border transition-colors hover:bg-gray-100"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="전체 팀"
          value={`${stats.total}팀`}
          sub="등록 팀 기준"
          icon={<Users size={18} />}
          iconClass="bg-blue-50 text-mainBlue"
        />
        <StatCard
          label="제출 완료"
          value={`${stats.submitted}팀`}
          sub={`${percent(stats.submitted, stats.total)}%`}
          icon={<Clock size={18} />}
          iconClass="bg-subGreen text-mainGreen"
          subClass="text-mainGreen"
        />
        <StatCard
          label="미제출"
          value={`${stats.notSubmitted}팀`}
          sub={`${percent(stats.notSubmitted, stats.total)}%`}
          icon={<Clock size={18} />}
          iconClass="bg-yellow-50 text-yellow-600"
          subClass="text-yellow-600"
        />
        <StatCard
          label="지각 제출"
          value={`${stats.late}팀`}
          sub={`${percent(stats.late, stats.total)}%`}
          icon={<Clock size={18} />}
          iconClass="bg-blue-50 text-mainBlue"
          subClass="text-mainBlue"
        />
      </div>

      {/* 리스트 */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse">
          <thead>
            <tr className="border-lightGray border-b">
              {TABLE_HEADERS.map((header) => (
                <th key={header} className="px-4 py-3 text-left text-sm font-medium whitespace-nowrap">
                  {header}
                </th>
              ))}
              <th className="px-4 py-3 text-center text-sm font-medium whitespace-nowrap">작업</th>
            </tr>
          </thead>
          <tbody>
            {pagedRows.length === 0 ? (
              <tr>
                <td colSpan={TABLE_HEADERS.length + 1} className="text-midGray py-12 text-center text-sm">
                  제출 현황이 없어요.
                </td>
              </tr>
            ) : (
              pagedRows.map((submission) => (
                <tr
                  key={`${submission.teamId}-${submission.submissionItemName}`}
                  className="border-lightGray border-b last:border-b-0"
                >
                  <td className="text-darkGray px-4 py-4 text-sm font-medium whitespace-nowrap">
                    {submission.teamName}
                  </td>
                  <td className="px-4 py-4 text-sm whitespace-nowrap">{submission.trackName}</td>
                  <td className="px-4 py-4 text-sm whitespace-nowrap">{submission.submissionItemName}</td>
                  <td className="px-4 py-4">
                    <SubmissionStatusBadge status={submission.status} />
                  </td>
                  <td className="px-4 py-4 text-sm whitespace-nowrap">{formatDateTime(submission.firstSubmittedAt)}</td>
                  <td className="px-4 py-4 text-sm whitespace-nowrap">{formatDateTime(submission.lastModifiedAt)}</td>
                  <td className="px-4 py-4">
                    <div className="flex justify-center gap-1.5">
                      <ActionIconButton
                        label="상세보기"
                        icon={<Eye size={16} />}
                        disabled={submission.submissionId === null}
                        onClick={() => setDetailTarget(submission)}
                      />
                      <ActionIconButton
                        label="피드백"
                        icon={<MessageSquare size={16} />}
                        disabled={submission.submissionId === null}
                        onClick={() => setFeedbackTarget(submission)}
                      />
                      <ActionIconButton
                        label="다운로드"
                        variant="solid"
                        disabled={submission.submissionId === null}
                        icon={<Download size={16} />}
                        onClick={() => handleDownloadSubmission(submission)}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 하단 */}
      <div className="flex items-center justify-between">
        <p className="text-midGray shrink-0 text-sm">전체 {filtered.length.toLocaleString()}건</p>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {/* 상세보기 Drawer */}
      <Sheet open={detailTarget !== null} onOpenChange={(open) => !open && setDetailTarget(null)}>
        <SheetContent className="gap-0 p-0">
          {detailTarget &&
            (detailData ? (
              <SubmissionDetailDrawer
                detail={detailData}
                onViewFeedbacks={() => {
                  setFeedbackTarget(detailTarget);
                  setDetailTarget(null);
                }}
                onDownloadFile={(file) => handleDownloadFile(detailTarget.submissionId ?? 0, file)}
              />
            ) : (
              <DrawerLoading />
            ))}
        </SheetContent>
      </Sheet>

      {/* 피드백 Drawer */}
      <Sheet open={feedbackTarget !== null} onOpenChange={(open) => !open && setFeedbackTarget(null)}>
        <SheetContent className="gap-0 p-0">
          {feedbackTarget &&
            (feedbackDetailData ? (
              <SubmissionFeedbackDrawer
                detail={feedbackDetailData}
                feedbacks={feedbacks}
                onDownloadFile={(feedbackId, file) =>
                  handleDownloadFeedbackFile(feedbackTarget.submissionId ?? 0, feedbackId, file)
                }
              />
            ) : (
              <DrawerLoading />
            ))}
        </SheetContent>
      </Sheet>
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: string;
  sub: string;
  icon: ReactNode;
  iconClass: string;
  subClass?: string;
}

const StatCard = ({ label, value, sub, icon, iconClass, subClass = 'text-midGray' }: StatCardProps) => {
  return (
    <div className="border-lightGray flex items-center justify-between rounded-xl border p-4">
      <div className="flex flex-col gap-1">
        <span className="text-midGray text-xs">{label}</span>
        <span className="text-darkGray text-xl font-bold">{value}</span>
        <span className={cn('text-xs font-medium', subClass)}>{sub}</span>
      </div>
      <div className={cn('flex h-9 w-9 items-center justify-center rounded-full', iconClass)}>{icon}</div>
    </div>
  );
};

interface ActionIconButtonProps {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  variant?: 'soft' | 'solid';
  disabled?: boolean;
}

const DrawerLoading = () => (
  <div className="flex h-full flex-col">
    <div className="border-lightGray flex items-center gap-2 border-b px-5 py-4">
      <SheetTitle className="text-base font-semibold">불러오는 중...</SheetTitle>
    </div>
    <div className="text-midGray flex flex-1 items-center justify-center text-sm">제출 정보를 불러오고 있어요.</div>
  </div>
);

const ActionIconButton = ({ label, icon, onClick, variant = 'soft', disabled = false }: ActionIconButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-md transition-colors disabled:opacity-40',
        variant === 'solid' ? 'bg-mainBlue text-white hover:bg-blue-800' : 'text-mainBlue bg-blue-50 hover:bg-blue-100',
      )}
    >
      {icon}
    </button>
  );
};
