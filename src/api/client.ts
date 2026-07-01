import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import { getAccessToken, setAccessToken } from "@/auth/token-store";
import { API_BASE_URL } from "@/lib/env";
import type { TokenResponse } from "./types";

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

const ERROR_CODE_MESSAGES: Record<string, string> = {
  invalid_credentials: "Грешен имейл или парола.",
  email_not_verified: "Имейлът не е потвърден. Проверете пощата си.",
  email_exists: "Имейлът вече е регистриран.",
  invalid_verify_token: "Невалиден или изтекъл линк за потвърждение.",
  token_reuse_detected: "Сесията е невалидна. Влезте отново.",
  insufficient_permissions: "Нямате права за това действие.",
};

/**
 * Extract a localised Bulgarian error message from an API error.
 *
 * Priority: X-Error-Code header → known detail string → generic fallback.
 */
export function getApiErrorMessage(
  error: unknown,
  fallback = "Възникна грешка. Опитайте отново.",
): string {
  if (error instanceof AxiosError) {
    const code = error.response?.headers?.["x-error-code"] as
      | string
      | undefined;
    if (code && Object.hasOwn(ERROR_CODE_MESSAGES, code)) {
      return ERROR_CODE_MESSAGES[code];
    }
    return fallback;
  }
  if (error instanceof Error) {
    return fallback;
  }
  return fallback;
}
