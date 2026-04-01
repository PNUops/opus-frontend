import TeamCardGrid from '@pages/contest/TeamCardGrid';
import useContests from 'hooks/useContests';
import { useQuery } from '@tanstack/react-query';
import { contestTeamOption } from 'queries/contest';
import { useContestIdOrRedirect } from 'hooks/useId';

const ContestPage = () => {
  const contestId = useContestIdOrRedirect();
  const { data: contests } = useContests();
  const contestName = contests?.find((contest) => contest.contestId === contestId)?.contestName;

  const { data: teams, isLoading, isError } = useQuery(contestTeamOption(contestId));

  return (
    <div className="flex flex-col gap-8">
      <h3 className="lg:text-title text-2xl font-bold">{contestName ?? ''}</h3>
      <TeamCardGrid teams={teams} isLoading={isLoading} isError={isError} />
    </div>
  );
};

export default ContestPage;
