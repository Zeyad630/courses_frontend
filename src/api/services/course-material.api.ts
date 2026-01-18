import type { AxiosResponse } from 'axios';

import { http } from '../http';

import type { MaterialDto } from '../models/material';

const unwrap = <T>(res: AxiosResponse<T>): T => res.data;

export const courseMaterialApi = {
  getAll: async (courseRoundId?: number): Promise<MaterialDto[]> => {
    const params = courseRoundId != null ? { courseRoundId } : undefined;
    const res = await http.get<MaterialDto[]>('/api/CourseMaterial', { params });
    const items = unwrap(res);

    if (courseRoundId == null) return items;

    return items.filter((m) => Number(m.courseRoundId) === Number(courseRoundId));
  },

  getByCourseRoundId: async (courseRoundId: number): Promise<MaterialDto[]> => courseMaterialApi.getAll(courseRoundId),
};
