import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';
import { Toaster } from '@components/Toaster';
import useAuthInit from 'hooks/useAuthInit';
import useScrollToTop from 'hooks/useScrollToTop';

const MainLayout = () => {
  const { isAuthInit } = useAuthInit();
  useScrollToTop();

  if (!isAuthInit) return <></>;

  return (
    <>
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="flex w-full flex-1 items-start">
          <div className="shrink-0 border-r border-gray-100">
            <Sidebar />
          </div>
          <main className="min-w-0 flex-1 bg-white px-6 py-8 sm:px-10 lg:px-12">
            <div className="mx-auto w-full max-w-[80vw]">
              <Outlet />
            </div>
          </main>
        </div>

        <Footer />
      </div>
      <Toaster />
    </>
  );
};

export default MainLayout;
