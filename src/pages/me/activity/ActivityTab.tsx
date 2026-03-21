import MyProjectSection from '@pages/me/activity/MyProjectSection';
import MyLikePreviewSection from '@pages/me/activity/MyLikePreviewSection';
import MyVoteSection from '@pages/me/activity/MyVoteSection';
import MyCommentPreviewSection from './MyCommentPreviewSection';

const ActivityTab = () => {
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

export default ActivityTab;

type ActivitySectionProps = {
  children: React.ReactNode;
};

const ActivitySectionRoot = ({ children }: ActivitySectionProps) => {
  return <section className="flex w-full flex-col gap-4 p-2 sm:gap-5 sm:p-4 md:p-6">{children}</section>;
};

const ActivitySectionHeader = ({ children }: ActivitySectionProps) => {
  return <div className="flex items-center gap-2 text-base font-bold sm:text-lg">{children}</div>;
};

const ActivitySectionDescription = ({ children }: ActivitySectionProps) => {
  return <div className="text-midGray text-xs sm:text-sm">{children}</div>;
};

const ActivitySectionBody = ({ children }: ActivitySectionProps) => {
  return <div className="flex flex-col gap-3 sm:gap-4">{children}</div>;
};

export const ActivitySection = {
  Root: ActivitySectionRoot,
  Header: ActivitySectionHeader,
  Description: ActivitySectionDescription,
  Body: ActivitySectionBody,
};
