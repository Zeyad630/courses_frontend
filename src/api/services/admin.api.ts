import type { AxiosResponse } from 'axios';

import { http } from '../http';

// ----------------------------------------------------------------------

export interface CreateUserRequest {
  email: string;
  password: string;
  nationalId: string;
  fullNameEn: string;
  fullNameAr?: string;
  phone?: string;
}

export interface CreateUserResponse {
  message: string;
  id: number;
  email: string;
}

export interface UserInfo {
  id: number;
  email: string;
  fullNameEn: string;
  fullNameAr?: string;
  phone?: string;
  roleId: number;
  roleName: string;
  statusId: number;
  statusName: string;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
  hasPassword: boolean;
  hasGoogleAuth: boolean;
}

export interface DashboardSummary {
  totalUsers: number;
  totalStudents: number;
  totalInstructors: number;
  totalAdmins: number;
  activeUsers: number;
  totalCourses: number;
  totalCourseRounds: number;
  totalApplications: number;
  pendingApplications: number;
  totalEnrollments: number;
  recentRegistrations: number;
}

export interface DashboardData {
  summary: DashboardSummary;
  usersByRole: Array<{ role: string; count: number }>;
  recentApplications: Array<{
    id: number;
    courseId: number;
    courseTitle: string;
    fullName: string;
    applicationDate: string;
    statusId: number;
    statusName: string;
  }>;
}

const unwrap = <T>(res: AxiosResponse<T>): T => res.data;

export const adminApi = {
  createInstructor: async (payload: CreateUserRequest): Promise<CreateUserResponse> => {
    const res = await http.post<CreateUserResponse>('/api/admin/create-instructor', payload);
    return unwrap(res);
  },

  createAdmin: async (payload: CreateUserRequest): Promise<CreateUserResponse> => {
    const res = await http.post<CreateUserResponse>('/api/admin/create-admin', payload);
    return unwrap(res);
  },

  getAllUsers: async (): Promise<UserInfo[]> => {
    const res = await http.get<UserInfo[]>('/api/admin/users');
    return unwrap(res);
  },

  getDashboard: async (): Promise<DashboardData> => {
    const res = await http.get<DashboardData>('/api/admin/dashboard');
    return unwrap(res);
  },
};
