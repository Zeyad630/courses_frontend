import type { AxiosResponse } from 'axios';

import { http } from '../http';

import type { WeekDto, CreateWeekRequest, UpdateWeekRequest } from '../models/week';

const unwrap = <T>(res: AxiosResponse<T>): T => res.data;

export const weekApi = {
  getForGenzcoders: async (): Promise<WeekDto[]> => {
    const res = await http.get<WeekDto[]>('/api/Week');
    return unwrap(res);
  },

  getByBusinessEntityName: async (businessEntityName: string): Promise<WeekDto[]> => {
    const res = await http.get<WeekDto[]>(`/api/Week/business/${encodeURIComponent(businessEntityName)}`);
    return unwrap(res);
  },

  getByCourseRoundId: async (courseRoundId: number): Promise<WeekDto[]> => {
    const res = await http.get<WeekDto[]>(`/api/Week/course-round/${courseRoundId}`);
    return unwrap(res);
  },

  getByCourseRoundIdAndBusinessEntity: async (courseRoundId: number, businessEntityName: string): Promise<WeekDto[]> => {
    const res = await http.get<WeekDto[]>(
      `/api/Week/course-round/${courseRoundId}/business/${encodeURIComponent(businessEntityName)}`
    );
    return unwrap(res);
  },

  getById: async (id: number): Promise<WeekDto> => {
    const res = await http.get<WeekDto>(`/api/Week/${id}`);
    return unwrap(res);
  },

  create: async (payload: CreateWeekRequest): Promise<WeekDto> => {
    const res = await http.post<WeekDto>('/api/Week', payload);
    return unwrap(res);
  },

  update: async (id: number, payload: UpdateWeekRequest): Promise<WeekDto> => {
    const res = await http.put<WeekDto>(`/api/Week/${id}`, payload);
    return unwrap(res);
  },

  delete: async (id: number): Promise<void> => {
    await http.delete(`/api/Week/${id}`, {
      validateStatus: (status: number) => (status >= 200 && status < 300) || status === 204,
    });
  },
};
