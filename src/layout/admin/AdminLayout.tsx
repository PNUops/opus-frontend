import { Outlet } from 'react-router-dom';
import useAuth from 'hooks/useAuth';

const AdminLayout = () => {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return (
      <div className="w-full rounded bg-white p-6 text-center shadow-md">
        <p className="text-mainRed text-xl">관리자 권한이 없습니다.</p>
      </div>
    );
  }

  return <Outlet />;
};

export default AdminLayout;
