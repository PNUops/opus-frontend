import { Outlet } from 'react-router-dom';
import LayoutTopBar from './LayoutTopBar';
import LayoutSideBar from './LayoutSideBar';
import FullContainerLayout from '@layout/FullContainerLayout';

const AdminContestLayout = () => {
  return (
    <>
      <LayoutTopBar />
      <div className="flex">
        <LayoutSideBar />
        <div className="border-l">
          <Outlet />
          <FullContainerLayout />
        </div>
      </div>
    </>
  );
};

export default AdminContestLayout;
