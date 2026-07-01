/**
 * Access-token store.
 *
 * The short-lived JWT access token lives in memory (and mirrors to
 * localStorage so it survives a page reload). The long-lived refresh token is
 * an httpOnly cookie owned by the API and is never readable here. Subscribers
 * are notified on every change so React can reflect auth state reactively.
 */

const STORAGE_KEY = "hefest_access_token";

type Listener = () => void;

const listeners = new Set<Listener>();

function readInitial(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

let accessToken: string | null = readInitial();

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
  try {
    if (token) {
      localStorage.setItem(STORAGE_KEY, token);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Storage unavailable (private mode); in-memory token still works.
  }
  for (const listener of listeners) {
    listener();
  }
}

export function subscribeToken(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
