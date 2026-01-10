export interface ZoomMeetingDto {
  id: number;
  courseRoundId: number;
  instructorId: number;
  instructorName: string;
  topic: string;
  description?: string;
  meetingLink: string;
  meetingId?: string;
  passcode?: string;
  meetingDateTime: string;
  durationMinutes: number;
  createdAt: string;
  updatedAt?: string;
  isActive: boolean;
}

export interface CreateZoomMeetingRequest {
  courseRoundId: number;
  topic: string;
  description?: string;
  meetingLink: string;
  meetingId?: string;
  passcode?: string;
  meetingDateTime: string;
  durationMinutes: number;
}

export interface UpdateZoomMeetingRequest {
  topic: string;
  description?: string;
  meetingLink: string;
  meetingId?: string;
  passcode?: string;
  meetingDateTime: string;
  durationMinutes: number;
  isActive: boolean;
}
