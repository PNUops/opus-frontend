import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { MyPageSection } from '@pages/me/mypageSection';
import Pagination from '@components/Pagination';
import TeamCard from '@pages/main/TeamCard';
import { useMyLikesFilter } from '@pages/me/activity/hooks/useMyLikesFilter';
import ActivityFilterBar from '@pages/me/activity/components/ActivityFilterBar';
import { getMyLikes } from 'apis/me';
import { GetMyLikesResponseDto } from 'types/DTO/meDto';
import { RiHeart3Line } from 'react-icons/ri';

const MyLikePage = () => {
  const { state, update, reset, apiParams, queryKey } = useMyLikesFilter();

  return (
    <MyPageSection.Root>
      <MyPageSection.Header>
        <RiHeart3Line className="text-mainRed size-6" />
        <p>좋아요</p>
      </MyPageSection.Header>
      <MyPageSection.Body>
        <ActivityFilterBar
          query={state}
          onQueryChange={update}
          onQueryReset={reset}
          showCategory={true}
          showContest={true}
        />
        <MyLikeGrid apiParams={apiParams} queryKey={queryKey} onPageChange={(page) => update({ page: String(page) })} />
      </MyPageSection.Body>
    </MyPageSection.Root>
  );
};

export default MyLikePage;

const MyLikeGrid = ({
  apiParams,
  queryKey,
  onPageChange,
}: {
  apiParams: Parameters<typeof getMyLikes>[0];
  queryKey: ReturnType<typeof useMyLikesFilter>['queryKey'];
  onPageChange: (page: number) => void;
}) => {
  const { data: myLikes } = useQuery<GetMyLikesResponseDto>({
    queryKey: queryKey,
    queryFn: () => getMyLikes(apiParams),
    placeholderData: keepPreviousData,
  });

  const { content, totalPages, currentPage } = myLikes || {
    content: [],
    totalPages: 0,
    currentPage: 0,
  };

  return (
    <div className="flex flex-col items-center">
      <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {content?.map((proj) => (
          <TeamCard
            key={proj.teamId}
            contestId={proj.contestId}
            teamId={proj.teamId}
            teamName={proj.teamName}
            projectName={proj.projectName}
          />
        ))}
      </div>
      {totalPages > 1 && (
        <Pagination
          totalPages={totalPages}
          currentPage={currentPage + 1}
          onPageChange={(page) => onPageChange(page - 1)}
        />
      )}
    </div>
  );
};
