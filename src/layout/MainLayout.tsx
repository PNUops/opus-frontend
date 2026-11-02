import { Outlet, useLocation } from 'react-router-dom';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import Header from './Header';
import Footer from './Footer';

import useAuthInit from '@hooks/useAuthInit';
import useScrollToTop from '@hooks/useScrollToTop';

import { Toaster } from '@components/Toaster';
import AxiosInterceptorProvider from '@providers/AxiosInterceptorProvider';
import { SidebarProvider } from './SidebarContext';
import { cn } from '@utils/classname';

const MainLayout = () => {
  const { isAuthInit } = useAuthInit();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isHomeRoute = location.pathname === '/';
  useScrollToTop();

  if (!isAuthInit) return <></>;

  return (
    <AxiosInterceptorProvider>
      <SidebarProvider>
        <div className={cn(isAdminRoute ? 'min-w-[1024px]' : 'min-w-[350px]', isHomeRoute && 'min-h-dvh bg-[#06172f]')}>
          <Header />
          <div>
            <Outlet />
          </div>
          {!isAdminRoute && <Footer />}
        </div>
      </SidebarProvider>
      <Toaster />
      <ReactQueryDevtools />
    </AxiosInterceptorProvider>
  );
};

export default MainLayout;
