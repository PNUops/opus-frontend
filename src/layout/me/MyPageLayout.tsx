import FullContainerLayout from '@layout/FullContainerLayout';
import LayoutSideBar from '@layout/common/LayoutSideBar';
import myPageSidebarData from '@layout/me/myPageSidebarData';

const MyPageLayout = () => {
  return (
    <div className="flex w-full flex-col md:flex-row">
      <div className="w-full md:w-auto md:max-w-65 md:min-w-55">
        <LayoutSideBar sections={myPageSidebarData} />
      </div>
      <div className="flex-1 md:border-t-0 md:border-l">
        <FullContainerLayout />
      </div>
    </div>
  );
};

export default MyPageLayout;
