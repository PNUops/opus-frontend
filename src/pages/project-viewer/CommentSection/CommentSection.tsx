import { useNavigate } from 'react-router-dom';
import useAuth from '@hooks/useAuth';

import CommentFormSection from './CommentFormSection';
import CommentListSection from './CommentListSection';

interface CommentSectionProps {
  teamId: number;
}

const CommentSection = ({ teamId }: CommentSectionProps) => {
  const { isSignedIn } = useAuth();

  if (!isSignedIn) {
    return <CommentSigninPrompt />;
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

const CommentSigninPrompt = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/signin')}
      className="bg-whiteGray text-midGray text-exsm flex h-30 w-full flex-col items-center justify-center gap-4 rounded hover:cursor-pointer sm:h-25 sm:flex-row sm:text-sm"
    >
      <p className="text-gray-500">댓글 작성 및 열람은 로그인 후 이용할 수 있어요.</p>
      <span className="text-mainBlue hover:font-semibold hover:underline">로그인하기</span>
    </button>
  );
};
