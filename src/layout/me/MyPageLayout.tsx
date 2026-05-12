import FullContainerLayout from '@layout/FullContainerLayout';
import LayoutSideBar from '@layout/common/LayoutSideBar';
import myPageSidebarData from '@constants/myPageSidebarData';
import useAuth from '@hooks/useAuth';

const MyPageLayout = () => {
  const { isSignedIn } = useAuth();

  if (!isSignedIn) {
    return (
      <div className="w-full rounded bg-white p-6 text-center shadow-md">
        <p className="text-mainRed text-xl">로그인이 필요합니다.</p>
      </div>
    );
  }

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
