import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import axios from 'axios';

import { toApiError } from './errors';
import { API_BASE_URL, API_TIMEOUT_MS } from './config';

export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add authentication token
http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown) => Promise.reject(toApiError(error))
);

// Response interceptor to handle errors
http.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: unknown) => {
    // Handle 401 Unauthorized - clear token and redirect to login
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      // Optionally redirect to login page
      // window.location.href = '/login';
    }
    return Promise.reject(toApiError(error));
  }
);
