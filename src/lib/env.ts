/**
 * Resolved API base URL.
 *
 * Empty string means "same origin" — in production the API owns the root
 * namespace behind the same Traefik entrypoint as the SPA, so relative paths
 * like `/login` hit the API directly. In development the Vite dev server
 * proxies those same paths to the local API (see vite.config.ts), so an empty
 * base also works there. Override with `VITE_API_URL` for split deployments.
 */
export const API_BASE_URL: string = import.meta.env.VITE_API_URL ?? "";
