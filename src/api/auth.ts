import { apiClient } from "./client";
import type {
  ChangePasswordRequest,
  LoginRequest,
  ProvidersResponse,
  RegisterRequest,
  TokenResponse,
  UserMeResponse,
  UserUpdateRequest,
  VerifyEmailRequest,
} from "./types";

/** Register a new unverified student account. Returns a status message map. */
export async function register(
  data: RegisterRequest,
): Promise<Record<string, string>> {
  const response = await apiClient.post<Record<string, string>>(
    "/register",
    data,
  );
  return response.data;
}

/** Verify an email address with the token from the verification link. */
export async function verifyEmail(
  data: VerifyEmailRequest,
): Promise<TokenResponse> {
  const response = await apiClient.post<TokenResponse>(
    "/auth/verify-email",
    data,
  );
  return response.data;
}

/** Authenticate with email + password; issue a token pair. */
export async function login(data: LoginRequest): Promise<TokenResponse> {
  const response = await apiClient.post<TokenResponse>("/login", data);
  return response.data;
}

/** Rotate the refresh cookie; issue a new token pair. */
export async function refresh(): Promise<TokenResponse> {
  const response = await apiClient.post<TokenResponse>("/auth/refresh", null);
  return response.data;
}

/** Revoke the current refresh token and clear the cookie. */
export async function logout(): Promise<void> {
  await apiClient.post("/auth/logout");
}

/** Revoke every refresh token for the current user. */
export async function logoutAll(): Promise<void> {
  await apiClient.post("/auth/logout-all");
}

/** List supported auth providers and their availability. */
export async function listProviders(): Promise<ProvidersResponse> {
  const response = await apiClient.get<ProvidersResponse>("/auth/providers");
  return response.data;
}

/** Return the current authenticated user's profile. */
export async function getMe(): Promise<UserMeResponse> {
  const response = await apiClient.get<UserMeResponse>("/users/me");
  return response.data;
}

/** Update the current user's editable profile fields (display name). */
export async function updateMe(
  data: UserUpdateRequest,
): Promise<UserMeResponse> {
  const response = await apiClient.patch<UserMeResponse>("/users/me", data);
  return response.data;
}

/** Change the current user's password; revokes all other sessions server-side. */
export async function changePassword(
  data: ChangePasswordRequest,
): Promise<void> {
  await apiClient.post("/auth/change-password", data);
}
