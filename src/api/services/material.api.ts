import type { AxiosResponse } from 'axios';

import { http } from '../http';

import type { MaterialDto, CreateMaterialRequest, UpdateMaterialRequest } from '../models/material';

const unwrap = <T>(res: AxiosResponse<T>): T => res.data;

export const materialApi = {
  getByCourseRoundId: async (courseRoundId: number): Promise<MaterialDto[]> => {
    const res = await http.get<MaterialDto[]>(`/api/Material/course-round/${courseRoundId}`);
    return unwrap(res);
  },

  getById: async (id: number): Promise<MaterialDto> => {
    const res = await http.get<MaterialDto>(`/api/Material/${id}`);
    return unwrap(res);
  },

  create: async (payload: CreateMaterialRequest): Promise<MaterialDto> => {
    const res = await http.post<MaterialDto>('/api/Material', payload);
    return unwrap(res);
  },

  update: async (id: number, payload: UpdateMaterialRequest): Promise<MaterialDto> => {
    const res = await http.put<MaterialDto>(`/api/Material/${id}`, payload);
    return unwrap(res);
  },

  delete: async (id: number): Promise<void> => {
    await http.delete(`/api/Material/${id}`);
  },
};
