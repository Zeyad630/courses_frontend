import type { AxiosResponse } from 'axios';

import { http } from '../http';

import type { CourseRoundDto, CreateCourseRoundRequest, UpdateCourseRoundRequest, PatchCourseRoundRequest } from '../models/course-round';

const unwrap = <T>(res: AxiosResponse<T>): T => res.data;

export const courseRoundApi = {
  getAll: async (): Promise<CourseRoundDto[]> => {
    const res = await http.get<CourseRoundDto[]>('/api/CourseRound');
    return unwrap(res);
  },

  getById: async (id: number): Promise<CourseRoundDto> => {
    const res = await http.get<CourseRoundDto>(`/api/CourseRound/${id}`);
    return unwrap(res);
  },

  create: async (payload: CreateCourseRoundRequest): Promise<{ id: number }> => {
    const res = await http.post<{ id: number }>('/api/CourseRound', payload);
    return unwrap(res);
  },

  update: async (id: number, payload: UpdateCourseRoundRequest): Promise<void> => {
    await http.put(`/api/CourseRound/${id}`, payload, {
      validateStatus: (status: number) => (status >= 200 && status < 300) || status === 204,
    });
  },

  patch: async (id: number, payload: PatchCourseRoundRequest): Promise<void> => {
    await http.patch(`/api/CourseRound/${id}`, payload, {
      validateStatus: (status: number) => (status >= 200 && status < 300) || status === 204,
    });
  },

  delete: async (id: number): Promise<void> => {
    await http.delete(`/api/CourseRound/${id}`, {
      validateStatus: (status: number) => (status >= 200 && status < 300) || status === 204,
    });
  },
};
