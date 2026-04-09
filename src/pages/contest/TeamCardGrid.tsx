import TeamCard from '@pages/contest/TeamCard';
import TeamCardSkeleton from '@pages/contest/TeamCardSkeleton';
import { TeamListItemResponseDto } from '@dto/teams/teamListDto';

import { useIsVoteTerm } from '@hooks/useVoteTerm';
import { useParams } from 'react-router-dom';

interface Props {
  teams?: TeamListItemResponseDto[];
  isLoading: boolean;
  isError: boolean;
}

const TeamCardGrid = ({ teams, isLoading, isError }: Props) => {
  const { contestId } = useParams();
  const contestIdNumber = contestId ? Number(contestId) : 1;
  const { isVoteTerm } = useIsVoteTerm(isNaN(contestIdNumber) ? 1 : contestIdNumber);

  return (
    <section className="grid grid-cols-2 gap-4 sm:grid-cols-2 sm:gap-5 md:grid-cols-3 md:gap-6 lg:grid-cols-4 lg:gap-7 xl:gap-8">
      {isLoading && Array.from({ length: 20 }).map((_, i) => <TeamCardSkeleton key={i} />)}
      {isError && <p>데이터를 불러오지 못했습니다.</p>}
      {teams?.map((team) => (
        <TeamCard
          key={team.teamId}
          contestId={contestIdNumber}
          teamId={team.teamId}
          teamName={team.teamName}
          projectName={team.projectName}
          isLiked={team.isLiked}
          isVoted={team.isVoted}
          awards={team.awards}
          isVoteTerm={isVoteTerm}
        />
      ))}
    </section>
  );
};

export default TeamCardGrid;
