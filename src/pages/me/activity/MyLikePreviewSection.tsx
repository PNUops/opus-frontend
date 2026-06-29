import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MyPageSection } from '@pages/me/mypageSection';
import { getMyLikesPreview } from '@apis/me';
import { MY_LIKES_PREVIEW_QUERY_KEY } from '@queries/me';
import type { GetMyLikesPreviewResponseDto } from '@dto/meDto';
import { RiHeart3Line } from 'react-icons/ri';
import { FaChevronRight } from 'react-icons/fa6';
import TeamCard from '@pages/contest/TeamCard';
import { ActivityEmptyState, ActivityPreviewSkeleton } from './components/ActivityEmptyState';

const MyLikePreviewSection = () => {
  const { data: myLikesPreview, isLoading } = useQuery<GetMyLikesPreviewResponseDto>({
    queryKey: MY_LIKES_PREVIEW_QUERY_KEY,
    queryFn: getMyLikesPreview,
    staleTime: 5 * 60 * 1000,
  });
  const hasLikes = (myLikesPreview?.length ?? 0) > 0;

  return (
    <MyPageSection.Root>
      <MyPageSection.Header>
        <RiHeart3Line className="text-mainRed size-6" />
        <p>좋아요</p>
        {hasLikes && (
          <Link to="/me/activity/likes" className="text-midGray ml-auto">
            <FaChevronRight />
          </Link>
        )}
      </MyPageSection.Header>
      <MyPageSection.Description>최근 좋아요한 프로젝트</MyPageSection.Description>
      <MyPageSection.Body>
        <MyLikeList items={myLikesPreview ?? []} isLoading={isLoading} />
      </MyPageSection.Body>
    </MyPageSection.Root>
  );
};

export default MyLikePreviewSection;

const MyLikeList = ({ items, isLoading }: { items: GetMyLikesPreviewResponseDto; isLoading: boolean }) => {
  if (isLoading) {
    return <ActivityPreviewSkeleton />;
  }

  if (items.length === 0) {
    return <ActivityEmptyState message="좋아요한 프로젝트가 아직 없어요." className="min-h-55" />;
  }

  return (
    <div
      className="scrollbar-thin scrollbar-thumb-gray-300 flex min-h-55 w-full flex-nowrap gap-4 overflow-x-auto py-2 sm:flex-wrap sm:gap-5 sm:overflow-x-visible"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      {items.map((like) => (
        <div key={like.teamId} className="box-border flex h-full max-w-[260px] min-w-[220px] sm:max-w-65 sm:min-w-55">
          <TeamCard
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
