import { create } from 'zustand';
import { getAccessToken, removeAccessToken, writeAccessToken } from '@utils/token';

type TokenState = {
  token: string | null;
  isTokenInit: boolean;
  setToken: (token: string) => void;
  clearToken: () => void;
  initToken: () => void;
};

export const useTokenStore = create<TokenState>((set) => ({
  token: null,
  isTokenInit: false,
  setToken: (token: string) => {
    writeAccessToken(token);
    set({ token });
  },
  clearToken: () => {
    removeAccessToken();
    set({ token: null });
  },
  initToken: () => {
    const token = getAccessToken();
    set({ token, isTokenInit: true });
  },
}));
