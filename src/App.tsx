import { ReactNode, useEffect } from 'react';
import './index.css';
import { useLocation } from 'react-router-dom';
import { Toaster } from '@components/Toaster';

const App = ({ children }: { children?: ReactNode }) => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);

  return (
    <>
      {children}
      <Toaster />
    </>
  );
};

export default App;
