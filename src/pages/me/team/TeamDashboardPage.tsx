import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { ChevronRight, ExternalLink, PencilLine, RefreshCw } from 'lucide-react';

import { NoData } from '@components/NoData';
import { cn } from '@components/lib/utils';
import { SUBMISSION_STATUS_META } from '@constants/submission';
import { useContestIdOrRedirect, useTeamIdOrRedirect } from '@hooks/useId';
import { teamDetailOption } from '@queries/team';
import { teamDashboardSummaryOption, upcomingSubmissionsOption } from '@queries/teamDashboard';
import type { TeamDetailDto } from '@dto/teams/teamsDto';
import type {
  TeamDashboardFeedbackSummaryDto,
  TeamDashboardSubmissionSummaryDto,
  UpcomingSubmissionItemResponseDto,
  UpcomingSubmissionStatus,
} from '@dto/teamDashboardDto';

const EMPTY_SUBMISSION_SUMMARY: TeamDashboardSubmissionSummaryDto = {
  requiredCount: 0,
  nearestDueDate: null,
};

const EMPTY_FEEDBACK_SUMMARY: TeamDashboardFeedbackSummaryDto = {
  unreadCount: 0,
  latestFeedback: null,
};

const formatDateTime = (value?: string | null) => {
  if (!value) {
    return '-';
  }

  const date = dayjs(value);
  return date.isValid() ? date.format('YYYY.MM.DD HH:mm') : '-';
};

const formatCompactDateTime = (value?: string | null) => {
  if (!value) {
    return '-';
  }

  const date = dayjs(value);
  return date.isValid() ? date.format('YYYY-MM-DD HH:mm') : '-';
};

const getStatusMeta = (status: UpcomingSubmissionStatus) => SUBMISSION_STATUS_META[status];

const TeamDashboardPage = () => {
  const contestId = useContestIdOrRedirect('/me/activity');
  const teamId = useTeamIdOrRedirect('/me/activity');

  const teamDetailQuery = useQuery(teamDetailOption(teamId));
  const summaryQuery = useQuery(teamDashboardSummaryOption(contestId, teamId));
  const upcomingQuery = useQuery(upcomingSubmissionsOption(contestId, teamId));

  if (teamDetailQuery.isError || summaryQuery.isError || upcomingQuery.isError) {
    return (
      <TeamDashboardError
        onRetry={() => {
          void teamDetailQuery.refetch();
          void summaryQuery.refetch();
          void upcomingQuery.refetch();
        }}
      />
    );
  }

  const teamDetail = teamDetailQuery.data;
  const dashboardSummary = summaryQuery.data;
  const upcomingSubmissions = upcomingQuery.data ?? [];
  const submissionSummary = dashboardSummary?.submissionSummary ?? EMPTY_SUBMISSION_SUMMARY;
  const feedbackSummary = dashboardSummary?.feedbackSummary ?? EMPTY_FEEDBACK_SUMMARY;
  const latestFeedback = feedbackSummary.latestFeedback;
  const submissionsPath = `/me/contests/${contestId}/teams/${teamId}/submissions`;

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-14 px-4 py-12 sm:px-8 md:px-12 lg:py-20">
      {teamDetailQuery.isLoading || summaryQuery.isLoading ? (
        <ProjectDashboardHeroSkeleton />
      ) : teamDetail && dashboardSummary ? (
        <ProjectDashboardHero
          teamDetail={teamDetail}
          requiredCount={submissionSummary.requiredCount}
          nearestDueDate={submissionSummary.nearestDueDate}
          unreadFeedbackCount={feedbackSummary.unreadCount}
          latestFeedbackLabel={
            latestFeedback ? `${latestFeedback.mentorName} 멘토: ${latestFeedback.content}` : '최근 피드백이 없습니다.'
          }
        />
      ) : (
        <NoData className="border-lightGray my-0 min-h-60 rounded-lg border bg-white text-sm font-medium" />
      )}

      <DashboardSection
        title="다가오는 제출 일정"
        action={
          <Link to={submissionsPath} className={outlineButtonClassName}>
            모든 제출물 보기
            <ChevronRight size={18} />
          </Link>
        }
      >
        {upcomingQuery.isLoading ? (
          <UpcomingSubmissionTableSkeleton />
        ) : (
          <UpcomingSubmissionTable items={upcomingSubmissions} submissionsPath={submissionsPath} />
        )}
      </DashboardSection>

      <DashboardSection
        title="최근 피드백"
        action={
          <Link to={submissionsPath} className={outlineButtonClassName}>
            모든 피드백 보기
            <ChevronRight size={18} />
          </Link>
        }
      >
        {summaryQuery.isLoading ? (
          <LatestFeedbackSkeleton />
        ) : (
          <LatestFeedbackCard
            mentorName={latestFeedback?.mentorName ?? null}
            content={latestFeedback?.content ?? null}
            submissionsPath={submissionsPath}
          />
        )}
      </DashboardSection>

      {teamDetailQuery.isLoading ? (
        <ProjectManageSectionSkeleton />
      ) : teamDetail ? (
        <ProjectManageSection teamDetail={teamDetail} contestId={contestId} teamId={teamId} />
      ) : (
        <DashboardSection title="프로젝트 관리">
          <NoData className="border-lightGray my-0 min-h-28 rounded-lg border bg-white text-sm font-medium" />
        </DashboardSection>
      )}
    </section>
  );
};

export default TeamDashboardPage;

const outlineButtonClassName =
  'border-mainGreen text-mainGreen hover:bg-subGreen inline-flex h-12 items-center justify-center gap-2 rounded-md border px-5 text-sm font-semibold transition-colors';

const ProjectDashboardHero = ({
  teamDetail,
  requiredCount,
  nearestDueDate,
  unreadFeedbackCount,
  latestFeedbackLabel,
}: {
  teamDetail: TeamDetailDto;
  requiredCount: number;
  nearestDueDate?: string | null;
  unreadFeedbackCount: number;
  latestFeedbackLabel: string;
}) => {
  return (
    <header className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 flex-col gap-3">
        <h1 className="truncate text-2xl font-extrabold text-neutral-950" title={teamDetail.projectName ?? ''}>
          {teamDetail.projectName ?? '프로젝트'}
        </h1>
        <div className="flex flex-wrap gap-2">
          <InfoChip>{teamDetail.contestName}</InfoChip>
          {teamDetail.trackName && <InfoChip>{teamDetail.trackName}</InfoChip>}
          {teamDetail.teamName && <InfoChip>{teamDetail.teamName}</InfoChip>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 lg:min-w-[24rem] lg:gap-10">
        <HeroMetric
          label="제출 필요"
          value={`${requiredCount}건`}
          caption="가장 가까운 마감"
          detail={formatDateTime(nearestDueDate)}
        />
        <HeroMetric
          label="읽지 않은 피드백"
          value={`${unreadFeedbackCount}개`}
          caption="최근 피드백"
          detail={latestFeedbackLabel}
        />
      </div>
    </header>
  );
};

const InfoChip = ({ children }: { children: ReactNode }) => {
  return <span className="bg-whiteGray rounded-full px-3 py-1 text-xs text-neutral-700">{children}</span>;
};

const HeroMetric = ({
  label,
  value,
  caption,
  detail,
}: {
  label: string;
  value: string;
  caption: string;
  detail: string;
}) => {
  return (
    <article className="border-mainGreen/40 flex min-h-24 flex-col justify-center border-l-4 pl-6">
      <p className="text-sm font-semibold text-neutral-900">{label}</p>
      <strong className="text-midGray mt-2 text-3xl font-extrabold">{value}</strong>
      <p className="text-midGray mt-3 text-xs">{caption}</p>
      <p className="mt-1 line-clamp-2 text-xs leading-5 text-neutral-800">{detail}</p>
    </article>
  );
};

const DashboardSection = ({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) => {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-extrabold text-neutral-950">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
};

const UpcomingSubmissionTable = ({
  items,
  submissionsPath,
}: {
  items: UpcomingSubmissionItemResponseDto[];
  submissionsPath: string;
}) => {
  if (items.length === 0) {
    return <NoData className="border-lightGray my-0 min-h-45 rounded-lg border bg-white text-sm font-medium" />;
  }

  return (
    <div className="border-lightGray overflow-hidden rounded-lg border bg-white">
      <div className="border-lightGray bg-whiteGray hidden grid-cols-[1.25fr_1fr_1fr_0.85fr_0.75fr] border-b px-6 py-4 text-sm font-bold text-neutral-800 md:grid">
        <span>제출물 항목</span>
        <span>마감일시</span>
        <span>최종 수정일시</span>
        <span className="text-center">제출 상태</span>
        <span className="text-center">작업</span>
      </div>
      <ul className="divide-lightGray divide-y">
        {items.map((item) => (
          <UpcomingSubmissionRow key={item.submissionItemId} item={item} submissionsPath={submissionsPath} />
        ))}
      </ul>
    </div>
  );
};

const UpcomingSubmissionRow = ({
  item,
  submissionsPath,
}: {
  item: UpcomingSubmissionItemResponseDto;
  submissionsPath: string;
}) => {
  const statusMeta = getStatusMeta(item.status);

  return (
    <li className="grid gap-4 px-6 py-5 md:grid-cols-[1.25fr_1fr_1fr_0.85fr_0.75fr] md:items-center">
      <div className="min-w-0">
        <p className="truncate font-semibold text-neutral-950" title={item.submissionItemName}>
          {item.submissionItemName}
        </p>
        <p className="text-midGray mt-1 text-xs md:hidden">마감 {formatCompactDateTime(item.deadlineAt)}</p>
      </div>
      <span className="hidden text-sm text-neutral-900 md:block">{formatCompactDateTime(item.deadlineAt)}</span>
      <span className="text-sm text-neutral-900">
        <span className="text-midGray md:hidden">최종 수정 </span>
        {formatCompactDateTime(item.lastModifiedAt)}
      </span>
      <span className={cn('w-fit rounded-md px-4 py-2 text-sm font-bold md:mx-auto', statusMeta.className)}>
        {statusMeta.label}
      </span>
      <Link to={submissionsPath} className={cn(outlineButtonClassName, 'h-11 px-4')}>
        제출하기
      </Link>
    </li>
  );
};

const LatestFeedbackCard = ({
  mentorName,
  content,
  submissionsPath,
}: {
  mentorName: string | null;
  content: string | null;
  submissionsPath: string;
}) => {
  if (!mentorName || !content) {
    return (
      <article className="border-lightGray flex min-h-45 items-center justify-center rounded-lg border bg-white px-6 py-6">
        <p className="text-midGray text-sm font-bold">최근 피드백이 없습니다.</p>
      </article>
    );
  }

  return (
    <article className="border-lightGray rounded-lg border bg-white px-6 py-6">
      <div className="grid gap-5 lg:grid-cols-[1fr_auto]">
        <div className="flex min-w-0 gap-5">
          <div className="size-13 shrink-0 rounded-full bg-neutral-200" aria-hidden />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-mainBlue font-bold">최근 피드백</span>
              <span className="font-semibold text-neutral-900">{mentorName}</span>
              <span className="bg-whiteGray rounded-md px-2 py-1 text-sm text-neutral-800">멘토</span>
            </div>
            <p className="mt-3 line-clamp-3 text-sm leading-7 text-neutral-900">{content}</p>
          </div>
        </div>
        <div className="flex flex-col items-start gap-6 lg:items-end">
          {/* TODO: 피드백 목록/작성일/첨부파일 수 API가 확정되면 Figma의 날짜와 파일 카운트를 표시한다. */}
          <span className="text-midGray text-sm">-</span>
          <Link to={submissionsPath} className={outlineButtonClassName}>
            제출물에서 보기
            <ChevronRight size={18} />
          </Link>
        </div>
      </div>
    </article>
  );
};

const ProjectManageSection = ({
  teamDetail,
  contestId,
  teamId,
}: {
  teamDetail: TeamDetailDto;
  contestId: number;
  teamId: number;
}) => {
  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-2xl font-extrabold text-neutral-950">프로젝트 관리</h2>
      <div className="flex flex-wrap gap-4">
        {teamDetail.productionPath ? (
          <a href={teamDetail.productionPath} target="_blank" rel="noreferrer" className={outlineButtonClassName}>
            <ExternalLink size={18} />
            배포 페이지 열기
          </a>
        ) : (
          <button type="button" className={cn(outlineButtonClassName, 'opacity-50')} disabled>
            <ExternalLink size={18} />
            배포 페이지 열기
          </button>
        )}
        <Link to={`/contest/${contestId}/teams/edit/${teamId}`} className={outlineButtonClassName}>
          <PencilLine size={18} />
          프로젝트 편집하기
        </Link>
      </div>
    </section>
  );
};

const SkeletonBlock = ({ className }: { className: string }) => {
  return <div className={cn('animate-pulse rounded-md bg-neutral-200', className)} />;
};

const ProjectDashboardHeroSkeleton = () => {
  return (
    <header className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 flex-col gap-3">
        <SkeletonBlock className="h-8 w-3/4 max-w-xl" />
        <div className="flex flex-wrap gap-2">
          <SkeletonBlock className="h-6 w-28 rounded-full" />
          <SkeletonBlock className="h-6 w-24 rounded-full" />
          <SkeletonBlock className="h-6 w-32 rounded-full" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 lg:min-w-[24rem] lg:gap-10">
        <HeroMetricSkeleton />
        <HeroMetricSkeleton />
      </div>
    </header>
  );
};

const HeroMetricSkeleton = () => {
  return (
    <article className="border-mainGreen/20 flex min-h-24 flex-col justify-center border-l-4 pl-6">
      <SkeletonBlock className="h-5 w-24" />
      <SkeletonBlock className="mt-3 h-8 w-20" />
      <SkeletonBlock className="mt-4 h-3 w-28" />
      <SkeletonBlock className="mt-2 h-3 w-full" />
    </article>
  );
};

const UpcomingSubmissionTableSkeleton = () => {
  return (
    <div className="border-lightGray overflow-hidden rounded-lg border bg-white">
      <div className="border-lightGray bg-whiteGray hidden grid-cols-[1.25fr_1fr_1fr_0.85fr_0.75fr] border-b px-6 py-4 md:grid">
        {Array.from({ length: 5 }).map((_, index) => (
          <SkeletonBlock key={index} className="h-4 w-20" />
        ))}
      </div>
      <div className="divide-lightGray divide-y">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="grid gap-4 px-6 py-5 md:grid-cols-[1.25fr_1fr_1fr_0.85fr_0.75fr] md:items-center">
            <SkeletonBlock className="h-5 w-40" />
            <SkeletonBlock className="h-4 w-28" />
            <SkeletonBlock className="h-4 w-28" />
            <SkeletonBlock className="h-9 w-24 md:mx-auto" />
            <SkeletonBlock className="h-11 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
};

const LatestFeedbackSkeleton = () => {
  return (
    <article className="border-lightGray rounded-lg border bg-white px-6 py-6">
      <div className="grid gap-5 lg:grid-cols-[1fr_auto]">
        <div className="flex min-w-0 gap-5">
          <SkeletonBlock className="size-13 shrink-0 rounded-full" />
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              <SkeletonBlock className="h-5 w-20" />
              <SkeletonBlock className="h-5 w-24" />
              <SkeletonBlock className="h-7 w-14" />
            </div>
            <SkeletonBlock className="h-4 w-full" />
            <SkeletonBlock className="h-4 w-4/5" />
            <SkeletonBlock className="h-4 w-2/3" />
          </div>
        </div>
        <div className="flex flex-col items-start gap-6 lg:items-end">
          <SkeletonBlock className="h-4 w-10" />
          <SkeletonBlock className="h-12 w-36" />
        </div>
      </div>
    </article>
  );
};

const ProjectManageSectionSkeleton = () => {
  return (
    <section className="flex flex-col gap-6">
      <SkeletonBlock className="h-8 w-36" />
      <div className="flex flex-wrap gap-4">
        <SkeletonBlock className="h-12 w-40" />
        <SkeletonBlock className="h-12 w-40" />
      </div>
    </section>
  );
};

const TeamDashboardError = ({ onRetry }: { onRetry: () => void }) => {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-16 sm:px-8 md:px-12">
      <div className="border-lightGray flex min-h-80 flex-col items-center justify-center gap-4 rounded-lg border">
        <p className="text-mainRed font-bold">팀 대시보드를 불러오지 못했습니다.</p>
        <button
          type="button"
          className="border-lightGray hover:bg-whiteGray inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-semibold text-neutral-800 transition-colors"
          onClick={onRetry}
        >
          <RefreshCw size={16} />
          다시 시도
        </button>
      </div>
    </div>
  );
};
