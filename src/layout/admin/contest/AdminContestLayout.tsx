import FullContainerLayout from '@layout/FullContainerLayout';
import LayoutTopBar from '@layout/admin/contest/AdminContestLayoutTopBar';
import LayoutSideBar from '@layout/common/LayoutSideBar';
import adminContestSidebarData from '@constants/adminContestLayoutSidebarData';

const AdminContestLayout = () => {
  return (
    <>
      <LayoutTopBar />
      <div className="flex">
        <LayoutSideBar sections={adminContestSidebarData} />
        <div className="flex-1 border-l">
          <FullContainerLayout />
        </div>
      </div>
    </>
  );
};

export default AdminContestLayout;
