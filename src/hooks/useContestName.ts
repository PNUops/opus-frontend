import { useParams } from 'react-router-dom';
import useContests from './useContests';

const useContestName = () => {
  const { contestId: contestIdParam } = useParams();
  const { data: contests } = useContests();
  const contestName = contests?.find((contest) => contest.contestId === Number(contestIdParam))?.contestName;

  return contestName;
};

export default useContestName;
