import type { AxiosResponse } from 'axios';

import { http } from '../http';

import type { CourseDto, CreateCourseRequest, UpdateCourseRequest } from '../models/course';

const unwrap = <T>(res: AxiosResponse<T>): T => res.data;

export const courseApi = {
  getAvailableCourses: async (): Promise<CourseDto[]> => {
    const res = await http.get<CourseDto[]>('/api/Course/available');
    return unwrap(res);
  },

  getCourseById: async (id: string | number): Promise<CourseDto> => {
    const res = await http.get<CourseDto>(`/api/Course/${id}`);
    return unwrap(res);
  },

  createCourse: async (payload: CreateCourseRequest): Promise<CourseDto> => {
    const res = await http.post<CourseDto>('/api/Course', payload);
    return unwrap(res);
  },

  updateCourse: async (id: string | number, payload: UpdateCourseRequest): Promise<CourseDto | void> => {
    const res = await http.put<CourseDto>(`/api/Course/${id}`, payload, {
      validateStatus: (status: number) => (status >= 200 && status < 300) || status === 204,
    });

    return res.status === 204 ? undefined : res.data;
  },

  deleteCourse: async (id: string | number): Promise<void> => {
    await http.delete(`/api/Course/${id}`, {
      validateStatus: (status: number) => (status >= 200 && status < 300) || status === 204,
    });
  },
};
