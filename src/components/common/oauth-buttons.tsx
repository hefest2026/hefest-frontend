import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useProviders } from "@/hooks/use-providers";
import { API_BASE_URL } from "@/lib/env";

const PROVIDER_LABELS: Record<string, string> = {
  microsoft: "Microsoft",
  google: "Google",
};

const PROVIDER_ICONS: Record<string, ReactNode> = {
  microsoft: (
    <svg
      aria-label="Microsoft logo"
      role="img"
      viewBox="0 0 24 24"
      fill="none"
      className="size-4"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 4H11.5V11.5H4V4ZM12.5 4H20V11.5H12.5V4ZM4 12.5H11.5V20H4V12.5ZM12.5 12.5H20V20H12.5V12.5Z"
        fill="currentColor"
      />
    </svg>
  ),
  google: (
    <svg
      aria-label="Google logo"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className="size-4"
    >
      <path
        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
        fill="currentColor"
      />
    </svg>
  ),
};

interface OAuthButtonsProps {
  /** Localized verb prefix, e.g. "Влезте с" / "Регистрация с". */
  labelPrefix: string;
  className?: string;
}

/**
 * Renders a sign-in button per available OAuth provider. Clicking does a
 * full-page redirect to the API's provider login endpoint, which begins the
 * OAuth dance and ultimately redirects back to the SPA.
 */
export function OAuthButtons({ labelPrefix, className }: OAuthButtonsProps) {
  const { data } = useProviders();

  const available = data?.providers.filter(
    (provider) => provider.available && provider.login_url,
  );
  if (!available || available.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      {available.map((provider) => (
        <Button
          key={provider.name}
          variant="outline"
          type="button"
          onClick={() => {
            window.location.href = `${API_BASE_URL}${provider.login_url}`;
          }}
        >
          {PROVIDER_ICONS[provider.name]}
          {labelPrefix} {PROVIDER_LABELS[provider.name] ?? provider.name}
        </Button>
      ))}
    </div>
  );
}
