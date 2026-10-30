import { useSuspenseQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';

import { useContestIdOrRedirect, useTeamIdOrRedirect } from '@hooks/useId';
import QueryWrapper from '@providers/QueryWrapper';
import { mySubmissionSummaryOption, mySubmissionTimelineOption } from '@queries/submission';
import { parsePositiveId } from '@utils/id';

import { SubmissionSummaryCards } from './components/SubmissionSummaryCards';
import { SubmissionTimeline } from './components/SubmissionTimeline';
import { SubmissionList } from './components/SubmissionList';

const MySubmissionPage = () => {
  const { contestId, teamId } = useParams();
  if (parsePositiveId(contestId) === null || parsePositiveId(teamId) === null) {
    return <p className="text-midGray p-6">제출물을 확인할 대회와 팀 정보를 찾지 못했습니다.</p>;
  }

  return (
    <div className="flex flex-col gap-10">
      <QueryWrapper key={`timeline:${contestId}:${teamId}`} loadingStyle="h-48 rounded-md my-0" errorStyle="h-48">
        <SubmissionTimelineSection />
      </QueryWrapper>

      <QueryWrapper key={`list:${contestId}:${teamId}`} loadingStyle="h-72 rounded-md my-0" errorStyle="h-72">
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

  const summaryQuery = useSuspenseQuery(mySubmissionSummaryOption(contestId, teamId));
  const timelineQuery = useSuspenseQuery(mySubmissionTimelineOption(contestId, teamId));
  if (summaryQuery.error && !summaryQuery.isFetching) throw summaryQuery.error;
  if (timelineQuery.error && !timelineQuery.isFetching) throw timelineQuery.error;
  const summary = summaryQuery.data;
  const timeline = timelineQuery.data;

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
