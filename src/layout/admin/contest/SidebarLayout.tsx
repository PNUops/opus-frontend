import { Outlet } from 'react-router-dom';
import Sidebar from '@layout/Sidebar';

const SidebarLayout = () => {
  return (
    <div className="flex w-full justify-center pt-12">
      <Sidebar />
      <main className="w-full flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default SidebarLayout;
