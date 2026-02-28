import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '@layout/Sidebar';
import FullContainer from '@layout/FullContainer';
import { useSidebar } from '@layout/SidebarContext';
import { useEffect } from 'react';
import { cn } from 'utils/classname';

const SidebarLayout = () => {
  const { isOpen, close } = useSidebar();
  const location = useLocation();

  useEffect(() => {
    close();
  }, [location.pathname, close]);

  return (
    <div className="flex w-full justify-center">
      <Sidebar />
      <div
        className={cn(
          'fixed inset-0 z-30 bg-black/40 transition-opacity lg:hidden',
          isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={close}
      >
        <div
          className={cn(
            'relative h-full w-72 max-w-[80%] bg-white shadow-xl transition-transform',
            isOpen ? 'translate-x-0' : '-translate-x-full',
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <Sidebar variant="mobile" />
        </div>
      </div>

      <FullContainer>
        <Outlet />
      </FullContainer>
    </div>
  );
};

export default SidebarLayout;
