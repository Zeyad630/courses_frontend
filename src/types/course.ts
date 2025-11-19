export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';
export type CourseStatus = 'active' | 'inactive' | 'archived';

export interface Course {
  id: string;
  name: string;
  code: string;
  description: string;
  category: string;
  level: CourseLevel;
  price: number;
  instructor: string;
  instructorId: string;
  duration: number; // in hours
  students: number;
  rating: number;
  status: CourseStatus;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
  content?: CourseContent;
}

export interface CourseContent {
  modules: CourseModule[];
  totalLessons: number;
  totalAssignments: number;
}

export interface CourseModule {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  assignments: Assignment[];
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  videoUrl?: string;
  content: string;
  duration: number; // in minutes
  order: number;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  points: number;
  order: number;
}

export interface CourseEnrollment {
  id: string;
  courseId: string;
  studentId: string;
  enrolledAt: Date;
  progress: number; // percentage
  status: 'active' | 'completed' | 'dropped';
  completedAt?: Date;
}

export interface CreateCourseInput {
  name: string;
  code: string;
  description: string;
  category: string;
  level: CourseLevel;
  price: number;
  instructorId: string;
  duration: number;
  image?: string;
}

export interface UpdateCourseInput extends Partial<CreateCourseInput> {
  id: string;
  status?: CourseStatus;
}
