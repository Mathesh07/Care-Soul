/// <reference types="vite/client" />
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios';
import { clearAuthState, getAccessToken, setAccessToken } from './authTokenManager';

type RetryableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:8000/api';

if (!import.meta.env.VITE_API_BASE_URL) {
  console.warn('VITE_API_BASE_URL is not set. Falling back to http://localhost:8000/api');
}

let authFailureHandler: (() => void) | null = null;
let refreshPromise: Promise<string | null> | null = null;

/** Register a callback that runs when auth becomes invalid (401 after refresh). */
export function setAuthFailureHandler(handler: (() => void) | null): void {
  authFailureHandler = handler;
}

/** Attempt to refresh access token through backend refresh endpoint if available. */
async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    const currentToken = getAccessToken() || localStorage.getItem('token');
    refreshPromise = axios
      .post(
        `${API_BASE_URL}/auth/refresh`,
        { token: currentToken },
        {
          withCredentials: true,
          headers: currentToken ? { Authorization: `Bearer ${currentToken}` } : undefined,
        }
      )
      .then((response) => {
        const nextToken =
          response.data?.token ||
          response.data?.accessToken ||
          response.data?.data?.token ||
          null;

        if (typeof nextToken === 'string' && nextToken.length > 0) {
          setAccessToken(nextToken);
          localStorage.setItem('token', nextToken);
          return nextToken;
        }

        return null;
      })
      .catch(() => null)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken() || localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const nextToken = await refreshAccessToken();

      if (nextToken) {
        originalRequest.headers.Authorization = `Bearer ${nextToken}`;
        return api(originalRequest as AxiosRequestConfig);
      }

      clearAuthState();
      authFailureHandler?.();
    }

    return Promise.reject(error);
  }
);

export default api;
