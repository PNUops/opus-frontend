import Cookies from 'js-cookie';
import { decodeJwt } from 'jose';
import { User } from 'types/User';

export const ACCESS_TOKEN_KEY = 'access_token';

export const writeAccessToken = (token: string): void => {
  Cookies.set(ACCESS_TOKEN_KEY, token);
};

export const removeAccessToken = (): void => {
  Cookies.remove(ACCESS_TOKEN_KEY);
};

export const getAccessToken = (): string | null => {
  return Cookies.get(ACCESS_TOKEN_KEY) || null;
};

export const getUserFromToken = (token: string): User | null => {
  try {
    const payload = decodeJwt(token);
    return {
      id: Number(payload.sub),
      name: payload.name as string,
      roles: payload.roles as User['roles'],
    };
  } catch (error) {
    console.error('Failed to decode token', error);
    return null;
  }
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = decodeJwt(token);
    if (!payload.exp) return false;

    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch (error) {
    return true;
  }
};
