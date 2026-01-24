import { Outlet } from 'react-router-dom';
import Sidebar from '@layout/Sidebar';
import FullContainer from '@layout/FullContainer';

const SidebarLayout = () => {
  return (
    <div className="flex w-full justify-center pt-12">
      <Sidebar />
      <FullContainer>
        <Outlet />
      </FullContainer>
    </div>
  );
};

export default SidebarLayout;
