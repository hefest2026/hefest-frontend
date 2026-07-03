import { useMemo, useState } from "react";
import { getApiErrorMessage } from "@/api/client";
import type { MyRegistrationResponse } from "@/api/types";
import { useEvents } from "@/hooks/use-events";
import {
  useCancelRegistration,
  useMyRegistrations,
  useRegisterForEvent,
} from "@/hooks/use-registrations";
import { stripLocationCoords } from "@/lib/location-coords";
import { EventCard } from "./event-card";

/** Pure events list — no tab chrome. Rendered inside EventsPage. */
export function StudentEventsList() {
  const eventsQuery = useEvents();
  const registrationsQuery = useMyRegistrations();
  const registerMutation = useRegisterForEvent();
  const cancelMutation = useCancelRegistration();
  const [search, setSearch] = useState("");

  const registrationByEvent = useMemo(() => {
    const map = new Map<string, MyRegistrationResponse>();
    for (const reg of registrationsQuery.data ?? []) {
      if (reg.status !== "cancelled") {
        map.set(reg.event_id, reg);
      }
    }
    return map;
  }, [registrationsQuery.data]);

  const allEvents = eventsQuery.data ?? [];
  const events = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return allEvents;
    return allEvents.filter((event) =>
      [event.title, event.description, stripLocationCoords(event.location)]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [allEvents, search]);
  const isMutating = registerMutation.isPending || cancelMutation.isPending;
  const actionError = registerMutation.error ?? cancelMutation.error;

  return (
    <div>
      <h1 className="mb-8 text-2xl font-medium">Публикувани събития</h1>
      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Търсене по заглавие, описание или местоположение..."
        aria-label="Търсене на събития"
        className="mb-6 h-9 w-full border border-input bg-transparent px-3 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
      />
      {actionError && (
        <p className="mb-4 text-sm font-medium text-destructive">
          {getApiErrorMessage(actionError)}
        </p>
      )}
      {eventsQuery.isPending ? (
        <p className="py-8 text-center text-gray-600">Зареждане...</p>
      ) : eventsQuery.isError ? (
        <p className="py-8 text-center text-destructive">
          {getApiErrorMessage(
            eventsQuery.error,
            "Неуспешно зареждане на събитията.",
          )}
        </p>
      ) : events.length === 0 ? (
        <p className="py-8 text-center text-gray-600">
          {search.trim()
            ? "Няма събития, отговарящи на търсенето."
            : "Няма налични събития в момента."}
        </p>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              registration={registrationByEvent.get(event.id)}
              onRegister={(id) => registerMutation.mutate(id)}
              onCancel={(regId) => cancelMutation.mutate(regId)}
              isMutating={isMutating}
            />
          ))}
        </div>
      )}
    </div>
  );
}
