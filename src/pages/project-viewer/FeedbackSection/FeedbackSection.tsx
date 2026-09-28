import type { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GoCommentDiscussion } from 'react-icons/go';

import { getCommentsList } from '@apis/projectViewer';
import { CommentDto } from '@dto/projectViewerDto';
import useAuth from '@hooks/useAuth';
import { teamCommentKeys } from '@queries/teamComments';

import FeedbackForm from './FeedbackForm';
import FeedbackItem from './FeedbackItem';

interface FeedbackSectionProps {
  teamId: number;
  showForm?: boolean;
}

const FeedbackSection = ({ teamId, showForm = true }: FeedbackSectionProps) => {
  const { isSignedIn, isAdvisor } = useAuth();
  const {
    data: feedbacks = [],
    isLoading,
    isError,
  } = useQuery<CommentDto[]>({
    queryKey: teamCommentKeys.list(teamId, 'TEAM'),
    queryFn: () => getCommentsList(teamId, 'TEAM'),
    enabled: isSignedIn,
  });

  if (!isSignedIn) return null;

  return (
    <section id="feedback" className="flex scroll-mt-24 flex-col">
      {showForm && isAdvisor && (
        <>
          <FeedbackForm teamId={teamId} />
          <div className="h-16 sm:h-20" />
        </>
      )}

      <div>
        <div className="border-lightGray flex flex-wrap items-end justify-between gap-x-4 gap-y-2 border-b pb-5">
          <div className="flex items-center gap-2 text-sm font-bold">
            <GoCommentDiscussion className="text-mainGreen shrink-0" size={18} />
            <h2>
              피드백 <span className="text-mainGreen">{feedbacks.length}</span>개
            </h2>
          </div>
          <p className="text-midGray text-xs">지도교수·멘토가 프로젝트에 남긴 피드백입니다.</p>
        </div>

        {isLoading ? (
          <FeedbackLoading />
        ) : isError ? (
          <FeedbackStatus className="text-mainRed">피드백을 불러오지 못했어요.</FeedbackStatus>
        ) : (
          <div className="flex flex-col">
            {feedbacks.map((feedback) => (
              <FeedbackItem key={feedback.commentId} feedback={feedback} teamId={teamId} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

interface FeedbackStatusProps {
  children: ReactNode;
  className?: string;
}

const FeedbackStatus = ({ children, className = 'text-midGray' }: FeedbackStatusProps) => (
  <div className={`border-b border-gray-100 py-10 text-center text-sm ${className}`}>{children}</div>
);

const FeedbackLoading = () => (
  <div className="animate-pulse border-b border-gray-100 p-5">
    <div className="flex items-center justify-between gap-3">
      <div className="h-4 w-32 rounded bg-gray-200" />
      <div className="h-3 w-28 rounded bg-gray-200" />
    </div>
    <div className="mt-3 h-4 w-3/4 rounded bg-gray-200" />
  </div>
);

export default FeedbackSection;
