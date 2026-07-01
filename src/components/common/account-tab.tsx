import { type FormEvent, useEffect, useState } from "react";
import { getApiErrorMessage } from "@/api/client";
import type { UserMeResponse } from "@/api/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useChangePassword,
  useUpdateProfile,
} from "@/hooks/use-auth-mutations";
import { useMe } from "@/hooks/use-me";

const MIN_PASSWORD_LENGTH = 12;

function getInitials(fullName: string): string {
  return fullName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

const ROLE_LABELS: Record<string, string> = {
  student: "Студент",
  organizer: "Организатор",
};

interface ProfileHeaderProps {
  me: UserMeResponse | undefined;
  isPending: boolean;
}

function ProfileHeader({ me, isPending }: ProfileHeaderProps) {
  return (
    <div className="flex flex-col items-center gap-6 border border-border bg-card p-6 sm:flex-row">
      <div className="flex h-16 w-16 items-center justify-center bg-foreground text-xl font-semibold text-background">
        {isPending ? "…" : getInitials(me?.full_name ?? "")}
      </div>
      <div className="flex-1 text-center sm:text-left">
        {isPending ? (
          <p className="text-sm text-muted-foreground">Зареждане...</p>
        ) : (
          <>
            <h3 className="text-lg font-medium text-card-foreground">
              {me?.full_name}
            </h3>
            <p className="text-sm text-muted-foreground">{me?.email}</p>
            {me?.role && (
              <span className="mt-2 inline-block border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {ROLE_LABELS[me.role] ?? me.role}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}

interface NameFormProps {
  currentName: string;
}

function NameForm({ currentName }: NameFormProps) {
  const [fullName, setFullName] = useState(currentName);
  const [saved, setSaved] = useState(false);
  const mutation = useUpdateProfile();

  // Keep the field in sync once the profile query resolves.
  useEffect(() => {
    setFullName(currentName);
  }, [currentName]);

  const trimmed = fullName.trim();
  const unchanged = trimmed === currentName.trim();
  const disabled = mutation.isPending || trimmed.length === 0 || unchanged;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (disabled) return;
    setSaved(false);
    mutation.mutate(
      { full_name: trimmed },
      { onSuccess: () => setSaved(true) },
    );
  };

  return (
    <form onSubmit={onSubmit} className="border border-border bg-card p-6">
      <h4 className="mb-4 text-base font-medium text-card-foreground">
        Име за показване
      </h4>
      <div className="space-y-2">
        <Label htmlFor="full_name">Пълно име</Label>
        <Input
          id="full_name"
          value={fullName}
          onChange={(e) => {
            setFullName(e.target.value);
            setSaved(false);
          }}
          disabled={mutation.isPending}
        />
      </div>
      {mutation.isError && (
        <p className="mt-3 text-xs font-medium text-destructive">
          {getApiErrorMessage(mutation.error)}
        </p>
      )}
      {saved && (
        <p className="mt-3 text-xs font-medium text-primary">Запазено.</p>
      )}
      <Button type="submit" size="sm" className="mt-4" disabled={disabled}>
        Запази
      </Button>
    </form>
  );
}

function PasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [clientError, setClientError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const mutation = useChangePassword();

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSaved(false);
    if (next.length < MIN_PASSWORD_LENGTH) {
      setClientError(
        `Новата парола трябва да е поне ${MIN_PASSWORD_LENGTH} символа.`,
      );
      return;
    }
    if (next !== confirm) {
      setClientError("Паролите не съвпадат.");
      return;
    }
    setClientError(null);
    mutation.mutate(
      { current_password: current, new_password: next },
      {
        onSuccess: () => {
          setSaved(true);
          setCurrent("");
          setNext("");
          setConfirm("");
        },
      },
    );
  };

  const error =
    clientError ??
    (mutation.isError ? getApiErrorMessage(mutation.error) : null);

  return (
    <form onSubmit={onSubmit} className="border border-border bg-card p-6">
      <h4 className="mb-4 text-base font-medium text-card-foreground">
        Смяна на паролата
      </h4>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="current_password">Текуща парола</Label>
          <Input
            id="current_password"
            type="password"
            autoComplete="current-password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="new_password">Нова парола</Label>
          <Input
            id="new_password"
            type="password"
            autoComplete="new-password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm_password">Потвърди новата парола</Label>
          <Input
            id="confirm_password"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>
      </div>
      {error && (
        <p className="mt-3 text-xs font-medium text-destructive">{error}</p>
      )}
      {saved && (
        <p className="mt-3 text-xs font-medium text-primary">
          Паролата е сменена. Другите сесии са прекратени.
        </p>
      )}
      <Button
        type="submit"
        size="sm"
        className="mt-4"
        disabled={mutation.isPending || !current || !next || !confirm}
      >
        Смени паролата
      </Button>
    </form>
  );
}

export const AccountTab = () => {
  const { data: me, isPending } = useMe();

  return (
    <div className="mt-6 space-y-6">
      <h2 className="text-xl font-medium text-foreground">
        Редактиране на профила
      </h2>

      <ProfileHeader me={me} isPending={isPending} />

      {me && <NameForm currentName={me.full_name} />}
      <PasswordForm />
    </div>
  );
};
