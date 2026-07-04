import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getUnreadCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/api/notifications";
import type { NotificationResponse, UnreadCountResponse } from "@/api/types";
import { queryKeys } from "@/lib/query-keys";

/** Snapshot of the notification caches, captured for optimistic rollback. */
interface NotificationCacheSnapshot {
  list: NotificationResponse[] | undefined;
  count: UnreadCountResponse | undefined;
}

const POLL_INTERVAL_MS = 30_000;
const LIST_LIMIT = 50;

/**
 * The unread badge count. Cheap enough to run always once logged in — a single
 * count query polled every 30s and refetched when the tab regains focus.
 */
export function useUnreadCount(enabled = true) {
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: getUnreadCount,
    refetchInterval: POLL_INTERVAL_MS,
    refetchOnWindowFocus: true,
    enabled,
  });
}

/**
 * The notification feed. Fetched only while the dropdown is open so the list
 * query does not fire on every page load.
 */
export function useNotifications(isOpen: boolean) {
  return useQuery({
    queryKey: queryKeys.notifications.list(),
    queryFn: () => listNotifications({ limit: LIST_LIMIT }),
    enabled: isOpen,
  });
}

/**
 * Apply an optimistic transform to both notification caches, returning a
 * snapshot for rollback. Shared by the mark-read and mark-all-read mutations.
 */
function optimisticallyUpdate(
  queryClient: ReturnType<typeof useQueryClient>,
  transform: (list: NotificationResponse[]) => {
    next: NotificationResponse[];
    markedCount: number;
  },
): NotificationCacheSnapshot {
  const list = queryClient.getQueryData<NotificationResponse[]>(
    queryKeys.notifications.list(),
  );
  const count = queryClient.getQueryData<UnreadCountResponse>(
    queryKeys.notifications.unreadCount(),
  );

  let markedCount = 0;
  if (list) {
    const result = transform(list);
    markedCount = result.markedCount;
    queryClient.setQueryData(queryKeys.notifications.list(), result.next);
  }
  if (count) {
    queryClient.setQueryData<UnreadCountResponse>(
      queryKeys.notifications.unreadCount(),
      { count: Math.max(0, count.count - markedCount) },
    );
  }

  return { list, count };
}

function rollback(
  queryClient: ReturnType<typeof useQueryClient>,
  snapshot: NotificationCacheSnapshot | undefined,
): void {
  if (snapshot?.list !== undefined) {
    queryClient.setQueryData(queryKeys.notifications.list(), snapshot.list);
  }
  if (snapshot?.count !== undefined) {
    queryClient.setQueryData(
      queryKeys.notifications.unreadCount(),
      snapshot.count,
    );
  }
}

/** Mark one notification read, updating both the list and count optimistically. */
export function useMarkRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.notifications.all(),
      });
      const readAt = new Date().toISOString();
      return optimisticallyUpdate(queryClient, (list) => {
        let markedCount = 0;
        const next = list.map((n) => {
          if (n.id === id && n.read_at === null) {
            markedCount += 1;
            return { ...n, read_at: readAt };
          }
          return n;
        });
        return { next, markedCount };
      });
    },
    onError: (_err, _id, snapshot) => rollback(queryClient, snapshot),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.all(),
      }),
  });
}

/** Mark every notification read, updating both caches optimistically. */
export function useMarkAllRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.notifications.all(),
      });
      const readAt = new Date().toISOString();
      return optimisticallyUpdate(queryClient, (list) => {
        let markedCount = 0;
        const next = list.map((n) => {
          if (n.read_at === null) {
            markedCount += 1;
            return { ...n, read_at: readAt };
          }
          return n;
        });
        return { next, markedCount };
      });
    },
    onError: (_err, _vars, snapshot) => rollback(queryClient, snapshot),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.all(),
      }),
  });
}
