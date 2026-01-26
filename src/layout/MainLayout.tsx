import Header from './Header';
import Footer from './Footer';
import { Toaster } from '@components/Toaster';
import useAuthInit from 'hooks/useAuthInit';
import useScrollToTop from 'hooks/useScrollToTop';
import { Outlet } from 'react-router-dom';
import AxiosInterceptorProvider from 'providers/AxiosInterceptorProvider';

const MainLayout = () => {
  const { isAuthInit } = useAuthInit();
  useScrollToTop();
  if (!isAuthInit) return <></>;
  return (
    <AxiosInterceptorProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <div>
          <Outlet />
        </div>
        <Footer />
      </div>
      <Toaster />
    </AxiosInterceptorProvider>
  );
};

export default MainLayout;
