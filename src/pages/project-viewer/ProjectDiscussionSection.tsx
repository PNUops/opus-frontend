import { useRef, useState } from 'react';

import useAuth from '@hooks/useAuth';

import CommentFormSection from './CommentSection/CommentFormSection';
import CommentSection from './CommentSection/CommentSection';
import FeedbackForm from './FeedbackSection/FeedbackForm';
import FeedbackSection from './FeedbackSection/FeedbackSection';

interface ProjectDiscussionSectionProps {
  teamId: number;
  canViewFeedback: boolean;
}

type DiscussionTab = 'comments' | 'feedback';

const ProjectDiscussionSection = ({ teamId, canViewFeedback }: ProjectDiscussionSectionProps) => {
  const { isAdvisor } = useAuth();
  const [activeTab, setActiveTab] = useState<DiscussionTab>('comments');
  const commentTabRef = useRef<HTMLButtonElement>(null);
  const feedbackTabRef = useRef<HTMLButtonElement>(null);

  if (!isAdvisor || !canViewFeedback) {
    return (
      <>
        <CommentSection teamId={teamId} />
        {canViewFeedback && (
          <>
            <div className="h-20" />
            <FeedbackSection teamId={teamId} />
          </>
        )}
      </>
    );
  }

  const selectTab = (tab: DiscussionTab, moveFocus = false) => {
    setActiveTab(tab);
    if (moveFocus) {
      const targetRef = tab === 'comments' ? commentTabRef : feedbackTabRef;
      targetRef.current?.focus();
    }
  };

  const handleTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      selectTab(activeTab === 'comments' ? 'feedback' : 'comments', true);
    } else if (event.key === 'Home') {
      event.preventDefault();
      selectTab('comments', true);
    } else if (event.key === 'End') {
      event.preventDefault();
      selectTab('feedback', true);
    }
  };

  return (
    <div>
      <div role="tablist" aria-label="작성 유형 전환" className="mb-5 flex items-center gap-1 overflow-x-auto">
        <button
          ref={commentTabRef}
          type="button"
          id="comment-form-tab"
          role="tab"
          aria-selected={activeTab === 'comments'}
          aria-controls="comment-form-panel"
          tabIndex={activeTab === 'comments' ? 0 : -1}
          onClick={() => selectTab('comments')}
          onKeyDown={handleTabKeyDown}
          className={`shrink-0 cursor-pointer rounded-full px-5 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 ${
            activeTab === 'comments' ? 'text-darkGray bg-gray-100' : 'text-midGray hover:bg-gray-50 hover:text-gray-600'
          }`}
        >
          댓글 작성
        </button>
        <button
          ref={feedbackTabRef}
          type="button"
          id="feedback-form-tab"
          role="tab"
          aria-selected={activeTab === 'feedback'}
          aria-controls="feedback-form-panel"
          tabIndex={activeTab === 'feedback' ? 0 : -1}
          onClick={() => selectTab('feedback')}
          onKeyDown={handleTabKeyDown}
          className={`shrink-0 cursor-pointer rounded-full px-5 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 ${
            activeTab === 'feedback' ? 'text-darkGray bg-gray-100' : 'text-midGray hover:bg-gray-50 hover:text-gray-600'
          }`}
        >
          피드백 작성
        </button>
      </div>

      <div
        id="comment-form-panel"
        role="tabpanel"
        aria-labelledby="comment-form-tab"
        tabIndex={0}
        hidden={activeTab !== 'comments'}
      >
        <CommentFormSection teamId={teamId} />
      </div>
      <div
        id="feedback-form-panel"
        role="tabpanel"
        aria-labelledby="feedback-form-tab"
        tabIndex={0}
        hidden={activeTab !== 'feedback'}
      >
        <FeedbackForm teamId={teamId} />
      </div>

      <div className="h-20" />
      <CommentSection teamId={teamId} showForm={false} />
      <div className="h-20" />
      <FeedbackSection teamId={teamId} showForm={false} />
    </div>
  );
};

export default ProjectDiscussionSection;
