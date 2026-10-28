import axios from 'axios';

export type ApiErrorBody = { message?: unknown };

export const getApiErrorMessage = (err: unknown, fallback: string) => {
  if (axios.isAxiosError<ApiErrorBody>(err)) {
    const message = err.response?.data?.message;
    return typeof message === 'string' && message.trim() ? message : fallback;
  }

  if (err instanceof Error && err.message) {
    return err.message;
  }

  return fallback;
};
