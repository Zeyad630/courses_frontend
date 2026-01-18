import type { AxiosResponse } from 'axios';

import { http } from '../http';

import type { ApplicationDto, CreateApplicationRequest, UpdateApplicationStatusRequest } from '../models/application';

const unwrap = <T>(res: AxiosResponse<T>): T => res.data;

export const applicationApi = {
  getApplications: async (accountId?: number): Promise<ApplicationDto[]> => {
    const params = accountId ? { accountId } : {};
    const res = await http.get<ApplicationDto[]>('/api/applications', { params });
    return unwrap(res);
  },

  getApplicationById: async (id: string | number): Promise<ApplicationDto> => {
    const res = await http.get<ApplicationDto>(`/api/applications/${id}`);
    return unwrap(res);
  },

  createApplication: async (payload: CreateApplicationRequest, accountId?: number): Promise<ApplicationDto> => {
    const params = accountId ? { accountId } : {};
    const res = await http.post<ApplicationDto>('/api/applications', payload, { params });
    return unwrap(res);
  },

  updateApplicationStatus: async (id: string | number, payload: UpdateApplicationStatusRequest): Promise<ApplicationDto | void> => {
    try {
      const res = await http.patch<ApplicationDto>(`/api/applications/${id}/status`, payload, {
        validateStatus: (status: number) => (status >= 200 && status < 300) || status === 204,
      });

      return res.status === 204 ? undefined : res.data;
    } catch (error: any) {
      // Log the error for debugging
      console.error('PATCH /api/applications error:', {
        id,
        payload,
        error: error?.response?.data || error?.message,
        status: error?.response?.status,
      });
      throw error;
    }
  },

  deleteApplication: async (id: string | number): Promise<void> => {
    await http.delete(`/api/applications/${id}`, {
      validateStatus: (status: number) => (status >= 200 && status < 300) || status === 204,
    });
  },
};
