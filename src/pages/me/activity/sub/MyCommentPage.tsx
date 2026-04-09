import { useQuery, keepPreviousData } from '@tanstack/react-query';
import Pagination from '@components/Pagination';
import Divider from '@components/ui/divider';
import { MyPageSection } from '@pages/me/mypageSection';
import ActivityFilterBar from '@pages/me/activity/components/ActivityFilterBar';
import { useMyCommentsFilter } from '@pages/me/activity/hooks/useMyCommentsFilter';
import { getMyComments } from '@apis/me';
import { MyCommentItemDto, GetCommentsPaginationResponseDto } from '@dto/commentDto';
import { FaRegCommentAlt } from 'react-icons/fa';
import useTeamThumbnail from '@hooks/useTeamThumbnail';
import AltProfile from '@pages/me/account/components/AltProfile';

const MyCommentPage = () => {
  const { state, update, reset, apiParams, queryKey } = useMyCommentsFilter();

  return (
    <MyPageSection.Root>
      <MyPageSection.Header>
        <FaRegCommentAlt className="text-mainGreen size-5" />
        <p>내가 쓴 댓글</p>
      </MyPageSection.Header>
      <MyPageSection.Body>
        <ActivityFilterBar query={state} onQueryChange={update} onQueryReset={reset} />
        <MyCommentGrid
          apiParams={apiParams}
          queryKey={queryKey}
          onPageChange={(page) => update({ page: String(page) })}
        />
      </MyPageSection.Body>
    </MyPageSection.Root>
  );
};

export default MyCommentPage;

const MyCommentGrid = ({
  apiParams,
  queryKey,
  onPageChange,
}: {
  apiParams: Parameters<typeof getMyComments>[0];
  queryKey: ReturnType<typeof useMyCommentsFilter>['queryKey'];
  onPageChange: (p: number) => void;
}) => {
  const { data } = useQuery<GetCommentsPaginationResponseDto>({
    queryKey: queryKey,
    queryFn: () => getMyComments(apiParams),
    placeholderData: keepPreviousData,
  });

  const { content, totalPages, currentPage } = data || {
    content: [],
    totalPages: 0,
    currentPage: 0,
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex w-full flex-col">
        {content.map((item, index) => (
          <div key={item.comment.commentId}>
            <MyCommentCard comment={item.comment} project={item.project} />
            {index < content.length - 1 && <Divider />}
          </div>
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

const MyCommentCard = ({ comment, project }: MyCommentItemDto) => {
  const { thumbnailUrl } = useTeamThumbnail(project.teamId);
  const createdDate = new Date(comment.createdAt);
  const displayDate = `${createdDate.getFullYear()}.${String(createdDate.getMonth() + 1).padStart(2, '0')}.${String(
    createdDate.getDate(),
  ).padStart(2, '0')}`;

  return (
    <div className="flex flex-col gap-4 bg-white p-4">
      <div className="flex items-start gap-4">
        <img
          src={thumbnailUrl}
          alt={`${project.teamName} 썸네일`}
          className="border-lightGray h-20 w-30 rounded-md border object-contain"
        />
        <div className="flex min-w-0 flex-1 items-start justify-between gap-4">
          <div className="w-full min-w-0">
            <div className="flex w-full items-center justify-between">
              <p className="text-md truncate font-semibold text-black">{project.projectName}</p>
              <p className="text-mainGreen shrink-0 pt-1 text-xs font-medium">
                {project.categoryName} &gt; {project.contestName} &gt; {project.trackName}
              </p>
            </div>
            <p className="text-md font-medium text-black">
              {project.teamId}. {project.teamName}
            </p>
            <div className="text-midGray mt-1 truncate text-xs">{project.overview || ''}</div>
          </div>
        </div>
      </div>

      <div className="ml-6 flex items-start gap-3">
        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full">
          <AltProfile seed={comment.memberName} size={40} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-black">{comment.memberName}</span>
            <span className="text-xs text-gray-400">{displayDate}</span>
          </div>
          <p className="mt-1 text-sm text-gray-800">{comment.content}</p>
        </div>
      </div>
    </div>
  );
};
