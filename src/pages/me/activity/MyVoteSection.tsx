import { useQuery } from '@tanstack/react-query';
import { ActivitySection } from './ActivityPage';
import { getMyVotes } from 'apis/me';
import type { GetMyVotesResponseDto } from 'types/DTO/meDto';
import TeamCard from '@pages/main/TeamCard';
import { LuVote } from 'react-icons/lu';

const MyVoteSection = () => {
  return (
    <ActivitySection.Root>
      <ActivitySection.Header>
        <LuVote className="text-mainBlue size-6" />
        <p>투표</p>
      </ActivitySection.Header>
      <ActivitySection.Description>최근 투표한 프로젝트</ActivitySection.Description>
      <ActivitySection.Body>
        <MyVoteList />
      </ActivitySection.Body>
    </ActivitySection.Root>
  );
};

export default MyVoteSection;

const MyVoteList = () => {
  const { data: myVotes } = useQuery<GetMyVotesResponseDto>({
    queryKey: ['myVotes'],
    queryFn: getMyVotes,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div
      className="scrollbar-thin scrollbar-thumb-gray-300 flex min-h-55 w-full flex-nowrap gap-4 overflow-x-auto py-2 sm:flex-wrap sm:gap-5 sm:overflow-x-visible"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      {myVotes?.map((vote) => (
        <div className="box-border flex h-full max-w-[260px] min-w-[220px] sm:max-w-65 sm:min-w-55">
          <TeamCard
            key={vote.teamId}
            contestId={vote.contestId}
            teamId={vote.teamId}
            teamName={vote.teamName}
            projectName={vote.projectName}
          />
        </div>
      ))}
    </div>
  );
};
