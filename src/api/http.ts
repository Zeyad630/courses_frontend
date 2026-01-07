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

http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => config,
  (error: unknown) => Promise.reject(toApiError(error))
);

http.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: unknown) => Promise.reject(toApiError(error))
);
