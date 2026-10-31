import axios from 'axios';

export type ApiErrorBody = {
  message?: unknown;
};

export const getApiErrorMessage = (err: unknown, fallback: string): string => {
  if (!axios.isAxiosError<ApiErrorBody>(err)) {
    if (err instanceof Error && err.message) {
      return err.message;
    }

    return fallback;
  }

  const response = err.response;

  if (!response) {
    return fallback;
  }

  if (response.status === 401) {
    return fallback;
  }

  if (response.status < 400 || response.status >= 500) {
    return fallback;
  }

  const message = response.data?.message;

  return typeof message === 'string' && message.trim() ? message.trim() : fallback;
};
