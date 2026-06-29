import { useSuspenseQuery } from '@tanstack/react-query';

import { useContestIdOrRedirect, useTeamIdOrRedirect } from '@hooks/useId';
import QueryWrapper from '@providers/QueryWrapper';
import { mySubmissionSummaryOption, mySubmissionTimelineOption } from '@queries/submission';

import { SubmissionSummaryCards } from './components/SubmissionSummaryCards';
import { SubmissionTimeline } from './components/SubmissionTimeline';
import { SubmissionList } from './components/SubmissionList';

const MySubmissionPage = () => {
  return (
    <div className="flex flex-col gap-10">
      <QueryWrapper loadingStyle="h-48 rounded-md my-0" errorStyle="h-48">
        <SubmissionTimelineSection />
      </QueryWrapper>

      <QueryWrapper loadingStyle="h-72 rounded-md my-0" errorStyle="h-72">
        <SubmissionList />
      </QueryWrapper>
    </div>
  );
};

export default MySubmissionPage;

/** 제출물 상태 요약 + 제출 타임라인 (suspense) */
const SubmissionTimelineSection = () => {
  const contestId = useContestIdOrRedirect();
  const teamId = useTeamIdOrRedirect();

  const { data: summary } = useSuspenseQuery(mySubmissionSummaryOption(contestId, teamId));
  const { data: timeline } = useSuspenseQuery(mySubmissionTimelineOption(contestId, teamId));

  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold">제출 타임라인</h2>
          <p className="text-midGray text-sm">
            프로젝트 참여에 필요한 제출 항목을 확인하고, 제출 상태를 관리할 수 있습니다.
          </p>
        </div>
        <SubmissionSummaryCards summary={summary} />
      </div>
      <div className="overflow-x-auto pt-2 pb-1">
        <div className="min-w-[640px]">
          <SubmissionTimeline items={timeline} />
        </div>
      </div>
    </section>
  );
};
