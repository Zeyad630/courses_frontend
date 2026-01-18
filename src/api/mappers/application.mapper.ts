import type { ApplicationStatus, CourseApplication, User } from 'src/types/user';

import type {
  ApplicationDto,
  ApplicationStatusId,
  CreateApplicationRequest,
  UpdateApplicationStatusRequest,
} from '../models/application';

const statusIdToStatus = (statusId: ApplicationStatusId | undefined): ApplicationStatus => {
  switch (statusId) {
    case 4:
      return 'payed';
    case 3:
      return 'accepted';
    case 2:
      return 'rejected';
    case 1:
    default:
      return 'pending';
  }
};

const statusNameToStatus = (statusName: string | undefined): ApplicationStatus | undefined => {
  if (!statusName) return undefined;
  const lower = statusName.trim().toLowerCase();
  if (lower.includes('pay')) return 'payed';
  if (lower.includes('accept')) return 'accepted';
  if (lower.includes('reject')) return 'rejected';
  if (lower.includes('pend')) return 'pending';
  return undefined;
};

const statusToStatusId = (status: ApplicationStatus): ApplicationStatusId => {
  switch (status) {
    case 'payed':
      return 4;
    case 'accepted':
      return 3;
    case 'rejected':
      return 2;
    case 'pending':
    default:
      return 1;
  }
};

const toDate = (value: unknown): Date => {
  if (typeof value === 'string' || typeof value === 'number') {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return new Date();
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

export const mapApplicationDtoToUi = (dto: ApplicationDto, courseId?: string): UiApplication => {
  const derivedStatus = statusNameToStatus(dto.status) ?? statusIdToStatus(dto.statusId);
  const derivedStudentId = dto.studentId ?? (dto.accountId != null ? String(dto.accountId) : '');

  return {
    id: String(dto.id),
    studentId: derivedStudentId,
    courseId: courseId ?? String(dto.courseRoundId), // Will be enriched later from courseRoundId -> courseId
    courseRoundId: dto.courseRoundId,
    status: derivedStatus,
    appliedAt: toDate(dto.appliedAt ?? dto.applicationDate),
    reviewedAt: dto.reviewedAt ? toDate(dto.reviewedAt) : undefined,
    reviewedBy: dto.reviewedBy,
    notes: dto.notes,
    metadata: {
      fullName: dto.fullNameEn ?? dto.answer1 ?? '',
      email: dto.email ?? dto.answer2 ?? '',
      phone: dto.phone ?? dto.answer3 ?? '',
      experience: dto.answer4 ?? '',
      motivation: dto.answer5 ?? '',
      courseName: undefined,
      coursePrice: undefined,
    },
  };
};

export const mapCreateApplicationInputToRequest = (input: {
  courseRoundId: number;
  answer1?: string | null;
  answer2?: string | null;
  answer3?: string | null;
  answer4?: string | null;
  answer5?: string | null;
  answer6?: string | null;
  answer7?: string | null;
  answer8?: string | null;
  answer9?: string | null;
  answer10?: string | null;
}): CreateApplicationRequest => ({
  courseRoundId: input.courseRoundId,
  answer1: input.answer1 ?? null,
  answer2: input.answer2 ?? null,
  answer3: input.answer3 ?? null,
  answer4: input.answer4 ?? null,
  answer5: input.answer5 ?? null,
  answer6: input.answer6 ?? null,
  answer7: input.answer7 ?? null,
  answer8: input.answer8 ?? null,
  answer9: input.answer9 ?? null,
  answer10: input.answer10 ?? null,
});

export const mapUpdateStatusToRequest = (status: ApplicationStatus): UpdateApplicationStatusRequest => ({
  statusId: statusToStatusId(status),
});

export const attachReviewer = (app: UiApplication, params: { reviewedBy: User['id']; notes?: string }): UiApplication => ({
  ...app,
  reviewedBy: params.reviewedBy,
  reviewedAt: new Date(),
  notes: params.notes ?? app.notes,
});
