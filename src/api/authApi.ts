import { apiFetch } from '../lib/apiClient';
import { ENDPOINTS } from '../lib/endpoints';
import type {
  AuthResponseDto,
  UserDto,
  RefreshTokenResponseDto,
  LoginRequest,
  RegisterRequest,
  VerifyRegistrationRequest,
  CheckEmailRequest,
  VerifyCodeRequest,
  ResetPasswordRequest,
  UpdateProfileRequest,
  SendEmailCodeRequest,
  VerifyEmailCodeRequest,
  ChangePasswordRequest,
  RefreshTokenRequest,
} from '../types/api/auth';

export const authApi = {
  checkEmail: (body: CheckEmailRequest) =>
    apiFetch<{ exists: boolean }>(ENDPOINTS.AUTH_CHECK_EMAIL, { method: 'POST', body }),

  login: (body: LoginRequest) =>
    apiFetch<AuthResponseDto>(ENDPOINTS.AUTH_LOGIN, { method: 'POST', body }),

  register: (body: RegisterRequest) =>
    apiFetch<null>(ENDPOINTS.AUTH_REGISTER, { method: 'POST', body }),

  verifyRegistration: (body: VerifyRegistrationRequest) =>
    apiFetch<AuthResponseDto>(ENDPOINTS.AUTH_VERIFY_REGISTRATION, { method: 'POST', body }),

  verifyCode: (body: VerifyCodeRequest) =>
    apiFetch<null>(ENDPOINTS.AUTH_VERIFY_CODE, { method: 'POST', body }),

  forgotPassword: (body: { email: string }) =>
    apiFetch<null>(ENDPOINTS.AUTH_FORGOT_PASSWORD, { method: 'POST', body }),

  resetPassword: (body: ResetPasswordRequest) =>
    apiFetch<null>(ENDPOINTS.AUTH_RESET_PASSWORD, { method: 'POST', body }),

  refreshToken: (body: RefreshTokenRequest) =>
    apiFetch<RefreshTokenResponseDto>(ENDPOINTS.AUTH_REFRESH_TOKEN, { method: 'POST', body }),

  getProfile: () =>
    apiFetch<UserDto>(ENDPOINTS.AUTH_PROFILE),

  updateProfile: (body: UpdateProfileRequest) =>
    apiFetch<UserDto>(ENDPOINTS.AUTH_PROFILE, { method: 'PUT', body }),

  sendEmailCode: (body: SendEmailCodeRequest) =>
    apiFetch<null>(ENDPOINTS.AUTH_PROFILE_SEND_CODE, { method: 'POST', body }),

  verifyEmailCode: (body: VerifyEmailCodeRequest) =>
    apiFetch<null>(ENDPOINTS.AUTH_PROFILE_VERIFY_CODE, { method: 'POST', body }),

  changePassword: (body: ChangePasswordRequest) =>
    apiFetch<null>('/auth/change-password', { method: 'POST', body }),
};
