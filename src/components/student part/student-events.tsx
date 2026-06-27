import { useMemo, useState } from "react";
import { getApiErrorMessage } from "@/api/client";
import type { EventResponse, MyRegistrationResponse } from "@/api/types";
import { Button } from "@/components/ui/button";
import { useEvents } from "@/hooks/use-events";
import {
  useCancelRegistration,
  useMyRegistrations,
  useRegisterForEvent,
} from "@/hooks/use-registrations";
import { AccountTab } from "../common/account-tab";
import { EventsLayout } from "../common/events-layout";

function formatDateTime(iso: string | null): string {
  if (!iso) return "Не е зададено";
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? "Невалидна дата"
    : date.toLocaleString("bg-BG", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
}

interface EventCardProps {
  event: EventResponse;
  registration: MyRegistrationResponse | undefined;
  onRegister: (eventId: string) => void;
  onCancel: (regId: string) => void;
  isMutating: boolean;
}

function EventCard({
  event,
  registration,
  onRegister,
  onCancel,
  isMutating,
}: EventCardProps) {
  const isConfirmed = registration?.status === "confirmed";
  const isWaitlisted = registration?.status === "waitlisted";

  return (
    <div className="flex flex-col border border-gray-200 bg-white p-5">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <h3 className="mb-1 text-base font-medium">{event.title}</h3>
          <p className="text-sm break-words text-gray-600">
            {event.description}
          </p>
        </div>
        <span className="ml-4 bg-green-100 px-3 py-1.5 text-xs font-medium whitespace-nowrap text-green-700">
          АКТИВНО
        </span>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-5 border-b border-gray-200 pb-5 md:grid-cols-4">
        <div>
          <p className="mb-1 text-xs text-gray-600">Начало</p>
          <p className="text-sm font-medium">
            {formatDateTime(event.starts_at)}
          </p>
        </div>
        {event.ends_at && (
          <div>
            <p className="mb-1 text-xs text-gray-600">Край</p>
            <p className="text-sm font-medium">
              {formatDateTime(event.ends_at)}
            </p>
          </div>
        )}
        <div>
          <p className="mb-1 text-xs text-gray-600">Капацитет</p>
          <p className="text-sm font-medium">{event.capacity}</p>
        </div>
        <div className="md:col-span-full">
          <p className="mb-1 text-xs text-gray-600">Местоположение</p>
          <p className="text-sm font-medium break-words">{event.location}</p>
        </div>
      </div>

      {isConfirmed && (
        <div className="mb-3 rounded-md bg-green-50 p-3">
          <p className="text-sm font-medium text-green-700">
            Регистриран си за това събитие
          </p>
        </div>
      )}
      {isWaitlisted && (
        <div className="mb-3 rounded-md bg-yellow-50 p-3">
          <p className="text-sm font-medium text-yellow-700">
            В списъка на чакащите
            {registration?.waitlist_position
              ? ` (№ ${registration.waitlist_position})`
              : ""}
          </p>
        </div>
      )}

      <div className="flex justify-end gap-2">
        {registration ? (
          <Button
            onClick={() => onCancel(registration.id)}
            variant="outline"
            size="sm"
            className="text-red-600"
            disabled={isMutating}
          >
            {isWaitlisted ? "Напусни списъка" : "Откажи участието"}
          </Button>
        ) : (
          <Button
            onClick={() => onRegister(event.id)}
            size="sm"
            disabled={isMutating}
          >
            Участвай
          </Button>
        )}
      </div>
    </div>
  );
}

export function StudentEventsList() {
  const [activeTab, setActiveTab] = useState<"all-events" | "account">(
    "all-events",
  );
  const eventsQuery = useEvents();
  const registrationsQuery = useMyRegistrations();
  const registerMutation = useRegisterForEvent();
  const cancelMutation = useCancelRegistration();

  const registrationByEvent = useMemo(() => {
    const map = new Map<string, MyRegistrationResponse>();
    for (const reg of registrationsQuery.data ?? []) {
      if (reg.status !== "cancelled") {
        map.set(reg.event_id, reg);
      }
    }
    return map;
  }, [registrationsQuery.data]);

  const events = eventsQuery.data ?? [];
  const isMutating = registerMutation.isPending || cancelMutation.isPending;
  const actionError = registerMutation.error ?? cancelMutation.error;

  return (
    <EventsLayout
      activeTab={activeTab}
      onTabChange={(id) => setActiveTab(id as "all-events" | "account")}
      tabs={[{ id: "all-events", label: `Всички събития (${events.length})` }]}
    >
      {activeTab === "account" ? (
        <AccountTab />
      ) : (
        <div>
          <h1 className="mb-8 text-2xl font-medium">Публикувани събития</h1>
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
              Няма налични събития в момента.
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
      )}
    </EventsLayout>
  );
}
