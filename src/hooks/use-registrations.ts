import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cancelRegistration,
  eventRegistrations,
  eventWaitlist,
  myRegistrations,
  registerForEvent,
} from "@/api/registrations";
import type { PaginationParams } from "@/api/types";
import { queryKeys } from "@/lib/query-keys";

/** The current student's active registrations with waitlist positions. */
export function useMyRegistrations() {
  return useQuery({
    queryKey: queryKeys.registrations.me(),
    queryFn: myRegistrations,
    staleTime: 1000 * 15,
  });
}

/** Confirmed registrations for an organizer's own event. */
export function useEventRegistrations(
  eventId: string | undefined,
  params: PaginationParams = {},
) {
  return useQuery({
    queryKey: queryKeys.events.registrations(eventId ?? "", params),
    queryFn: () => eventRegistrations(eventId as string, params),
    enabled: !!eventId,
  });
}

/** FIFO waitlist for an organizer's own event. */
export function useEventWaitlist(
  eventId: string | undefined,
  params: PaginationParams = {},
) {
  return useQuery({
    queryKey: queryKeys.events.waitlist(eventId ?? "", params),
    queryFn: () => eventWaitlist(eventId as string, params),
    enabled: !!eventId,
  });
}

/** Registering / cancelling shifts seat counts and the student's own list. */
function useInvalidateRegistrationState() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.registrations.me() });
    queryClient.invalidateQueries({ queryKey: queryKeys.events.all() });
  };
}

export function useRegisterForEvent() {
  const invalidate = useInvalidateRegistrationState();
  return useMutation({
    mutationFn: (eventId: string) => registerForEvent(eventId),
    onSuccess: invalidate,
  });
}

export function useCancelRegistration() {
  const invalidate = useInvalidateRegistrationState();
  return useMutation({
    mutationFn: (regId: string) => cancelRegistration(regId),
    onSuccess: invalidate,
  });
}
