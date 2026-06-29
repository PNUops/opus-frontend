import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { scrollToElementByHash } from '@utils/scroll';

const useScrollToTop = () => {
  const { hash, pathname } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }

    return scrollToElementByHash(hash);
  }, [hash, pathname]);
};

export default useScrollToTop;
