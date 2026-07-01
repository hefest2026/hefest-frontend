import { apiClient } from "./client";
import type { OrganizerStats } from "./types";

/** Fetch dashboard aggregates for the current organizer's own events. */
export async function getStats(): Promise<OrganizerStats> {
  const response = await apiClient.get<OrganizerStats>("/stats");
  return response.data;
}
