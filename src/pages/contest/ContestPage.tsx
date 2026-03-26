import TeamCardGrid from '@pages/main/TeamCardGrid';
import useTeamList from 'hooks/useTeamList';
import { useParams } from 'react-router-dom';
import useContests from 'hooks/useContests';

const ContestPage = () => {
  const { contestId } = useParams();
  const contestIdParam = Number(contestId);

  const { data: contests } = useContests();
  const contestName = contests?.find((contest) => contest.contestId === contestIdParam)?.contestName;

  const { data: teams, isLoading, isError } = useTeamList(contestIdParam);
  return (
    <div className="flex flex-col gap-8">
      <h3 className="lg:text-title text-2xl font-bold">{contestName ?? ''}</h3>
      <TeamCardGrid teams={teams} isLoading={isLoading} isError={isError} />
    </div>
  );
};

export default ContestPage;
