export interface CourseRoundDto {
  id: number;
  roundNumber: number;
  startDate: string; // DateOnly format: YYYY-MM-DD
  endDate: string; // DateOnly format: YYYY-MM-DD
  minStudents?: number | null;
  maxStudents?: number | null;
  price?: number | null;
  courseId: number;
  courseName?: string;
  statusId: number;
  status?: string; // Derived from statusId
  question1?: string | null;
  question2?: string | null;
  question3?: string | null;
  question4?: string | null;
  question5?: string | null;
  question6?: string | null;
  question7?: string | null;
  question8?: string | null;
  question9?: string | null;
  question10?: string | null;
  createdAt?: string;
  mainInstructorId?: number;
  instructorId?: number;
  instructorName?: string;
  InstructorId?: number;
  instructor?: string;
  Instructor?: string;
  weekTitles?: string[];
}

export interface CreateCourseRoundRequest {
  courseId: number;
  roundNumber: number;
  startDate: string; // DateOnly format: YYYY-MM-DD
  endDate: string; // DateOnly format: YYYY-MM-DD
  maxStudents?: number;
  mainInstructorId: number;
  statusId: number;
  question1?: string;
  question2?: string;
  question3?: string;
  question4?: string;
  question5?: string;
}

export interface UpdateCourseRoundRequest {
  roundNumber?: number;
  startDate?: string; // DateOnly format: YYYY-MM-DD
  endDate?: string; // DateOnly format: YYYY-MM-DD
  maxStudents?: number;
}

export interface PatchCourseRoundRequest {
  statusId?: number;
}
