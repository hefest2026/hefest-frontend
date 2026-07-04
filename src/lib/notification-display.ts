import type { NotificationResponse, NotificationType } from "@/api/types";

/** Read the event title from a notification payload, with a safe fallback. */
function eventTitle(payload: Record<string, unknown>): string {
  const title = payload.event_title;
  return typeof title === "string" && title.length > 0 ? title : "събитието";
}

/** Read the waitlist position from a payload, if present. */
function waitlistPosition(payload: Record<string, unknown>): number | null {
  const pos = payload.waitlist_position;
  return typeof pos === "number" ? pos : null;
}

/**
 * Build the Bulgarian display text for a notification purely from its type and
 * payload — no i18n strings round-trip through the backend.
 */
export function notificationTitle(notification: NotificationResponse): string {
  const { notification_type: type, payload } = notification;
  const title = eventTitle(payload);

  const builders: Record<NotificationType, () => string> = {
    RegistrationConfirmed: () => `Записахте се за „${title}“`,
    RegistrationWaitlisted: () => {
      const pos = waitlistPosition(payload);
      const suffix = pos !== null ? ` (позиция ${pos})` : "";
      return `В списъка на изчакване за „${title}“${suffix}`;
    },
    WaitlistPromoted: () => `Освободи се място — записани сте за „${title}“`,
    RegistrationCancelled: () => `Регистрацията ви за „${title}“ е отменена`,
    EventCancelled: () => `„${title}“ беше отменено`,
    EventUpdated: () => `„${title}“ беше обновено`,
    Welcome: () => "Добре дошли в Hefest!",
  };

  return builders[type]();
}

const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

/**
 * Format an ISO timestamp as a short relative time in Bulgarian
 * (e.g. "сега", "преди 5 мин", "преди 2 ч"), falling back to an absolute date
 * for anything older than a week.
 */
export function formatRelativeTime(
  iso: string,
  now: Date = new Date(),
): string {
  const then = new Date(iso);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (seconds < MINUTE) {
    return "сега";
  }
  if (seconds < HOUR) {
    return `преди ${Math.floor(seconds / MINUTE)} мин`;
  }
  if (seconds < DAY) {
    return `преди ${Math.floor(seconds / HOUR)} ч`;
  }
  if (seconds < WEEK) {
    return `преди ${Math.floor(seconds / DAY)} дн`;
  }
  return then.toLocaleDateString("bg-BG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
