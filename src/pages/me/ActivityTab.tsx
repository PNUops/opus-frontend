import MyCommentListSection from '@pages/me/MyCommentListSection';
import MyLikeSection from '@pages/me/MyLikeSection';
import MyProjectSection from '@pages/me/MyProjectSection';
import MyVoteSection from '@pages/me/MyVoteSection';

const ActivityTab = () => {
  return (
    <div className="flex flex-col gap-12">
      <MyProjectSection />
      <div className="border-t border-gray-300" />
      <MyVoteSection />
      <div className="border-t border-gray-300" />
      <MyLikeSection />
      <div className="border-t border-gray-300" />
      <MyCommentListSection />
    </div>
  );
};

export default ActivityTab;
