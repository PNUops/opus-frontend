import TeamCardGrid from '@pages/contest/TeamCardGrid';
import useTeamList from 'hooks/useTeamList';
import useContestName from 'hooks/useContestName';
import { useContestIdOrRedirect } from 'hooks/useId';

const ContestPage = () => {
  const contestId = useContestIdOrRedirect();
  const contestName = useContestName();

  const { data: teams, isLoading, isError } = useTeamList(contestId);

  return (
    <div className="flex flex-col gap-8">
      <h3 className="lg:text-title text-2xl font-bold">{contestName ?? ''}</h3>
      <TeamCardGrid teams={teams} isLoading={isLoading} isError={isError} />
    </div>
  );
};

export default ContestPage;
