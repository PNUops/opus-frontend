import Header from './Header';
import Footer from './Footer';
import { Toaster } from '@components/Toaster';
import useAuthInit from 'hooks/useAuthInit';
import useScrollToTop from 'hooks/useScrollToTop';
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
  const { isAuthInit } = useAuthInit();
  useScrollToTop();
  if (!isAuthInit) return <></>;
  return (
    <>
      <div className="flex min-h-screen flex-col">
        <Header />
        <div>
          <Outlet />
        </div>
        <Footer />
      </div>
      <Toaster />
    </>
  );
};

export default MainLayout;
