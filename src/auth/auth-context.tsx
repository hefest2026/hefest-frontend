import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import type { UserRole } from "@/api/types";
import { getAccessToken, setAccessToken, subscribeToken } from "./token-store";

interface JwtClaims {
  sub: string;
  role: UserRole;
}

function parseJwt(token: string): JwtClaims | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1])) as Record<
      string,
      unknown
    >;
    if (typeof payload.sub === "string" && typeof payload.role === "string") {
      return { sub: payload.sub, role: payload.role as UserRole };
    }
    return null;
  } catch {
    return null;
  }
}

interface AuthContextValue {
  isAuthenticated: boolean;
  /** UUID of the authenticated user, parsed from the JWT. */
  userId: string | null;
  /** Role of the authenticated user, parsed from the JWT. */
  role: UserRole | null;
  setToken: (token: string) => void;
  clearToken: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const token = useSyncExternalStore(
    subscribeToken,
    getAccessToken,
    () => null,
  );

  const claims = useMemo(() => (token ? parseJwt(token) : null), [token]);

  const setToken = useCallback((value: string) => setAccessToken(value), []);
  const clearToken = useCallback(() => setAccessToken(null), []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: token !== null,
      userId: claims?.sub ?? null,
      role: claims?.role ?? null,
      setToken,
      clearToken,
    }),
    [token, claims, setToken, clearToken],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
