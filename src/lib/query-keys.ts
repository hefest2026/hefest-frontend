import type {
  ListEventsParams,
  ListNotificationJobsParams,
  PaginationParams,
} from "@/api/types";

/**
 * Hierarchical query-key factories. Keys are always arrays, structured so
 * broad invalidations cascade (e.g. invalidating `events.all()` clears every
 * event list and detail query).
 */
export const queryKeys = {
  events: {
    all: () => ["events"] as const,
    lists: () => [...queryKeys.events.all(), "list"] as const,
    list: (params: ListEventsParams) =>
      [...queryKeys.events.lists(), params] as const,
    details: () => [...queryKeys.events.all(), "detail"] as const,
    detail: (eventId: string) =>
      [...queryKeys.events.details(), eventId] as const,
    registrations: (eventId: string, params: PaginationParams) =>
      [...queryKeys.events.detail(eventId), "registrations", params] as const,
    waitlist: (eventId: string, params: PaginationParams) =>
      [...queryKeys.events.detail(eventId), "waitlist", params] as const,
  },
  registrations: {
    all: () => ["registrations"] as const,
    me: () => [...queryKeys.registrations.all(), "me"] as const,
  },
  notificationJobs: {
    all: () => ["notification-jobs"] as const,
    list: (params: ListNotificationJobsParams) =>
      [...queryKeys.notificationJobs.all(), "list", params] as const,
    detail: (jobId: string) =>
      [...queryKeys.notificationJobs.all(), "detail", jobId] as const,
  },
  providers: () => ["auth", "providers"] as const,
  me: () => ["auth", "me"] as const,
} as const;
