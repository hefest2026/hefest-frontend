import { useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getApiErrorMessage } from "@/api/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useVerifyEmail } from "@/hooks/use-auth-mutations";

/**
 * Email-verification screen. Two entry points:
 *   - With `?token=...` (the link from the verification email): auto-verifies
 *     and, on success, the hook routes the now-authenticated user onward.
 *   - Without a token (right after registration): prompts the user to check
 *     their inbox.
 */
export function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { mutate: verify, isPending, isError, error } = useVerifyEmail();

  // Fire exactly once per token, even under StrictMode's double-mount.
  const verifiedToken = useRef<string | null>(null);
  useEffect(() => {
    if (token && verifiedToken.current !== token) {
      verifiedToken.current = token;
      verify(token);
    }
  }, [token, verify]);

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Потвърждение на имейл</CardTitle>
        <CardDescription>
          {token
            ? "Потвърждаваме вашия имейл адрес..."
            : "Изпратихме ви имейл с връзка за потвърждение. Проверете входящата си поща, за да активирате акаунта си."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 text-center">
        {token && isPending && (
          <p className="text-sm text-muted-foreground">Изчакайте...</p>
        )}
        {isError && (
          <p className="text-sm font-medium text-destructive">
            {getApiErrorMessage(
              error,
              "Връзката за потвърждение е невалидна или изтекла.",
            )}
          </p>
        )}
        <Button asChild variant="outline">
          <Link to="/hefest-frontend/">Към входа</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
