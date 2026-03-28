import MyProjectSection from '@pages/me/activity/MyProjectSection';
import MyLikePreviewSection from '@pages/me/activity/MyLikePreviewSection';
import MyVoteSection from '@pages/me/activity/MyVoteSection';
import Divider from '@components/ui/divider';
import MyCommentPreviewSection from './MyCommentPreviewSection';

const ActivityPage = () => {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 p-4 sm:gap-10 sm:p-8 md:gap-12 md:p-12">
      <MyProjectSection />
      <Divider />
      <MyVoteSection />
      <Divider />
      <MyLikePreviewSection />
      <Divider />
      <MyCommentPreviewSection />
    </div>
  );
};

export default ActivityPage;
