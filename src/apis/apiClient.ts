import axios from 'axios';
import { API_BASE_URL } from '@constants/env';
import { getAccessToken } from '@utils/token';

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 3000 * 10,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export default apiClient;
