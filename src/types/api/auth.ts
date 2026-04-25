import type { VehicleResponse } from './vehicle';

// ── Response types ──────────────────────────────────────────────

export interface AuthResponseDto {
  id: string;
  token: string;
  refreshToken: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export interface UserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  userVehicles: VehicleResponse[];
}

export interface RefreshTokenResponseDto {
  token: string;
  refreshToken: string;
}

// ── Request types ───────────────────────────────────────────────

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface VerifyRegistrationRequest {
  email: string;
  code: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface CheckEmailRequest {
  email: string;
}

export interface VerifyCodeRequest {
  email: string;
  code: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

export interface SendEmailCodeRequest {
  newEmail: string;
}

export interface VerifyEmailCodeRequest {
  newEmail: string;
  code: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
