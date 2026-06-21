import { Outlet } from 'react-router-dom';

import AdminContestSidebar from './AdminContestSidebar';

const AdminContestLayout = () => {
  return (
    <div className="min-h-[calc(100vh-var(--h-header,80px))] bg-white">
      <AdminContestSidebar />
      <main className="ml-[272px] min-w-0 overflow-x-auto">
        <div className="mx-auto w-full max-w-[1456px] px-6 py-6 sm:px-10 xl:px-[60px]">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminContestLayout;
