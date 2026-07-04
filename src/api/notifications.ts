import { apiClient } from "./client";
import type {
  NotificationResponse,
  PaginationParams,
  UnreadCountResponse,
} from "./types";

/** The signed-in user's personal notifications, newest first. */
export async function listNotifications(
  params: PaginationParams = {},
): Promise<NotificationResponse[]> {
  const response = await apiClient.get<NotificationResponse[]>(
    "/notifications",
    {
      params,
    },
  );
  return response.data;
}

/** The signed-in user's unread notification count. */
export async function getUnreadCount(): Promise<UnreadCountResponse> {
  const response = await apiClient.get<UnreadCountResponse>(
    "/notifications/unread-count",
  );
  return response.data;
}

/** Mark a single notification as read (idempotent). */
export async function markNotificationRead(id: string): Promise<void> {
  await apiClient.post(`/notifications/${id}/read`);
}

/** Mark every unread notification for the caller as read. */
export async function markAllNotificationsRead(): Promise<void> {
  await apiClient.post("/notifications/read-all");
}
