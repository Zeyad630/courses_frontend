export interface LoginRequest {
  email: string;
  password: string;
}

export interface GoogleAuthRequest {
  idToken: string;
}

export interface SendOtpRequest {
  email: string;
}

export interface MessageResponse {
  message: string;
}

export interface VerifyOtpAndRegisterRequest {
  email: string;
  otpCode: string;
  password: string;
  nationalId: string;
  fullNameEn: string;
  fullNameAr: string;
  phone?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface AuthResponse {
  accessToken: string;
  expiresAtUtc: string;
  accountId: number;
  email: string;
  roleId: number;
  roleName: string;
}

export interface UserInfo {
  accountId: number | string | null;
  email: string | null;
  roleId: number | string | null;
}

export interface UserProfile {
  id: number;
  email: string;
  phone?: string;
  nationalId: string;
  fullNameEn: string;
  fullNameAr: string;
  roleId: number;
  roleName: string;
  createdAt?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  emailVerifiedAt?: string;
  lastLoginAt?: string;
  hasPassword: boolean;
  hasGoogleAuth: boolean;
}

export interface UpdateProfileRequest {
  email?: string;
  fullNameEn?: string;
  fullNameAr?: string;
  phone?: string;
  nationalId?: string;
}
