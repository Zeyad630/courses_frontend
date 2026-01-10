import type { AxiosResponse } from 'axios';

import { http } from '../http';

export interface InstructorDto {
  id: number;
  fullNameEn: string;
  fullNameAr: string;
  email: string;
  phone?: string;
}

const unwrap = <T>(res: AxiosResponse<T>): T => res.data;

export const accountApi = {
  getInstructors: async (): Promise<InstructorDto[]> => {
    const res = await http.get<InstructorDto[]>('/api/Account/instructors');
    return unwrap(res);
  },
};
