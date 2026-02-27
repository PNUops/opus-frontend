import Header from './Header';
import Footer from './Footer';
import { Outlet } from 'react-router-dom';
import { Toaster } from '@components/Toaster';
import useAuthInit from 'hooks/useAuthInit';
import useScrollToTop from 'hooks/useScrollToTop';
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
    </AxiosInterceptorProvider>
  );
};

export default MainLayout;
