export type ApplicationStatusId = 1 | 2 | 3;

export type ApplicationDto = {
  id: number | string;

  fullName: string;
  age: number;
  courseId: number | string;

  answer1?: string;
  answer2?: string;
  answer3?: string;
  answer4?: string;
  answer5?: string;

  statusId?: ApplicationStatusId;

  studentId?: string;
  appliedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  notes?: string;
};

export type CreateApplicationRequest = {
  fullName: string;
  age: number;
  courseId: number | string;
  answer1: string;
  answer2: string;
  answer3: string;
  answer4: string;
  answer5: string;
};

export type UpdateApplicationStatusRequest = {
  statusId: ApplicationStatusId;
};
