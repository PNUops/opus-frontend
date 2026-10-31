import Input from '@components/Input';
import { AdminResponsiveList } from '@components/admin/AdminResponsiveList';
import { AdminMobileFilters } from '@components/admin/AdminMobileFilters';
import { ReactNode, useMemo, useState } from 'react';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { Clock, Download, Eye, MessageSquare, RefreshCw, Search, Users } from 'lucide-react';
import type { SubmissionFileResponseDto } from '@dto/submissionDto';

import { AdminFilterSelect as FilterDropDown } from '@components/admin/AdminFilterSelect';
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
        <AdminMobileFilters
          title="제출 현황 필터"
          onReset={handleReset}
          fields={[
            {
              id: 'type',
              label: '제출 항목',
              value: typeFilter,
              options: typeOptions,
              onChange: (value) => {
                setTypeFilter(value);
                resetToFirstPage();
              },
            },
            {
              id: 'status',
              label: '제출 상태',
              value: statusFilter,
              options: SUBMISSION_STATUS_FILTER_OPTIONS,
              onChange: (value) => {
                setStatusFilter(value as StatusFilter);
                resetToFirstPage();
              },
            },
            {
              id: 'track',
              label: '분과',
              value: trackFilter,
              options: trackOptions,
              onChange: (value) => {
                setTrackFilter(value);
                resetToFirstPage();
              },
            },
          ]}
        >
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
        </AdminMobileFilters>
        <div className="relative min-w-0 flex-1">
          <Search size={16} className="text-midGray absolute top-1/2 left-3 -translate-y-1/2" />
          <Input
            appearance="admin"
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              resetToFirstPage();
            }}
            placeholder="팀 이름으로 검색"
            aria-label="팀 이름으로 검색"
            className="w-full pl-9 text-sm"
          />
        </div>
        <button
          type="button"
          onClick={handleReset}
          aria-label="필터 초기화"
          className="border-lightGray hover:bg-whiteGray focus-visible:outline-mainBlue hidden size-11 items-center justify-center rounded-md border text-neutral-600 transition-colors focus-visible:outline-2 sm:flex"
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
          subClass="text-neutral-700"
        />
        <StatCard
          label="미제출"
          value={`${stats.notSubmitted}팀`}
          sub={`${percent(stats.notSubmitted, stats.total)}%`}
          icon={<Clock size={18} />}
          iconClass="bg-yellow-50 text-yellow-600"
          subClass="text-neutral-700"
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
      <AdminResponsiveList
        label="제출 현황 목록"
        items={pagedRows}
        getKey={(submission) => `${submission.teamId}-${submission.submissionItemName}`}
        primaryKey="team"
        emptyText="제출 현황이 없어요."
        tableClassName="min-w-[900px]"
        columns={[
          { key: 'team', label: '팀 이름', render: (submission) => submission.teamName },
          { key: 'track', label: '분과', render: (submission) => submission.trackName },
          { key: 'item', label: '제출 항목', render: (submission) => submission.submissionItemName },
          {
            key: 'status',
            label: '제출 상태',
            render: (submission) => <SubmissionStatusBadge status={submission.status} />,
          },
          {
            key: 'first',
            label: '최초 제출일시',
            render: (submission) => formatDateTime(submission.firstSubmittedAt),
            className: 'whitespace-nowrap',
          },
          {
            key: 'last',
            label: '최근 수정일시',
            render: (submission) => formatDateTime(submission.lastModifiedAt),
            className: 'whitespace-nowrap',
          },
        ]}
        actions={(submission) => (
          <>
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
              icon={<Download size={16} />}
              disabled={submission.submissionId === null}
              onClick={() => handleDownloadSubmission(submission)}
            />
          </>
        )}
      />

      {/* 하단 */}
      <div className="flex items-center justify-between">
        <p className="shrink-0 text-sm text-neutral-600">전체 {filtered.length.toLocaleString()}건</p>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {/* 상세보기 Drawer */}
      <Sheet open={detailTarget !== null} onOpenChange={(open) => !open && setDetailTarget(null)}>
        <SheetContent className="w-full gap-0 p-0 sm:max-w-md">
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
        <SheetContent className="w-full gap-0 p-0 sm:max-w-md">
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

const StatCard = ({ label, value, sub, icon, iconClass, subClass = 'text-neutral-600' }: StatCardProps) => {
  return (
    <div className="border-lightGray flex items-center justify-between rounded-xl border p-4">
      <div className="flex flex-col gap-1">
        <span className="text-xs text-neutral-600">{label}</span>
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
    <div className="flex flex-1 items-center justify-center text-sm text-neutral-600">제출 정보를 불러오고 있어요.</div>
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
        'focus-visible:outline-mainBlue flex size-11 items-center justify-center rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-40',
        variant === 'solid' ? 'bg-mainBlue text-white hover:bg-blue-800' : 'text-mainBlue bg-blue-50 hover:bg-blue-100',
      )}
    >
      {icon}
    </button>
  );
};
