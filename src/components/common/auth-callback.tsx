import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/auth-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { parseAuthFragment } from "@/lib/auth-fragment";

const EVENTS_ROUTE = "/hefest-frontend/events";

/**
 * OAuth success landing screen. The API redirects here after a completed SSO
 * flow with the access token in the URL fragment (`#access_token=…`). We store
 * the token, scrub it from the URL, and forward into the app. On a missing
 * token we surface an error with a route back to login.
 */
export function AuthCallback() {
  const navigate = useNavigate();
  const { setToken } = useAuth();
  const [failed, setFailed] = useState(false);

  // Run exactly once, even under StrictMode's double-mount.
  const handled = useRef(false);
  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const { accessToken } = parseAuthFragment(window.location.hash);
    if (!accessToken) {
      setFailed(true);
      return;
    }
    setToken(accessToken);
    // Drop the token from the address bar / history before navigating on.
    window.history.replaceState(
      null,
      "",
      window.location.pathname + window.location.search,
    );
    navigate(EVENTS_ROUTE, { replace: true });
  }, [navigate, setToken]);

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Вход</CardTitle>
        <CardDescription>
          {failed
            ? "Входът не можа да бъде завършен."
            : "Завършваме вашия вход..."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 text-center">
        {failed ? (
          <>
            <p className="text-sm font-medium text-destructive">
              Липсва или е невалиден токен за достъп. Опитайте отново.
            </p>
            <Button asChild variant="outline">
              <Link to="/hefest-frontend/">Към входа</Link>
            </Button>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Изчакайте...</p>
        )}
      </CardContent>
    </Card>
  );
}
