import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  changePassword as changePasswordRequest,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
  updateMe as updateMeRequest,
  verifyEmail as verifyEmailRequest,
} from "@/api/auth";
import type {
  ChangePasswordRequest,
  LoginRequest,
  RegisterRequest,
  TokenResponse,
  UserMeResponse,
  UserUpdateRequest,
} from "@/api/types";
import { useAuth } from "@/auth/auth-context";
import { queryKeys } from "@/lib/query-keys";

const EVENTS_ROUTE = "/hefest-frontend/events";
const VERIFY_ROUTE = "/hefest-frontend/verify-email";
const LOGIN_ROUTE = "/hefest-frontend/";

/** Register an unverified student, then route to the verify-email screen. */
export function useRegisterStudent() {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (data: RegisterRequest) => registerRequest(data),
    onSuccess: () => {
      navigate(VERIFY_ROUTE);
    },
  });
}

/** Authenticate with email + password, store the token, route to events. */
export function useLogin() {
  const navigate = useNavigate();
  const { setToken } = useAuth();
  return useMutation({
    mutationFn: (data: LoginRequest) => loginRequest(data),
    onSuccess: (token: TokenResponse) => {
      setToken(token.access_token);
      navigate(EVENTS_ROUTE);
    },
  });
}

/** Verify the email token, store the issued token, route to events. */
export function useVerifyEmail() {
  const navigate = useNavigate();
  const { setToken } = useAuth();
  return useMutation({
    mutationFn: (token: string) => verifyEmailRequest({ token }),
    onSuccess: (response: TokenResponse) => {
      setToken(response.access_token);
      navigate(EVENTS_ROUTE);
    },
  });
}

/** Update the current user's display name; refresh the cached profile. */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UserUpdateRequest) => updateMeRequest(data),
    onSuccess: (user: UserMeResponse) => {
      queryClient.setQueryData(queryKeys.me(), user);
    },
  });
}

/** Change the current user's password. Other sessions are revoked server-side. */
export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => changePasswordRequest(data),
  });
}

/** Revoke the session, clear local token and cache, route to login. */
export function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { clearToken } = useAuth();
  return useMutation({
    mutationFn: () => logoutRequest(),
    onSettled: () => {
      clearToken();
      queryClient.clear();
      navigate(LOGIN_ROUTE);
    },
  });
}
