import MyProjectSection from '@pages/me/activity/MyProjectSection';
import MyLikePreviewSection from '@pages/me/activity/MyLikePreviewSection';
import MyVoteSection from '@pages/me/activity/MyVoteSection';
import MyCommentPreviewSection from './MyCommentPreviewSection';

const ActivityPage = () => {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 p-4 sm:gap-10 sm:p-8 md:gap-12 md:p-12">
      <MyProjectSection />
      <div className="border-lightGray border-t" />
      <MyVoteSection />
      <div className="border-lightGray border-t" />
      <MyLikePreviewSection />
      <div className="border-lightGray border-t" />
      <MyCommentPreviewSection />
    </div>
  );
};

export default ActivityPage;
