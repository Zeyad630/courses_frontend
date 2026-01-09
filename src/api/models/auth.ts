export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  nationalId?: string;
  phone?: string;
  fullNameEn?: string;
  fullNameAr?: string;
}

export interface AuthResponse {
  accessToken: string;
  expiresAtUtc: string;
  accountId: number;
  email: string;
  roleId: number;
}

export interface UserInfo {
  accountId: string | null;
  email: string | null;
  roleId: string | null;
}
