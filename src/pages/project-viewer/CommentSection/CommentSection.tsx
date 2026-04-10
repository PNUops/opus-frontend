import { useNavigate } from 'react-router-dom';
import useAuth from '@hooks/useAuth';

import CommentFormSection from './CommentFormSection';
import CommentListSection from './CommentListSection';

interface CommentSectionProps {
  teamId: number;
}

const CommentSection = ({ teamId }: CommentSectionProps) => {
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();

  if (!isSignedIn) {
    return (
      <button
        onClick={() => navigate('/signin')}
        className="bg-whiteGray text-midGray text-exsm flex h-[100px] w-full items-center justify-center rounded hover:cursor-pointer sm:text-sm"
      >
        댓글 작성 및 열람은 로그인이 필요해요.
      </button>
    );
  }

  return (
    <>
      <div className="flex flex-col">
        <CommentFormSection teamId={teamId} />
        <div className="h-20" />
        <CommentListSection teamId={teamId} />
      </div>
    </>
  );
};

export default CommentSection;
