import { Outlet } from 'react-router-dom';
import LayoutTopBar from './LayoutTopBar';
import LayoutSideBar from './LayoutSideBar';
import FullContainerLayout from '@layout/FullContainerLayout';

import { admin_sections } from 'constants/sidebar';

const AdminContestLayout = () => {
  return (
    <>
      <LayoutTopBar />
      <div className="flex">
        <LayoutSideBar sections={admin_sections} />
        <div className="flex-1 border-l">
          <FullContainerLayout />
        </div>
      </div>
    </>
  );
};

export default AdminContestLayout;
