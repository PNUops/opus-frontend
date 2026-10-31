import { Outlet } from 'react-router-dom';

import useAuth from '@hooks/useAuth';
import AdminSidebar from './AdminSidebar';
import { AdminUiProvider } from '@components/admin/AdminUiContext';

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
    <AdminUiProvider>
      <div className="min-h-[calc(100vh_-_var(--h-header))] bg-white">
        <AdminSidebar />
        <main className="min-h-[calc(100vh_-_var(--h-header))] min-w-0 bg-white lg:ml-[272px]">
          <Outlet />
        </main>
      </div>
    </AdminUiProvider>
  );
};

export default AdminLayout;
