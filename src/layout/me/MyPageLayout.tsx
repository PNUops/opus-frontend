import FullContainerLayout from '@layout/FullContainerLayout';
import LayoutSideBar from '@layout/common/LayoutSideBar';
import myPageSidebarData from '@layout/me/myPageSidebarData';

const MyPageLayout = () => {
  return (
    <>
      <div className="flex">
        <LayoutSideBar sections={myPageSidebarData} />
        <div className="flex-1 border-l">
          <FullContainerLayout />
        </div>
      </div>
    </>
  );
};

export default MyPageLayout;
