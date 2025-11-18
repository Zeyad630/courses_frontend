export type UserRole = 'admin' | 'instructor' | 'student';

export type ApplicationStatus = 'pending' | 'accepted' | 'rejected';
export type PaymentStatus = 'pending' | 'completed' | 'failed';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  phone?: string;
  avatar?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  instructorId: string;
  students: number;
  duration: string;
  level: string;
  price: number;
  category: string;
  isActive: boolean;
  maxStudents: number;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
}

export interface CourseApplication {
  id: string;
  studentId: string;
  courseId: string;
  status: ApplicationStatus;
  appliedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  notes?: string;
}

export interface Payment {
  id: string;
  applicationId: string;
  studentId: string;
  courseId: string;
  amount: number;
  status: PaymentStatus;
  paymentMethod?: string;
  transactionId?: string;
  paidAt?: Date;
  createdAt: Date;
}

export interface CourseMaterial {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  type: 'pdf' | 'video' | 'link' | 'zoom' | 'document';
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
  isVisible: boolean;
}

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  dueDate: Date;
  maxPoints: number;
  createdBy: string;
  createdAt: Date;
  isVisible: boolean;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  content: string;
  fileUrl?: string;
  submittedAt: Date;
  grade?: number;
  feedback?: string;
  gradedBy?: string;
  gradedAt?: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
