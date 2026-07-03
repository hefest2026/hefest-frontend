import { Link } from "react-router-dom";
import type { EventResponse, MyRegistrationResponse } from "@/api/types";
import { Button } from "@/components/ui/button";
import { stripLocationCoords } from "@/lib/location-coords";

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

export interface EventCardProps {
  event: EventResponse;
  registration: MyRegistrationResponse | undefined;
  onRegister: (eventId: string) => void;
  onCancel: (regId: string) => void;
  isMutating: boolean;
}

export function EventCard({
  event,
  registration,
  onRegister,
  onCancel,
  isMutating,
}: EventCardProps) {
  const isConfirmed = registration?.status === "confirmed";
  const isWaitlisted = registration?.status === "waitlisted";
  const isFull = event.confirmed_count >= event.capacity;
  const spotsLeft = event.capacity - event.confirmed_count;

  return (
    <div className="flex flex-col border border-border border-l-[3px] border-l-primary bg-card">
      <div className="p-5 pb-4">
        <div className="mb-3 flex items-start justify-between gap-4">
          <Link
            to={`/hefest-frontend/events/${event.id}`}
            className="text-base font-semibold leading-snug text-card-foreground underline-offset-2 hover:underline"
          >
            {event.title}
          </Link>
          <span className="shrink-0 bg-green-100 px-2.5 py-0.5 text-xs font-semibold tracking-wide text-green-700 dark:bg-green-900/30 dark:text-green-400">
            АКТИВНО
          </span>
        </div>
        <p className="line-clamp-2 text-sm leading-relaxed break-words text-muted-foreground">
          {event.description}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-x-5 gap-y-4 border-y border-border bg-muted/40 px-5 py-4 md:grid-cols-4">
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
                <span className="text-muted-foreground font-normal">
                  / {event.capacity}
                </span>
              </>
            )}
          </p>
        </div>
        <div className="col-span-full">
          <p className="mb-0.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Местоположение
          </p>
          <p className="text-sm font-medium break-words">
            {stripLocationCoords(event.location)}
          </p>
        </div>
      </div>

      <div className="p-5 pt-4">
        {isConfirmed && (
          <div className="mb-4 border-l-2 border-green-600 bg-green-50 px-3 py-2 dark:bg-green-900/20">
            <p className="text-sm font-medium text-green-800 dark:text-green-400">
              Регистриран си за това събитие
            </p>
          </div>
        )}
        {isWaitlisted && (
          <div className="mb-4 border-l-2 border-amber-500 bg-amber-50 px-3 py-2 dark:bg-amber-900/20">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-400">
              В списъка на чакащите
              {registration?.waitlist_position
                ? ` — позиция ${registration.waitlist_position}`
                : ""}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">
            {isConfirmed
              ? "Ще получиш известие преди събитието"
              : isWaitlisted
                ? "Ще те уведомим при свободно място"
                : isFull
                  ? "Няма свободни места"
                  : `${spotsLeft} свободни места`}
          </span>
          {registration ? (
            <Button
              onClick={() => onCancel(registration.id)}
              variant="outline"
              size="sm"
              className="shrink-0 text-destructive"
              disabled={isMutating}
            >
              {isWaitlisted ? "Напусни списъка" : "Откажи участието"}
            </Button>
          ) : isFull ? (
            <Button
              onClick={() => onRegister(event.id)}
              variant="outline"
              className="shrink-0"
              disabled={isMutating}
            >
              Запиши се в листа на чакащите
            </Button>
          ) : (
            <Button
              onClick={() => onRegister(event.id)}
              size="lg"
              className="shrink-0"
              disabled={isMutating}
            >
              Участвай
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
