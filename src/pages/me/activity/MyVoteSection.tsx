import { useQuery } from '@tanstack/react-query';
import { MyPageSection } from '@pages/me/mypageSection';
import { getMyVotes } from '@apis/me';
import { MY_VOTES_QUERY_KEY } from '@queries/me';
import type { GetMyVotesResponseDto } from '@dto/meDto';
import TeamCard from '@pages/contest/TeamCard';
import { LuVote } from 'react-icons/lu';
import { ActivityEmptyState, ActivityPreviewSkeleton } from './components/ActivityEmptyState';

const MyVoteSection = () => {
  return (
    <MyPageSection.Root>
      <MyPageSection.Header>
        <LuVote className="text-mainBlue size-6" />
        <p>투표</p>
      </MyPageSection.Header>
      <MyPageSection.Description>최근 투표한 프로젝트</MyPageSection.Description>
      <MyPageSection.Body>
        <MyVoteList />
      </MyPageSection.Body>
    </MyPageSection.Root>
  );
};

export default MyVoteSection;

const MyVoteList = () => {
  const { data: myVotes, isLoading } = useQuery<GetMyVotesResponseDto>({
    queryKey: MY_VOTES_QUERY_KEY,
    queryFn: getMyVotes,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return <ActivityPreviewSkeleton />;
  }

  if (!myVotes || myVotes.length === 0) {
    return <ActivityEmptyState message="투표한 프로젝트가 아직 없어요." className="min-h-55" />;
  }

  return (
    <div
      className="scrollbar-thin scrollbar-thumb-gray-300 flex min-h-55 w-full flex-nowrap gap-4 overflow-x-auto py-2 sm:flex-wrap sm:gap-5 sm:overflow-x-visible"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      {myVotes?.map((vote) => (
        <div key={vote.teamId} className="box-border flex h-full max-w-[260px] min-w-[220px] sm:max-w-65 sm:min-w-55">
          <TeamCard
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
