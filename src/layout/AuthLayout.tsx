import { Outlet } from 'react-router-dom';

const AuthLayout = () => (
  <main className="mx-auto w-full px-4 py-10 sm:px-6 sm:py-12">
    <Outlet />
  </main>
);

export default AuthLayout;
