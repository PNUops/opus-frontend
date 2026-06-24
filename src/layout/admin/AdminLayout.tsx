import { Outlet } from 'react-router-dom';

import useAuth from '@hooks/useAuth';
import AdminSidebar from './AdminSidebar';

const AdminLayout = () => {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return (
      <div className="w-full rounded bg-white p-6 text-center shadow-md">
        <p className="text-mainRed text-xl">관리자 권한이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh_-_var(--h-header))] bg-white">
      <AdminSidebar />
      <main className="ml-[272px] min-h-[calc(100vh_-_var(--h-header))] min-w-[752px] bg-white">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
