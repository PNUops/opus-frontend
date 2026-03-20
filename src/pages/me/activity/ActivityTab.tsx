import MyProjectSection from '@pages/me/activity/MyProjectSection';
import MyLikeSection from '@pages/me/activity/MyLikeSection';
import MyVoteSection from '@pages/me/activity/MyVoteSection';
import MyCommentSection from './MyCommentSection';

const ActivityTab = () => {
  return (
    <div className="flex flex-col gap-12 p-12">
      <MyProjectSection />
      <div className="border-t border-gray-300" />
      <MyVoteSection />
      <div className="border-t border-gray-300" />
      <MyLikeSection />
      <div className="border-t border-gray-300" />
      <MyCommentSection />
    </div>
  );
};

export default ActivityTab;

type ActivitySectionProps = {
  children: React.ReactNode;
};

const ActivitySectionRoot = ({ children }: ActivitySectionProps) => {
  return <section className="flex flex-col gap-5 p-2">{children}</section>;
};

const ActivitySectionHeader = ({ children }: ActivitySectionProps) => {
  return <div className="flex items-center gap-2 text-lg font-bold">{children}</div>;
};

const ActivitySectionDescription = ({ children }: ActivitySectionProps) => {
  return <div className="text-sm text-gray-600">{children}</div>;
};

const ActivitySectionBody = ({ children }: ActivitySectionProps) => {
  return <div className="flex flex-col gap-4">{children}</div>;
};

export const ActivitySection = {
  Root: ActivitySectionRoot,
  Header: ActivitySectionHeader,
  Description: ActivitySectionDescription,
  Body: ActivitySectionBody,
};
