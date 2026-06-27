import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import { getAccessToken, setAccessToken } from "@/auth/token-store";
import { API_BASE_URL } from "@/lib/env";
import type { HTTPValidationError, TokenResponse } from "./types";

/** Shared axios instance. `withCredentials` lets the httpOnly refresh cookie flow. */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Endpoints that must never trigger the silent-refresh retry (they either
// issue tokens themselves or are the refresh call). A 401 here is terminal.
const NO_REFRESH_PATHS = [
  "/login",
  "/register",
  "/auth/verify-email",
  "/auth/refresh",
];

function isNoRefreshPath(url: string | undefined): boolean {
  return !!url && NO_REFRESH_PATHS.some((path) => url.includes(path));
}

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// A single in-flight refresh shared across concurrent 401s, so a burst of
// failed requests triggers exactly one refresh round-trip.
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  try {
    // Use a bare axios call so this request bypasses the interceptor below and
    // can't recurse into another refresh.
    const { data } = await axios.post<TokenResponse>(
      `${API_BASE_URL}/auth/refresh`,
      null,
      { withCredentials: true },
    );
    setAccessToken(data.access_token);
    return data.access_token;
  } catch {
    setAccessToken(null);
    return null;
  }
}

interface RetriableConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;
    const shouldRefresh =
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      !isNoRefreshPath(original.url);

    if (shouldRefresh && original) {
      original._retry = true;
      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
      const token = await refreshPromise;
      if (token) {
        original.headers = {
          ...original.headers,
          Authorization: `Bearer ${token}`,
        };
        return apiClient(original);
      }
    }

    return Promise.reject(error);
  },
);

/**
 * Extract a human-readable message from an API error.
 *
 * Handles FastAPI's `{detail: ...}` envelope (both the validation-error array
 * and the plain-string form), falling back to the axios/network message.
 */
export function getApiErrorMessage(
  error: unknown,
  fallback = "Възникна грешка.",
): string {
  if (error instanceof AxiosError) {
    const detail = (
      error.response?.data as
        | HTTPValidationError
        | { detail?: string }
        | undefined
    )?.detail;
    if (typeof detail === "string") {
      return detail;
    }
    if (Array.isArray(detail) && detail.length > 0) {
      return detail.map((item) => item.msg).join(", ");
    }
    return error.message || fallback;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}
