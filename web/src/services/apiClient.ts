import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:8080/api';
export const ASSET_BASE_URL = API_BASE_URL.replace(/\/api$/, '');

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const uploadApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const url = config.url || '';
    const isAuthApi = url.includes('/v1/auth/');
    if (token && !isAuthApi) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // 401 时不再跳转，由各组件自行处理（如弹出登录框）
    }
    return Promise.reject(error);
  }
);

uploadApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = {
      ...(config.headers || {}),
      Authorization: `Bearer ${token}`,
    } as any;
  }
  return config;
});
