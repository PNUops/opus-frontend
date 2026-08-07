import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '@layout/Sidebar';
import { useSidebar } from '@layout/SidebarContext';
import { useEffect } from 'react';
import { cn } from '@utils/classname';

const SidebarLayout = () => {
  const { isOpen, close } = useSidebar();
  const location = useLocation();
  const isHomeRoute = location.pathname === '/';

  useEffect(() => {
    close();
  }, [location.pathname, close]);

  return (
    <div className="flex w-full justify-center">
      <Sidebar tone={isHomeRoute ? 'editorial' : 'default'} />
      <div
        className={cn(
          'fixed inset-0 z-30 bg-black/40 transition-opacity lg:hidden',
          isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={close}
      >
        <div
          className={cn(
            'relative h-full w-72 max-w-[80%] shadow-xl transition-transform',
            isHomeRoute ? 'bg-[#06172f]' : 'bg-white',
            isOpen ? 'translate-x-0' : '-translate-x-full',
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <Sidebar variant="mobile" tone={isHomeRoute ? 'editorial' : 'default'} />
        </div>
      </div>

      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default SidebarLayout;
