import type { AxiosResponse } from 'axios';

import { http } from '../http';

import type { AuthResponse, LoginRequest, RegisterRequest, UserInfo } from '../models/auth';

const unwrap = <T>(res: AxiosResponse<T>): T => res.data;

export const authApi = {
  login: async (payload: LoginRequest): Promise<AuthResponse> => {
    const res = await http.post<AuthResponse>('/api/auth/login', payload);
    return unwrap(res);
  },

  register: async (payload: RegisterRequest): Promise<AuthResponse> => {
    const res = await http.post<AuthResponse>('/api/auth/register', payload);
    return unwrap(res);
  },

  getMe: async (): Promise<UserInfo> => {
    const res = await http.get<UserInfo>('/api/auth/me');
    return unwrap(res);
  },
};
