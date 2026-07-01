import { apiClient } from "./client";
import type {
  ListNotificationJobsParams,
  NotificationJobDetailResponse,
  NotificationJobResponse,
} from "./types";

/** List outbox jobs for events owned by the current organizer. */
export async function listNotificationJobs(
  params: ListNotificationJobsParams = {},
): Promise<NotificationJobResponse[]> {
  const response = await apiClient.get<NotificationJobResponse[]>(
    "/notification-jobs",
    {
      params,
    },
  );
  return response.data;
}

/** Get a single outbox job with its delivery status. */
export async function getNotificationJob(
  jobId: string,
): Promise<NotificationJobDetailResponse> {
  const response = await apiClient.get<NotificationJobDetailResponse>(
    `/notification-jobs/${jobId}`,
  );
  return response.data;
}
