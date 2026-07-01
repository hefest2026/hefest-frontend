import { apiClient } from "./client";
import type {
  EventCreateRequest,
  EventDetailResponse,
  EventResponse,
  EventUpdateRequest,
  ListEventsParams,
} from "./types";

/** Create a new event in DRAFT status. */
export async function createEvent(
  data: EventCreateRequest,
): Promise<EventResponse> {
  const response = await apiClient.post<EventResponse>("/events", data);
  return response.data;
}

/** List events visible to the caller (students: published only). */
export async function listEvents(
  params: ListEventsParams = {},
): Promise<EventResponse[]> {
  const response = await apiClient.get<EventResponse[]>("/events", { params });
  return response.data;
}

/** Get event details including live confirmed/waitlist counts. */
export async function getEvent(eventId: string): Promise<EventDetailResponse> {
  const response = await apiClient.get<EventDetailResponse>(
    `/events/${eventId}`,
  );
  return response.data;
}

/** Update a DRAFT event (organizer/owner only). */
export async function updateEvent(
  eventId: string,
  data: EventUpdateRequest,
): Promise<EventResponse> {
  const response = await apiClient.put<EventResponse>(
    `/events/${eventId}`,
    data,
  );
  return response.data;
}

/** Publish a DRAFT event (organizer/owner only). */
export async function publishEvent(eventId: string): Promise<EventResponse> {
  const response = await apiClient.post<EventResponse>(
    `/events/${eventId}/publish`,
  );
  return response.data;
}

/** Cancel an event (organizer/owner only). */
export async function cancelEvent(eventId: string): Promise<EventResponse> {
  const response = await apiClient.post<EventResponse>(
    `/events/${eventId}/cancel`,
  );
  return response.data;
}
