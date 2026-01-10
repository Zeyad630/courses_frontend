import type { AxiosResponse } from 'axios';

import { http } from '../http';

import type { ZoomMeetingDto, CreateZoomMeetingRequest, UpdateZoomMeetingRequest } from '../models/zoom-meeting';

const unwrap = <T>(res: AxiosResponse<T>): T => res.data;

export const zoomMeetingApi = {
  getByCourseRoundId: async (courseRoundId: number): Promise<ZoomMeetingDto[]> => {
    const res = await http.get<ZoomMeetingDto[]>(`/api/ZoomMeeting/course-round/${courseRoundId}`);
    return unwrap(res);
  },

  getById: async (id: number): Promise<ZoomMeetingDto> => {
    const res = await http.get<ZoomMeetingDto>(`/api/ZoomMeeting/${id}`);
    return unwrap(res);
  },

  create: async (payload: CreateZoomMeetingRequest): Promise<ZoomMeetingDto> => {
    const res = await http.post<ZoomMeetingDto>('/api/ZoomMeeting', payload);
    return unwrap(res);
  },

  update: async (id: number, payload: UpdateZoomMeetingRequest): Promise<ZoomMeetingDto> => {
    const res = await http.put<ZoomMeetingDto>(`/api/ZoomMeeting/${id}`, payload);
    return unwrap(res);
  },

  delete: async (id: number): Promise<void> => {
    await http.delete(`/api/ZoomMeeting/${id}`);
  },
};
