import type { AxiosResponse } from 'axios';

import { http } from '../http';

import type { CourseRoundStudentDto, AssignStudentRequest } from '../models/course-round-student';

const unwrap = <T>(res: AxiosResponse<T>): T => res.data;

export const courseRoundStudentApi = {
  getByCourseRoundId: async (courseRoundId: number): Promise<CourseRoundStudentDto[]> => {
    const res = await http.get<CourseRoundStudentDto[]>(`/api/CourseRoundStudent/course-round/${courseRoundId}`);
    return unwrap(res);
  },

  getByStudentId: async (studentId: number): Promise<CourseRoundStudentDto[]> => {
    const res = await http.get<CourseRoundStudentDto[]>(`/api/CourseRoundStudent/student/${studentId}`);
    return unwrap(res);
  },

  assignStudent: async (courseRoundId: number, payload: AssignStudentRequest): Promise<CourseRoundStudentDto> => {
    const res = await http.post<CourseRoundStudentDto>(`/api/CourseRoundStudent/course-round/${courseRoundId}/assign`, payload);
    return unwrap(res);
  },

  unassignStudent: async (id: number): Promise<void> => {
    await http.delete(`/api/CourseRoundStudent/${id}`);
  },
};
