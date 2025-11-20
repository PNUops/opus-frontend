import { Outlet } from 'react-router-dom';
import LayoutTopBar from './LayoutTopBar';
import LayoutSideBar from './LayoutSideBar';

const AdminContestLayout = () => {
  return (
    <>
      <LayoutTopBar />
      <div className="flex">
        <LayoutSideBar />
        <div className="border-l">
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default AdminContestLayout;
