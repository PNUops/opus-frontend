import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';
import { Toaster } from '@components/Toaster';
import useAuthInit from 'hooks/useAuthInit';
import useScrollToTop from 'hooks/useScrollToTop';
import AxiosInterceptorProvider from 'providers/AxiosInterceptorProvider';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const MainLayout = () => {
  const { isAuthInit } = useAuthInit();
  useScrollToTop();

  if (!isAuthInit) return <></>;

  return (
    <AxiosInterceptorProvider>
      <div>
        <Header />
        <div>
          <Outlet />
        </div>
        <Footer />
      </div>
      <Toaster />
      <ReactQueryDevtools />
    </AxiosInterceptorProvider>
  );
};

export default MainLayout;
