import type { AxiosResponse } from 'axios';

import { http } from '../http';

import type { InstructorCourseRoundDto } from '../models/course-round-instructor';

const unwrap = <T>(res: AxiosResponse<T>): T => res.data;

export const courseRoundInstructorApi = {
  getByInstructorId: async (instructorId: number): Promise<InstructorCourseRoundDto[]> => {
    const res = await http.get<InstructorCourseRoundDto[]>(
      `/api/course-round-instructors/instructor/${instructorId}`
    );
    return unwrap(res);
  },
};
