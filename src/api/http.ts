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
    
    // Add CSRF protection headers if needed
    const csrfToken = localStorage.getItem('csrfToken');
    if (csrfToken && config.headers) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
    
    return config;
  },
  (error: unknown) => Promise.reject(toApiError(error))
);

// Response interceptor to handle errors
http.interceptors.response.use(
  (response: AxiosResponse) => {
    // Extract CSRF token from response headers if present
    const csrfToken = response.headers['x-csrf-token'];
    if (csrfToken) {
      localStorage.setItem('csrfToken', csrfToken);
    }
    return response;
  },
  (error: unknown) => {
    // Handle 401 Unauthorized - clear token and redirect to login
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        localStorage.removeItem('auth_user');
        // Redirect to login if not already on auth pages or reset password page
        const currentPath = window.location.pathname;
        const authPaths = ['/sign-in', '/sign-up', '/forgot-password', '/reset-password'];
        if (!authPaths.includes(currentPath)) {
          window.location.href = '/sign-in';
        }
      }
      
      // Handle 429 Too Many Requests
      if (error.response?.status === 429) {
        const retryAfter = error.response.headers['retry-after'];
        console.warn(`Rate limited. Retry after ${retryAfter} seconds`);
      }
      
      // Handle 423 Locked (Account locked)
      if (error.response?.status === 423) {
        console.error('Account is locked. Please try again later.');
      }
    }
    return Promise.reject(toApiError(error));
  }
);
