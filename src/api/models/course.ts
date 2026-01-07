export type CourseLevelId = 1 | 2 | 3;

export type CourseDto = {
  id: number | string;
  title: string;
  description: string;
  levelId: CourseLevelId;
  durationHours: number;
  maxStudents: number;
  price: number;

  code?: string;
  category?: string;
  instructor?: string;
  instructorId?: string;
  students?: number;
  rating?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateCourseRequest = {
  title: string;
  description: string;
  levelId: CourseLevelId;
  durationHours: number;
  maxStudents: number;
  price: number;
};

export type UpdateCourseRequest = Partial<CreateCourseRequest>;
