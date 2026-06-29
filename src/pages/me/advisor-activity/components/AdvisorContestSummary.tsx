import type { AdvisorActivityContest } from '../types';

interface AdvisorContestSummaryProps {
  contest: Pick<AdvisorActivityContest, 'assignedTeamCount' | 'contestName' | 'pendingFeedbackCount' | 'tags'>;
}

export const AdvisorContestSummary = ({ contest }: AdvisorContestSummaryProps) => {
  return (
    <section className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-extrabold text-neutral-950">{contest.contestName}</h1>
        <div className="flex flex-wrap gap-2">
          {contest.tags.map((tag) => (
            <span key={tag} className="bg-whiteGray rounded-full px-3 py-1 text-xs text-neutral-700">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 lg:min-w-[24rem] lg:gap-10">
        <SummaryMetric label="검토 대기" value={`${contest.pendingFeedbackCount}건`} />
        <SummaryMetric label="담당 팀" value={`${contest.assignedTeamCount}팀`} />
      </div>
    </section>
  );
};

const SummaryMetric = ({ label, value }: { label: string; value: string }) => {
  return (
    <div className="border-mainBlue/40 flex min-h-24 flex-col justify-center border-l-4 pl-6">
      <span className="text-sm font-semibold text-neutral-900">{label}</span>
      <strong className="text-midGray mt-2 text-3xl font-extrabold">{value}</strong>
    </div>
  );
};
