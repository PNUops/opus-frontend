import { useCallback, useEffect } from 'react';
import { useUserStore } from '@stores/useUserStore';
import { useTokenStore } from '@stores/useTokenStore';
import { getUserFromToken } from '@utils/token';

const useAuth = () => {
  const { user, setUser } = useUserStore();
  const { token, setToken, clearToken } = useTokenStore();

  const isSignedIn = !!user && !!token;
  const isLeader = isSignedIn && user?.roles?.includes('ROLE_팀장');
  const isMember = isSignedIn && user?.roles?.includes('ROLE_팀원');
  const isAdmin = isSignedIn && user?.roles?.includes('ROLE_관리자');

  const signOut = useCallback(() => {
    clearToken();
    setUser(null);
  }, [clearToken, setUser]);

  const signIn = useCallback(
    (accessToken: string) => {
      setToken(accessToken);
    },
    [setToken],
  );

  useEffect(() => {
    const decodedUser = token ? getUserFromToken(token) : null;
    if (token && !decodedUser) clearToken();
    setUser(decodedUser);
  }, [token, setUser, clearToken]);

  return {
    isSignedIn,
    isLeader,
    isMember,
    isAdmin,
    user,
    signIn,
    signOut,
  };
};

export default useAuth;
