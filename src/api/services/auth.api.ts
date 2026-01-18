import type { AxiosResponse } from 'axios';

import { http } from '../http';

import type {
  AuthResponse,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  GoogleAuthRequest,
  LoginRequest,
  MessageResponse,
  ResetPasswordRequest,
  SendOtpRequest,
  SignupRequest,
  UpdateProfileRequest,
  UserInfo,
  UserProfile,
  VerifyOtpAndRegisterRequest,
} from '../models/auth';

const unwrap = <T>(res: AxiosResponse<T>): T => res.data;

export const authApi = {
  login: async (payload: LoginRequest): Promise<AuthResponse> => {
    const res = await http.post<AuthResponse>('/api/Auth/login', payload);
    return unwrap(res);
  },

  googleAuth: async (payload: GoogleAuthRequest): Promise<AuthResponse> => {
    const res = await http.post<AuthResponse>('/api/auth/google-auth', payload);
    return unwrap(res);
  },

  sendOtp: async (payload: SendOtpRequest): Promise<MessageResponse> => {
    const res = await http.post<MessageResponse>('/api/auth/send-otp', payload);
    return unwrap(res);
  },

  signup: async (payload: SignupRequest): Promise<AuthResponse> => {
    const res = await http.post<AuthResponse>('/api/Auth/signup', payload);
    return unwrap(res);
  },

  verifyOtpAndRegister: async (payload: VerifyOtpAndRegisterRequest): Promise<AuthResponse> => {
    const res = await http.post<AuthResponse>('/api/auth/verify-otp-and-register', payload);
    return unwrap(res);
  },

  forgotPassword: async (payload: ForgotPasswordRequest): Promise<MessageResponse> => {
    const res = await http.post<MessageResponse>('/api/auth/forgot-password', payload);
    return unwrap(res);
  },

  resetPassword: async (payload: ResetPasswordRequest): Promise<MessageResponse> => {
    const res = await http.post<MessageResponse>('/api/auth/reset-password', payload);
    return unwrap(res);
  },

  changePassword: async (payload: ChangePasswordRequest): Promise<MessageResponse> => {
    const res = await http.post<MessageResponse>('/api/auth/change-password', payload);
    return unwrap(res);
  },

  getMe: async (): Promise<UserInfo> => {
    const res = await http.get<UserInfo>('/api/auth/me');
    return unwrap(res);
  },

  getProfile: async (): Promise<UserProfile> => {
    const res = await http.get<UserProfile>('/api/profile');
    return unwrap(res);
  },

  updateProfile: async (payload: UpdateProfileRequest): Promise<UserProfile> => {
    const res = await http.put<UserProfile>('/api/profile', payload);
    return unwrap(res);
  },
};
