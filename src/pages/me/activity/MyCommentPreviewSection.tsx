import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MyPageSection } from '../mypageSection';
import { FaChevronRight } from 'react-icons/fa6';
import { FaRegCommentAlt } from 'react-icons/fa';
import { getMyComments } from '@apis/me';
import { MY_COMMENTS_QUERY_KEY } from '@queries/me';
import type { GetCommentsPaginationResponseDto } from '@dto/commentDto';
import { ActivityEmptyState } from './components/ActivityEmptyState';

const MyCommentPreviewSection = () => {
  const { data, isLoading } = useQuery<GetCommentsPaginationResponseDto>({
    queryKey: [...MY_COMMENTS_QUERY_KEY, 'preview'],
    queryFn: () => getMyComments({ page: 0, size: 1 }),
    staleTime: 5 * 60 * 1000,
  });
  const hasComments = (data?.totalElements ?? 0) > 0;

  return (
    <MyPageSection.Root>
      <MyPageSection.Header>
        <FaRegCommentAlt className="text-mainGreen size-5" />
        <p className="text-base sm:text-lg">댓글</p>
        {hasComments && (
          <Link to="/me/activity/comments" className="text-midGray ml-auto" aria-label="내가 쓴 댓글 보기">
            <FaChevronRight />
          </Link>
        )}
      </MyPageSection.Header>
      {(isLoading || !hasComments) && (
        <MyPageSection.Body>
          {isLoading ? (
            <div className="h-16 animate-pulse rounded-lg bg-neutral-200" />
          ) : (
            <ActivityEmptyState message="작성한 댓글이 아직 없어요." />
          )}
        </MyPageSection.Body>
      )}
    </MyPageSection.Root>
  );
};

export default MyCommentPreviewSection;
