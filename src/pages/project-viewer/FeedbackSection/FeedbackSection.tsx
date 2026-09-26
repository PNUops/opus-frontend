import { useQuery } from '@tanstack/react-query';
import { GoCommentDiscussion } from 'react-icons/go';

import { getCommentsList } from '@apis/projectViewer';
import { CommentDto } from '@dto/projectViewerDto';
import useAuth from '@hooks/useAuth';
import { teamCommentKeys } from '@queries/teamComments';

import FeedbackForm from './FeedbackForm';

interface FeedbackSectionProps {
  teamId: number;
}

const FeedbackSection = ({ teamId }: FeedbackSectionProps) => {
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

  return (
    <section id="feedback" className="border-lightGray scroll-mt-24 rounded-lg border p-4 sm:p-5">
      <div className="mb-5 flex items-start gap-2">
        <GoCommentDiscussion className="text-mainGreen mt-0.5 shrink-0" size={18} />
        <div>
          <h2 className="text-darkGray text-base font-bold">피드백</h2>
          <p className="text-midGray mt-1 text-xs">지도교수·멘토가 프로젝트에 남긴 피드백입니다.</p>
        </div>
      </div>

      {!isSignedIn ? (
        <div className="bg-whiteGray text-midGray rounded-md py-8 text-center text-sm">
          피드백은 로그인 후 확인할 수 있어요.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {isAdvisor && <FeedbackForm teamId={teamId} />}

          {isLoading ? (
            <FeedbackLoading />
          ) : isError ? (
            <div className="text-mainRed border-lightGray rounded-lg border py-8 text-center text-sm">
              피드백을 불러오지 못했어요.
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="text-midGray border-lightGray rounded-lg border py-8 text-center text-sm">
              아직 등록된 피드백이 없어요.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {feedbacks.map((feedback) => (
                <article key={feedback.commentId} className="border-lightGray rounded-lg border p-4">
                  <p className="text-darkGray text-sm leading-relaxed break-words whitespace-pre-wrap">
                    {feedback.description}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

const FeedbackLoading = () => (
  <div className="border-lightGray animate-pulse rounded-lg border p-4">
    <div className="flex items-center gap-2">
      <div className="h-8 w-8 rounded-full bg-gray-200" />
      <div className="h-4 w-32 rounded bg-gray-200" />
    </div>
    <div className="mt-4 h-4 w-3/4 rounded bg-gray-200" />
  </div>
);

export default FeedbackSection;
