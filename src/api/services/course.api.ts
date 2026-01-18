import type { AxiosResponse } from 'axios';

import { http } from '../http';

import type { CourseDto, CreateCourseRequest, UpdateCourseRequest } from '../models/course';

const unwrap = <T>(res: AxiosResponse<T>): T => res.data;

export const courseApi = {
  getCourses: async (): Promise<CourseDto[]> => {
    const res = await http.get<CourseDto[]>('/api/Courses');
    return unwrap(res);
  },

  getCourseById: async (id: string | number): Promise<CourseDto> => {
    const res = await http.get<CourseDto>(`/api/Courses/${id}`);
    return unwrap(res);
  },

  createCourse: async (payload: CreateCourseRequest): Promise<CourseDto> => {
    const res = await http.post<CourseDto>('/api/Courses', payload);
    return unwrap(res);
  },

  updateCourse: async (id: string | number, payload: UpdateCourseRequest): Promise<CourseDto | void> => {
    const res = await http.put<CourseDto>(`/api/Courses/${id}`, payload, {
      validateStatus: (status: number) => (status >= 200 && status < 300) || status === 204,
    });

    return res.status === 204 ? undefined : res.data;
  },

  patchCourse: async (id: string | number, payload: Partial<UpdateCourseRequest>): Promise<CourseDto | void> => {
    const res = await http.patch<CourseDto>(`/api/Courses/${id}`, payload, {
      validateStatus: (status: number) => (status >= 200 && status < 300) || status === 204,
    });

    return res.status === 204 ? undefined : res.data;
  },

  deleteCourse: async (id: string | number): Promise<void> => {
    await http.delete(`/api/Courses/${id}`, {
      validateStatus: (status: number) => (status >= 200 && status < 300) || status === 204,
    });
  },
};
