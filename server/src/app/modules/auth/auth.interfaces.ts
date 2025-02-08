export interface ILoginUser {
  email: string;
  password: string;
}

export interface ILoginUserResponse {
  accessToken: string;
  refreshToken?: string;
  needsPasswordChange: boolean;
}

export interface IRefreshTokenResponse {
  accessToken: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  needsEmailVerification?: boolean;
  needsPasswordChange?: boolean;
}

export interface IChangePassword {
  oldPassword: string;
  newPassword: string;
}

export interface IForgotPasswordPayload {
  email: string;
}

export interface IResetPasswordPayload {
  token: string;
  newPassword: string;
}
