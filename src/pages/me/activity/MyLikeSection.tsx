import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ActivitySection } from './ActivityTab';
import { getMyLikesPreview } from 'apis/me';
import type { GetMyLikesPreviewResponseDto } from 'types/DTO/meDto';
import { RiHeart3Line } from 'react-icons/ri';
import { FaChevronRight } from 'react-icons/fa6';
import TeamCard from '@pages/main/TeamCard';

const MyLikeSection = () => {
  return (
    <ActivitySection.Root>
      <ActivitySection.Header>
        <RiHeart3Line className="text-mainRed size-6" />
        <p>좋아요</p>
        <Link to="/me/activity/likes" className="text-midGray ml-auto">
          <FaChevronRight />
        </Link>
      </ActivitySection.Header>
      <ActivitySection.Description>최근 좋아요한 프로젝트</ActivitySection.Description>
      <ActivitySection.Body>
        <MyLikeList />
      </ActivitySection.Body>
    </ActivitySection.Root>
  );
};

export default MyLikeSection;

const MyLikeList = () => {
  const { data: myLikes } = useQuery<GetMyLikesPreviewResponseDto>({
    queryKey: ['myLikes'],
    queryFn: getMyLikesPreview,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div
      className="scrollbar-thin scrollbar-thumb-gray-300 flex min-h-55 w-full flex-nowrap gap-4 overflow-x-auto py-2 sm:flex-wrap sm:gap-5 sm:overflow-x-visible"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      {myLikes?.map((like) => (
        <div className="box-border flex h-full max-w-[260px] min-w-[220px] sm:max-w-65 sm:min-w-55">
          <TeamCard
            key={like.teamId}
            contestId={like.contestId}
            teamId={like.teamId}
            teamName={like.teamName}
            projectName={like.projectName}
          />
        </div>
      ))}
    </div>
  );
};
