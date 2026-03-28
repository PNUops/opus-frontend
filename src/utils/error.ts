import axios from 'axios';

export type ApiErrorBody = { message?: string };

export const getApiErrorMessage = (err: unknown, fallback: string) => {
  if (axios.isAxiosError<ApiErrorBody>(err)) {
    return err.response?.data?.message ?? fallback;
  }
  return fallback;
};
