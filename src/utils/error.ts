import axios from 'axios';

export type ApiErrorBody = { message?: string };

export const getApiErrorMessage = (err: unknown, fallback: string) => {
  if (axios.isAxiosError<ApiErrorBody>(err)) {
    console.error(err);
    return err.response?.data?.message || fallback;
  }

  if (err instanceof Error && err.message) {
    return err.message;
  }

  return fallback;
};
