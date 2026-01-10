export interface CourseRoundDto {
  id: number;
  roundNumber: number;
  startDate: string; // DateOnly format: YYYY-MM-DD
  endDate: string; // DateOnly format: YYYY-MM-DD
  maxStudents?: number;
  courseId: number;
  mainInstructorId?: number;
  instructorId?: number;
  InstructorId?: number;
  instructor: string;
  Instructor?: string;
  status: string;
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
