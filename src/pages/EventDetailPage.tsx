import { Link, useParams } from "react-router-dom";
import { getApiErrorMessage } from "@/api/client";
import type { MyRegistrationResponse } from "@/api/types";
import { useAuth } from "@/auth/auth-context";
import { Button } from "@/components/ui/button";
import { useLogout } from "@/hooks/use-auth-mutations";
import { useEvent } from "@/hooks/use-events";
import {
  useCancelRegistration,
  useMyRegistrations,
  useRegisterForEvent,
} from "@/hooks/use-registrations";

function formatDateTime(iso: string | null): string {
  if (!iso) return "Не е зададено";
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? "Невалидна дата"
    : date.toLocaleString("bg-BG", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
}

const URL_RE = /(https?:\/\/[^\s]+)/g;

function linkify(text: string): React.ReactNode[] {
  const parts = text.split(URL_RE);
  return parts.map((part) =>
    URL_RE.test(part) ? (
      <a
        key={part}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline underline-offset-2 hover:opacity-80"
      >
        {part}
      </a>
    ) : (
      part
    ),
  );
}

function Description({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div>
      {lines.map((line, i) => (
        <p
          // biome-ignore lint/suspicious/noArrayIndexKey: lines from stable text split, order never changes
          key={i}
          className={`text-sm leading-relaxed text-foreground ${i < lines.length - 1 ? "mb-3" : ""}`}
        >
          {line === "" ? <>&nbsp;</> : linkify(line)}
        </p>
      ))}
    </div>
  );
}

function RegistrationAction({
  registration,
  eventId,
  isFull,
}: {
  registration: MyRegistrationResponse | undefined;
  eventId: string;
  isFull: boolean;
}) {
  const registerMutation = useRegisterForEvent();
  const cancelMutation = useCancelRegistration();
  const isMutating = registerMutation.isPending || cancelMutation.isPending;
  const isConfirmed = registration?.status === "confirmed";
  const isWaitlisted = registration?.status === "waitlisted";
  const actionError = registerMutation.error ?? cancelMutation.error;

  return (
    <div className="flex flex-col gap-3">
      {actionError && (
        <p className="text-sm text-destructive">
          {getApiErrorMessage(actionError)}
        </p>
      )}
      {registration ? (
        <Button
          onClick={() => cancelMutation.mutate(registration.id)}
          variant="outline"
          size="lg"
          className="text-destructive"
          disabled={isMutating}
        >
          {isWaitlisted ? "Напусни списъка на чакащите" : "Откажи участието"}
        </Button>
      ) : isFull ? (
        <Button
          onClick={() => registerMutation.mutate(eventId)}
          variant="outline"
          size="lg"
          disabled={isMutating}
        >
          Запиши се в листа на чакащите
        </Button>
      ) : (
        <Button
          onClick={() => registerMutation.mutate(eventId)}
          size="lg"
          disabled={isMutating}
        >
          Участвай
        </Button>
      )}
      <p className="text-center text-xs text-muted-foreground">
        {isConfirmed
          ? "Ще получиш имейл известие преди събитието"
          : isWaitlisted
            ? "Ще те уведомим, когато се освободи място"
            : isFull
              ? "Няма свободни места — можеш да се запишеш в листата на чакащите"
              : ""}
      </p>
    </div>
  );
}

export default function EventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const { role } = useAuth();
  const logout = useLogout();

  const eventQuery = useEvent(eventId);
  const registrationsQuery = useMyRegistrations();

  const event = eventQuery.data;
  const registration = registrationsQuery.data?.find(
    (r) => r.event_id === eventId && r.status !== "cancelled",
  );

  const isConfirmed = registration?.status === "confirmed";
  const isWaitlisted = registration?.status === "waitlisted";
  const isFull = event ? event.confirmed_count >= event.capacity : false;

  return (
    <div className="flex min-h-screen flex-col bg-muted text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-card shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <Link
            to="/hefest-frontend/events"
            className="shrink-0 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Назад
          </Link>
          <div className="flex min-w-0 flex-1 justify-center">
            <Link
              to="/hefest-frontend/events"
              className="flex items-center gap-2.5"
            >
              <svg
                className="h-5 w-5 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <title>EventHub Logo</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="font-heading text-sm font-bold tracking-widest uppercase text-foreground">
                EventHub
              </span>
            </Link>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
          >
            Изход
          </Button>
        </div>
      </header>

      <main className="mx-auto mt-6 w-full max-w-3xl flex-1 p-4">
        {eventQuery.isPending ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            Зареждане...
          </p>
        ) : eventQuery.isError ? (
          <p className="py-12 text-center text-sm text-destructive">
            {getApiErrorMessage(
              eventQuery.error,
              "Събитието не може да бъде заредено.",
            )}
          </p>
        ) : event ? (
          <div className="space-y-0 border border-border bg-card">
            {/* Title block */}
            <div className="border-l-[3px] border-l-primary px-6 py-6">
              <div className="mb-2 flex items-start justify-between gap-4">
                <h1 className="text-2xl font-semibold leading-snug text-card-foreground">
                  {event.title}
                </h1>
                <span className="shrink-0 bg-green-100 px-2.5 py-0.5 text-xs font-semibold tracking-wide text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  АКТИВНО
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Организатор: {event.organizer_name}
              </p>
            </div>

            {/* Meta grid */}
            <div className="grid grid-cols-2 gap-x-5 gap-y-4 border-y border-border bg-muted/40 px-6 py-5 sm:grid-cols-4">
              <div>
                <p className="mb-0.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Начало
                </p>
                <p className="text-sm font-medium tabular-nums">
                  {formatDateTime(event.starts_at)}
                </p>
              </div>
              {event.ends_at && (
                <div>
                  <p className="mb-0.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Край
                  </p>
                  <p className="text-sm font-medium tabular-nums">
                    {formatDateTime(event.ends_at)}
                  </p>
                </div>
              )}
              <div>
                <p className="mb-0.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Места
                </p>
                <p className="text-sm font-medium tabular-nums">
                  {isFull ? (
                    <span className="text-destructive">Пълно</span>
                  ) : (
                    <>
                      {event.confirmed_count}{" "}
                      <span className="font-normal text-muted-foreground">
                        / {event.capacity}
                      </span>
                    </>
                  )}
                  {event.waitlist_count > 0 && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      (+{event.waitlist_count} чакащи)
                    </span>
                  )}
                </p>
              </div>
              <div className="col-span-full">
                <p className="mb-0.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Местоположение
                </p>
                <p className="text-sm font-medium break-words">
                  {URL_RE.test(event.location) ? (
                    <a
                      href={event.location}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline underline-offset-2 hover:opacity-80"
                    >
                      {event.location}
                    </a>
                  ) : (
                    event.location
                  )}
                </p>
              </div>
            </div>

            {/* Registration status */}
            {isConfirmed && (
              <div className="border-b border-border border-l-2 border-l-green-600 bg-green-50 px-6 py-3 dark:bg-green-900/20">
                <p className="text-sm font-medium text-green-800 dark:text-green-400">
                  Регистриран си за това събитие
                </p>
              </div>
            )}
            {isWaitlisted && (
              <div className="border-b border-border border-l-2 border-l-amber-500 bg-amber-50 px-6 py-3 dark:bg-amber-900/20">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-400">
                  В списъка на чакащите
                  {registration?.waitlist_position
                    ? ` — позиция ${registration.waitlist_position}`
                    : ""}
                </p>
              </div>
            )}

            {/* Description */}
            <div className="px-6 py-6">
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Описание
              </p>
              <Description text={event.description} />
            </div>

            {/* Action */}
            {role === "student" && (
              <div className="border-t border-border px-6 py-5">
                <RegistrationAction
                  registration={registration}
                  eventId={event.id as unknown as string}
                  isFull={isFull}
                />
              </div>
            )}
          </div>
        ) : null}
      </main>

      <footer className="mt-10 w-full border-t border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-6 text-center text-xs text-muted-foreground">
          EventHub — Платформа за училищни събития и уъркшопи.
        </div>
      </footer>
    </div>
  );
}
