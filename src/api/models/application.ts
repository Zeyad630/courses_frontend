export type ApplicationStatusId = 1 | 2 | 3 | 4;

export type ApplicationDto = {
  id: number | string;
  courseRoundId: number;
  accountId?: number;
  applicationDate?: string;
  status?: string;
  fullNameEn?: string;
  email?: string;
  phone?: string;
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
  statusId?: ApplicationStatusId;
  studentId?: string;
  appliedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  notes?: string;
};

export type CreateApplicationRequest = {
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
};

export type UpdateApplicationStatusRequest = {
  statusId: ApplicationStatusId;
};
