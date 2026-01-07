import type { ApplicationStatus, CourseApplication, User } from 'src/types/user';

import type {
  ApplicationDto,
  ApplicationStatusId,
  CreateApplicationRequest,
  UpdateApplicationStatusRequest,
} from '../models/application';

const statusIdToStatus = (statusId: ApplicationStatusId | undefined): ApplicationStatus => {
  switch (statusId) {
    case 16:
      return 'accepted';
    case 15:
      return 'rejected';
    case 14:
    default:
      return 'pending';
  }
};

const statusToStatusId = (status: ApplicationStatus): ApplicationStatusId => {
  switch (status) {
    case 'accepted':
      return 16;
    case 'rejected':
      return 15;
    case 'pending':
    default:
      return 14;
  }
};

const toDate = (value: unknown): Date => {
  if (typeof value === 'string' || typeof value === 'number') {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return new Date();
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

type Answer5Payload = {
  studentId?: string;
  courseName?: string;
  coursePrice?: number;
};

const parseAnswer5 = (value: unknown): Answer5Payload => {
  if (typeof value !== 'string' || value.trim() === '') return {};

  try {
    const parsed = JSON.parse(value) as unknown;
    if (!isRecord(parsed)) return {};

    const studentId = typeof parsed.studentId === 'string' ? parsed.studentId : undefined;
    const courseName = typeof parsed.courseName === 'string' ? parsed.courseName : undefined;
    const coursePrice = typeof parsed.coursePrice === 'number' ? parsed.coursePrice : undefined;

    return { studentId, courseName, coursePrice };
  } catch {
    return {};
  }
};

export type UiApplication = CourseApplication & {
  metadata?: {
    fullName?: string;
    email?: string;
    phone?: string;
    experience?: string;
    motivation?: string;
    courseName?: string;
    coursePrice?: number;
  };
};

export const mapApplicationDtoToUi = (dto: ApplicationDto): UiApplication => {
  const answer5 = parseAnswer5(dto.answer5);

  return {
    id: String(dto.id),
    studentId: dto.studentId ?? answer5.studentId ?? '',
    courseId: String(dto.courseId),
    status: statusIdToStatus(dto.statusId),
    appliedAt: toDate(dto.appliedAt),
    reviewedAt: dto.reviewedAt ? toDate(dto.reviewedAt) : undefined,
    reviewedBy: dto.reviewedBy,
    notes: dto.notes,
    metadata: {
      fullName: dto.fullName,
      email: dto.answer1,
      phone: dto.answer2,
      experience: dto.answer3,
      motivation: dto.answer4,
      courseName: answer5.courseName,
      coursePrice: answer5.coursePrice,
    },
  };
};

export const mapCreateApplicationInputToRequest = (input: {
  studentId?: User['id'];
  fullName: string;
  age?: number;
  courseId: string;
  email?: string;
  phone?: string;
  experience?: string;
  motivation?: string;
  courseName?: string;
  coursePrice?: number;
}): CreateApplicationRequest => {
  const answer5: Answer5Payload = {
    studentId: input.studentId,
    courseName: input.courseName,
    coursePrice: input.coursePrice,
  };

  return {
    fullName: input.fullName,
    age: input.age ?? 18,
    courseId: input.courseId,
    answer1: input.email ?? '',
    answer2: input.phone ?? '',
    answer3: input.experience ?? '',
    answer4: input.motivation ?? '',
    answer5: JSON.stringify(answer5),
  };
};

export const mapUpdateStatusToRequest = (status: ApplicationStatus): UpdateApplicationStatusRequest => ({
  statusId: statusToStatusId(status),
});

export const attachReviewer = (app: UiApplication, params: { reviewedBy: User['id']; notes?: string }): UiApplication => ({
  ...app,
  reviewedBy: params.reviewedBy,
  reviewedAt: new Date(),
  notes: params.notes ?? app.notes,
});
