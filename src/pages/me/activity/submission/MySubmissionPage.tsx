import { useContestId, useTeamId } from '@hooks/useId';

import {
  getMockMySubmissionList,
  getMockMySubmissionSummary,
  getMockMySubmissionTimeline,
} from './mocks/mockMySubmission';
import { SubmissionSummaryCards } from './components/SubmissionSummaryCards';
import { SubmissionTimeline } from './components/SubmissionTimeline';
import { SubmissionList } from './components/SubmissionList';

const MySubmissionPage = () => {
  const contestId = useContestId() ?? 0;
  const teamId = useTeamId() ?? 0;

  // TODO: API 연동 시 teamId로 조회
  const summary = getMockMySubmissionSummary(teamId);
  const timeline = getMockMySubmissionTimeline(teamId);
  const submissions = getMockMySubmissionList(teamId);

  return (
    <div className="flex flex-col gap-10">
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

      <SubmissionList contestId={contestId} items={submissions} />
    </div>
  );
};

export default MySubmissionPage;
