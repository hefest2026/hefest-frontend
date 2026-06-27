import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cancelEvent,
  createEvent,
  getEvent,
  listEvents,
  publishEvent,
  updateEvent,
} from "@/api/events";
import type {
  EventCreateRequest,
  EventUpdateRequest,
  ListEventsParams,
} from "@/api/types";
import { queryKeys } from "@/lib/query-keys";

/** List events visible to the caller. */
export function useEvents(params: ListEventsParams = {}) {
  return useQuery({
    queryKey: queryKeys.events.list(params),
    queryFn: () => listEvents(params),
    staleTime: 1000 * 30,
  });
}

/** Single event with live seat counts. */
export function useEvent(eventId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.events.detail(eventId ?? ""),
    queryFn: () => getEvent(eventId as string),
    enabled: !!eventId,
  });
}

/** Mutations that change the event list all invalidate it on success. */
function useInvalidateEvents() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.events.all() });
}

export function useCreateEvent() {
  const invalidate = useInvalidateEvents();
  return useMutation({
    mutationFn: (data: EventCreateRequest) => createEvent(data),
    onSuccess: invalidate,
  });
}

export function useUpdateEvent() {
  const invalidate = useInvalidateEvents();
  return useMutation({
    mutationFn: ({
      eventId,
      data,
    }: {
      eventId: string;
      data: EventUpdateRequest;
    }) => updateEvent(eventId, data),
    onSuccess: invalidate,
  });
}

export function usePublishEvent() {
  const invalidate = useInvalidateEvents();
  return useMutation({
    mutationFn: (eventId: string) => publishEvent(eventId),
    onSuccess: invalidate,
  });
}

export function useCancelEvent() {
  const invalidate = useInvalidateEvents();
  return useMutation({
    mutationFn: (eventId: string) => cancelEvent(eventId),
    onSuccess: invalidate,
  });
}
