import { useEffect } from 'react';
import { useTokenStore } from '@stores/useTokenStore';
import { useUserStore } from '@stores/useUserStore';
import { getUserFromToken } from '@utils/token';

const useAuthInit = () => {
  const { isTokenInit, initToken, token } = useTokenStore();
  const { isUserInit: isAuthInit, setUser } = useUserStore();

  useEffect(() => {
    initToken();
  }, [initToken]);

  useEffect(() => {
    if (!isTokenInit) return;
    const decodedUser = token ? getUserFromToken(token) : null;
    setUser(decodedUser);
  }, [isTokenInit, token, setUser]);

  return { isAuthInit };
};
export default useAuthInit;
