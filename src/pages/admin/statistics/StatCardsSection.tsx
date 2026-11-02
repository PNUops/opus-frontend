import type { VoteReportDto } from '@dto/voteReportDto';

const number = new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 2 });

const StatCardsSection = ({ report }: { report: VoteReportDto }) => {
  const items = [
    { title: '총 투표 수', value: report.totalVotes, unit: '표' },
    { title: '투표 인원', value: report.totalVoters, unit: '명' },
    { title: '1인당 평균', value: report.averageVotesPerVoter, unit: '표' },
    { title: '전체 팀', value: report.teamCount, unit: '팀' },
    { title: '팀당 평균', value: report.averageVotesPerTeam, unit: '표' },
    { title: '0표인 팀', value: report.zeroVoteTeamCount, unit: '팀' },
  ];
  return (
    <section aria-label="투표 집계">
      <dl className="grid grid-cols-3 gap-x-3 gap-y-6 xl:grid-cols-6">
        {items.map(({ title, value, unit }) => (
          <div key={title} className="min-w-0">
            <dt className="text-xs leading-5 text-neutral-600 sm:text-sm">{title}</dt>
            <dd className="mt-2 text-xl leading-8 font-semibold break-words text-neutral-900 tabular-nums sm:text-2xl">
              {number.format(value)}
              <span className="ml-1 text-sm font-normal text-neutral-600">{unit}</span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
};

export default StatCardsSection;
