import { useLocation } from 'react-router-dom';
import { cn } from '@utils/classname';

const Footer = () => {
  const location = useLocation();
  const isHomeRoute = location.pathname === '/';
  const isAuthRoute = ['/signin', '/signup'].includes(location.pathname.replace(/\/+$/, ''));

  return (
    <footer
      className={cn(
        'min-h-footer text-smbold flex w-full items-center justify-center text-white',
        isHomeRoute ? 'border-t border-white/35 bg-[#06172f]' : isAuthRoute ? 'bg-mainBlue' : 'bg-mainBlue mt-footer',
      )}
    >
      © {new Date().getFullYear()} PNUops. All rights reserved.
    </footer>
  );
};

export default Footer;
