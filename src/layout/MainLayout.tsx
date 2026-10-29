import { Outlet, useLocation } from 'react-router-dom';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import Header from './Header';
import Footer from './Footer';

import useAuthInit from '@hooks/useAuthInit';
import useScrollToTop from '@hooks/useScrollToTop';

import { Toaster } from '@components/Toaster';
import AxiosInterceptorProvider from '@providers/AxiosInterceptorProvider';
import { SidebarProvider } from './SidebarContext';

const MainLayout = () => {
  const { isAuthInit } = useAuthInit();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isProjectDetailRoute = /^\/contest\/[^/]+\/teams\/view\/[^/]+\/?$/.test(location.pathname);
  useScrollToTop();

  if (!isAuthInit) return <></>;

  return (
    <AxiosInterceptorProvider>
      <SidebarProvider>
        <div
          className={`${isAdminRoute ? 'min-w-[1024px]' : 'min-w-[350px]'} ${isProjectDetailRoute ? 'flex min-h-svh flex-col' : ''}`}
        >
          <Header />
          <div className={isProjectDetailRoute ? 'flex-1' : undefined}>
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
