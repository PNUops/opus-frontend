import { useQuery } from '@tanstack/react-query';
import Comment from './Comment';
import { getCommentsList } from '@apis/projectViewer';
import { CommentDto } from '@dto/projectViewerDto';
import { teamCommentKeys } from '@queries/teamComments';

interface CommentListSectionProps {
  teamId: number;
}

const CommentListSection = ({ teamId }: CommentListSectionProps) => {
  const { data: comments = [] } = useQuery<CommentDto[]>({
    queryKey: teamCommentKeys.list(teamId, 'PUBLIC'),
    queryFn: () => getCommentsList(teamId, 'PUBLIC'),
  });

  return (
    <div>
      <div className="border-lightGray border-b pb-5 text-sm font-bold">
        댓글 <span className="text-mainGreen">{comments.length}</span>개
      </div>
      <div className="flex flex-col">
        {comments.map((comment) => (
          <Comment key={comment.commentId} comment={comment} teamId={teamId} />
        ))}
      </div>
    </div>
  );
};

export default CommentListSection;
