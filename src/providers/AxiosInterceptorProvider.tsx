import { useEffect, ReactNode, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { InternalAxiosRequestConfig, AxiosError } from 'axios';
import apiClient from 'apis/apiClient';
import { getAccessToken, isTokenExpired } from 'utils/token';
import { useToast } from 'hooks/useToast';
import useAuth from 'hooks/useAuth';

interface AxiosInterceptorProviderProps {
  children: ReactNode;
}

/**
 * Interceptor에서 훅 사용을 위한 Provider
 */
const AxiosInterceptorProvider = ({ children }: AxiosInterceptorProviderProps) => {
  const navigate = useNavigate();
  const toast = useToast();
  const { signOut } = useAuth();

  const handleTokenExpired = useCallback(() => {
    signOut();
    toast('세션이 만료되었어요. 다시 로그인해주세요.', 'error');
    navigate('/signin');
  }, [signOut, toast, navigate]);

  useEffect(() => {
    const requestInterceptor = apiClient.interceptors.request.use(
      createRequestInterceptor(handleTokenExpired),
      (error) => Promise.reject(error),
    );

    // 현재 불안정한 api 응답으로 인해 주석처리(401 에러가 자주 발생함)
    // const responseInterceptor = apiClient.interceptors.response.use(
    //   (response) => response,
    //   createResponseErrorInterceptor(handleTokenExpired),
    // );

    return () => {
      apiClient.interceptors.request.eject(requestInterceptor);
      // apiClient.interceptors.response.eject(responseInterceptor);
    };
  }, [handleTokenExpired]);

  return <>{children}</>;
};

export default AxiosInterceptorProvider;

const createRequestInterceptor = (onSessionExpired: () => void) => {
  return (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && isTokenExpired(token)) {
      onSessionExpired();
      return Promise.reject(new Error('Token expired'));
    }
    return config;
  };
};

const createResponseErrorInterceptor = (onSessionExpired: () => void) => {
  return (error: AxiosError) => {
    if (error.response?.status === 401) {
      const token = getAccessToken();
      if (token) {
        onSessionExpired();
      }
    }
    return Promise.reject(error);
  };
};
