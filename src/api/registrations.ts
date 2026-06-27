import { apiClient } from "./client";
import type {
  MyRegistrationResponse,
  PaginationParams,
  RegistrationResponse,
  RegistrationSummary,
} from "./types";

/** Register the current student for a published event (CONFIRMED or WAITLISTED). */
export async function registerForEvent(
  eventId: string,
): Promise<RegistrationResponse> {
  const response = await apiClient.post<RegistrationResponse>(
    `/events/${eventId}/registrations`,
  );
  return response.data;
}

/** List confirmed registrations for an organizer's own event. */
export async function eventRegistrations(
  eventId: string,
  params: PaginationParams = {},
): Promise<RegistrationSummary[]> {
  const response = await apiClient.get<RegistrationSummary[]>(
    `/events/${eventId}/registrations`,
    { params },
  );
  return response.data;
}

/** List the current student's active registrations with waitlist positions. */
export async function myRegistrations(): Promise<MyRegistrationResponse[]> {
  const response =
    await apiClient.get<MyRegistrationResponse[]>("/registrations/me");
  return response.data;
}

/** Cancel the student's own registration (auto-promotes the next waitlisted student). */
export async function cancelRegistration(regId: string): Promise<void> {
  await apiClient.delete(`/registrations/${regId}`);
}

/** List the FIFO waitlist for an organizer's own event. */
export async function eventWaitlist(
  eventId: string,
  params: PaginationParams = {},
): Promise<RegistrationSummary[]> {
  const response = await apiClient.get<RegistrationSummary[]>(
    `/events/${eventId}/waitlist`,
    { params },
  );
  return response.data;
}
