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
  const isAuthRoute = ['/signin', '/signup'].includes(location.pathname.replace(/\/+$/, ''));
  const shouldFillViewport = isProjectDetailRoute || isAuthRoute;
  useScrollToTop();

  if (!isAuthInit) return <></>;

  return (
    <AxiosInterceptorProvider>
      <SidebarProvider>
        <div
          className={
            isAdminRoute
              ? 'min-w-[1024px]'
              : shouldFillViewport
                ? 'flex min-h-svh min-w-[350px] flex-col'
                : 'min-w-[350px]'
          }
        >
          <Header />
          <div className={shouldFillViewport ? 'flex-1' : undefined}>
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
