import { getApiErrorMessage } from "@/api/client";
import type { RegistrationSummary } from "@/api/types";
import {
  useEventRegistrations,
  useEventWaitlist,
} from "@/hooks/use-registrations";

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? iso
    : date.toLocaleString("bg-BG", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
}

function AttendeeRow({
  registration,
  position,
}: {
  registration: RegistrationSummary;
  position?: number;
}) {
  return (
    <li className="flex items-center gap-3 px-4 py-3">
      {position !== undefined && (
        <span className="flex h-6 w-6 shrink-0 items-center justify-center bg-muted text-xs font-semibold tabular-nums text-muted-foreground">
          {position}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {registration.student_name}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {registration.student_email}
        </p>
      </div>
      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
        {formatDateTime(registration.registered_at)}
      </span>
    </li>
  );
}

function AttendeeList({
  title,
  registrations,
  isPending,
  isError,
  error,
  emptyLabel,
  numbered,
}: {
  title: string;
  registrations: RegistrationSummary[] | undefined;
  isPending: boolean;
  isError: boolean;
  error: unknown;
  emptyLabel: string;
  numbered?: boolean;
}) {
  return (
    <section className="border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h3>
        {registrations && (
          <span className="text-xs font-medium tabular-nums text-muted-foreground">
            {registrations.length}
          </span>
        )}
      </div>
      {isPending ? (
        <p className="px-4 py-6 text-center text-sm text-muted-foreground">
          Зареждане...
        </p>
      ) : isError ? (
        <p className="px-4 py-6 text-center text-sm text-destructive">
          {getApiErrorMessage(error, "Списъкът не може да бъде зареден.")}
        </p>
      ) : !registrations || registrations.length === 0 ? (
        <p className="px-4 py-6 text-center text-sm text-muted-foreground">
          {emptyLabel}
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {registrations.map((registration, index) => (
            <AttendeeRow
              key={registration.id}
              registration={registration}
              position={numbered ? index + 1 : undefined}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

/**
 * Organizer-only view of an event's participants: the confirmed list and the
 * ordered (FIFO) waitlist. Mounted only for the event owner, so the underlying
 * organizer-scoped queries never fire for other users.
 */
export function EventAttendees({ eventId }: { eventId: string }) {
  const registrationsQuery = useEventRegistrations(eventId);
  const waitlistQuery = useEventWaitlist(eventId);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <AttendeeList
        title="Записани участници"
        registrations={registrationsQuery.data}
        isPending={registrationsQuery.isPending}
        isError={registrationsQuery.isError}
        error={registrationsQuery.error}
        emptyLabel="Все още няма записани участници."
      />
      <AttendeeList
        title="Списък на чакащите"
        registrations={waitlistQuery.data}
        isPending={waitlistQuery.isPending}
        isError={waitlistQuery.isError}
        error={waitlistQuery.error}
        emptyLabel="Няма чакащи."
        numbered
      />
    </div>
  );
}
