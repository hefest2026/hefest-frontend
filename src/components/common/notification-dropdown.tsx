import { useNavigate } from "react-router-dom";
import type { NotificationResponse } from "@/api/types";
import {
  useMarkAllRead,
  useMarkRead,
  useNotifications,
} from "@/hooks/use-notifications";
import {
  formatRelativeTime,
  notificationTitle,
} from "@/lib/notification-display";
import { cn } from "@/lib/utils";

interface NotificationDropdownProps {
  /** Whether the panel is open (drives the enabled list query). */
  isOpen: boolean;
  /** Close the panel (e.g. after navigating away). */
  onClose: () => void;
}

/**
 * The notification feed panel. Renders relative timestamps, bolds unread rows
 * with a dot indicator, marks an item read on click (navigating to its event
 * when present), and offers a bulk "mark all read" action.
 */
export function NotificationDropdown({
  isOpen,
  onClose,
}: NotificationDropdownProps) {
  const navigate = useNavigate();
  const { data: notifications, isLoading } = useNotifications(isOpen);
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();

  const hasUnread = (notifications ?? []).some((n) => n.read_at === null);

  const handleItemClick = (notification: NotificationResponse) => {
    if (notification.read_at === null) {
      markRead.mutate(notification.id);
    }
    if (notification.event_id) {
      navigate(`/hefest-frontend/events/${notification.event_id}`);
      onClose();
    }
  };

  return (
    <div className="absolute right-0 top-full z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] border border-border bg-card shadow-lg">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <span className="text-sm font-semibold text-foreground">Известия</span>
        <button
          type="button"
          onClick={() => markAllRead.mutate()}
          disabled={!hasUnread || markAllRead.isPending}
          className="text-xs font-medium text-primary transition-colors hover:underline disabled:cursor-default disabled:text-muted-foreground disabled:no-underline"
        >
          Маркирай всички като прочетени
        </button>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {isLoading ? (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground">
            Зареждане…
          </p>
        ) : (notifications ?? []).length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground">
            Нямате известия.
          </p>
        ) : (
          <ul>
            {(notifications ?? []).map((notification) => {
              const unread = notification.read_at === null;
              return (
                <li key={notification.id}>
                  <button
                    type="button"
                    onClick={() => handleItemClick(notification)}
                    className={cn(
                      "flex w-full items-start gap-2.5 border-b border-border px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-accent",
                      unread ? "bg-accent/40" : "bg-card",
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                        unread ? "bg-primary" : "bg-transparent",
                      )}
                    />
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <span
                        className={cn(
                          "text-sm leading-snug text-foreground",
                          unread ? "font-semibold" : "font-normal",
                        )}
                      >
                        {notificationTitle(notification)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(notification.created_at)}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
