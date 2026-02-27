import { Outlet } from 'react-router-dom';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import Header from './Header';
import Footer from './Footer';

import useAuthInit from 'hooks/useAuthInit';
import useScrollToTop from 'hooks/useScrollToTop';

import { Toaster } from '@components/Toaster';
import AxiosInterceptorProvider from 'providers/AxiosInterceptorProvider';
import { SidebarProvider } from './SidebarContext';

const MainLayout = () => {
  const { isAuthInit } = useAuthInit();
  useScrollToTop();

  if (!isAuthInit) return <></>;

  return (
    <AxiosInterceptorProvider>
      <SidebarProvider>
        <div>
          <Header />
          <div>
            <Outlet />
          </div>
          <Footer />
        </div>
      </SidebarProvider>
      <Toaster />
      <ReactQueryDevtools />
    </AxiosInterceptorProvider>
  );
};

export default MainLayout;
