export interface CourseRoundStudentDto {
  id: number;
  courseRoundId: number;
  studentId: number;
  studentName: string;
  studentEmail: string;
  assignedAt: string;
  completedAt?: string;
  isActive: boolean;
}

export interface AssignStudentRequest {
  studentId: number;
}
