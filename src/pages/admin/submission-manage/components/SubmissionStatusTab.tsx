import { ReactNode, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { Clock, Download, Eye, MessageSquare, RefreshCw, Search, Users } from 'lucide-react';
import type { SubmissionFileResponseDto } from '@dto/submissionDto';

import FilterDropDown from '@components/FilterDropDown';
import Pagination from '@components/Pagination';
import { Sheet, SheetContent } from '@components/ui/sheet';
import { useToast } from '@hooks/useToast';
import { cn } from '@components/lib/utils';
import { SUBMISSION_STATUS_FILTER_OPTIONS } from '@constants/submission';
import type { SubmissionStatus, SubmissionStatusResponseDto } from '@dto/submissionDto';

import { buildMockComments, buildMockSubmissionDetail, MOCK_SUBMISSION_STATUSES } from '../mocks/mockSubmissions';
import { SubmissionStatusBadge } from './SubmissionBadges';
import { SubmissionDetailDrawer } from './SubmissionDetailDrawer';
import { SubmissionCommentDrawer } from './SubmissionCommentDrawer';

const TABLE_HEADERS = ['팀 이름', '분과', '제출물 항목', '제출 상태', '최초 제출일시', '최종 제출일시'];
const PAGE_SIZE = 10;

type StatusFilter = SubmissionStatus | '';

const formatDateTime = (value: string | null) => (value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '-');

const toNameOptions = (values: string[], placeholder: string) => [
  { label: placeholder, value: '' },
  ...[...new Set(values)].map((v) => ({ label: v, value: v })),
];

const percent = (count: number, total: number) => (total === 0 ? 0 : Math.round((count / total) * 1000) / 10);

export const SubmissionStatusTab = () => {
  const toast = useToast();
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('');
  const [trackFilter, setTrackFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [detailTarget, setDetailTarget] = useState<SubmissionStatusResponseDto | null>(null);
  const [commentTarget, setCommentTarget] = useState<SubmissionStatusResponseDto | null>(null);

  // TODO: API 연동 시 목데이터 대체
  const submissions = MOCK_SUBMISSION_STATUSES;

  const typeOptions = useMemo(
    () =>
      toNameOptions(
        submissions.map((s) => s.submissionTypeName),
        '제출물',
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
          (typeFilter === '' || s.submissionTypeName === typeFilter) &&
          (statusFilter === '' || s.status === statusFilter) &&
          (trackFilter === '' || s.trackName === trackFilter) &&
          (search === '' || s.teamName.toLowerCase().includes(search.trim().toLowerCase())),
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
          label={typeOptions.find((o) => o.value === typeFilter)?.label ?? '제출물'}
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
                <tr key={submission.teamId} className="border-lightGray border-b last:border-b-0">
                  <td className="text-darkGray px-4 py-4 text-sm font-medium whitespace-nowrap">
                    {submission.teamName}
                  </td>
                  <td className="px-4 py-4 text-sm whitespace-nowrap">{submission.trackName}</td>
                  <td className="px-4 py-4 text-sm whitespace-nowrap">{submission.submissionTypeName}</td>
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
                        label="코멘트"
                        icon={<MessageSquare size={16} />}
                        disabled={submission.submissionId === null}
                        onClick={() => setCommentTarget(submission)}
                      />
                      <ActionIconButton
                        label="다운로드"
                        variant="solid"
                        disabled={submission.submissionId === null}
                        icon={<Download size={16} />}
                        onClick={() => toast('제출물을 다운로드했습니다.', 'success')}
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
          {detailTarget && (
            <SubmissionDetailDrawer
              detail={buildMockSubmissionDetail(detailTarget)}
              onViewComments={() => {
                setCommentTarget(detailTarget);
                setDetailTarget(null);
              }}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* 코멘트 Drawer */}
      <Sheet open={commentTarget !== null} onOpenChange={(open) => !open && setCommentTarget(null)}>
        <SheetContent className="gap-0 p-0">
          {commentTarget && (
            <SubmissionCommentDrawer
              detail={buildMockSubmissionDetail(commentTarget)}
              comments={buildMockComments(commentTarget)}
              onDownloadFile={(file: SubmissionFileResponseDto) =>
                toast(`${file.fileName} 다운로드를 시작합니다.`, 'success')
              }
            />
          )}
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
