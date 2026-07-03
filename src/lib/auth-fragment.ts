/**
 * Parsing of the OAuth success redirect fragment.
 *
 * After SSO the API redirects the browser to the configured success URL with
 * the access token in the URL fragment, e.g. `…/auth/callback#access_token=<jwt>`.
 * The refresh token is delivered as an httpOnly cookie on web, so it is
 * intentionally ignored here even if a `refresh_token` field is present.
 */

export interface AuthFragment {
  /** The access token, or null when absent/empty. */
  accessToken: string | null;
  /** An `error` code the provider/API surfaced in the fragment, if any. */
  error: string | null;
}

/**
 * Extract the access token (and any error) from a URL hash fragment.
 *
 * @param hash - `window.location.hash` (with or without the leading `#`).
 * @returns The parsed access token and error, each null when not present.
 */
export function parseAuthFragment(hash: string): AuthFragment {
  const raw = hash.startsWith("#") ? hash.slice(1) : hash;
  const params = new URLSearchParams(raw);
  const accessToken = params.get("access_token");
  return {
    accessToken: accessToken ? accessToken : null,
    error: params.get("error"),
  };
}
