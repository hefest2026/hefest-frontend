import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import { getAccessToken, setAccessToken, subscribeToken } from "./token-store";

interface AuthContextValue {
  /** Whether an access token is currently held. */
  isAuthenticated: boolean;
  /** Persist a freshly issued access token (post login / verify). */
  setToken: (token: string) => void;
  /** Drop the local token (logout / refresh failure). */
  clearToken: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const token = useSyncExternalStore(
    subscribeToken,
    getAccessToken,
    () => null,
  );

  const setToken = useCallback((value: string) => setAccessToken(value), []);
  const clearToken = useCallback(() => setAccessToken(null), []);

  const value = useMemo<AuthContextValue>(
    () => ({ isAuthenticated: token !== null, setToken, clearToken }),
    [token, setToken, clearToken],
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
