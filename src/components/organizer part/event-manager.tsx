import { useMemo, useState } from "react";
import { getApiErrorMessage } from "@/api/client";
import type { EventResponse } from "@/api/types";
import { AccountTab } from "@/components/common/account-tab";
import { EventsLayout } from "@/components/common/events-layout";
import {
  useCancelEvent,
  useCreateEvent,
  useEvents,
  usePublishEvent,
  useUpdateEvent,
} from "@/hooks/use-events";
import { PublishConfirmation } from "./event-confirmation";
import { EventOrganizerPanel } from "./event-draft";

type OrganizerTab = "manage" | "all-events" | "account";

function formatDisplayDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? iso
    : date.toLocaleString("bg-BG", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
}

export const EventManager = () => {
  const [activeTab, setActiveTab] = useState<OrganizerTab>("manage");
  const [publishingEvent, setPublishingEvent] = useState<EventResponse | null>(
    null,
  );

  const eventsQuery = useEvents();
  const createMutation = useCreateEvent();
  const updateMutation = useUpdateEvent();
  const publishMutation = usePublishEvent();
  const cancelMutation = useCancelEvent();

  const { drafts, published } = useMemo(() => {
    const all = eventsQuery.data ?? [];
    return {
      drafts: all.filter((event) => event.status === "draft"),
      published: all.filter((event) => event.status === "published"),
    };
  }, [eventsQuery.data]);

  const isSubmitting =
    createMutation.isPending ||
    updateMutation.isPending ||
    publishMutation.isPending ||
    cancelMutation.isPending;

  const mutationError =
    createMutation.error ??
    updateMutation.error ??
    publishMutation.error ??
    cancelMutation.error;

  const confirmPublish = () => {
    if (!publishingEvent) return;
    publishMutation.mutate(publishingEvent.id, {
      onSuccess: () => setPublishingEvent(null),
    });
  };

  return (
    <EventsLayout
      activeTab={activeTab}
      onTabChange={(id) => setActiveTab(id as OrganizerTab)}
      tabs={[
        { id: "manage", label: "Организаторски панел" },
        { id: "all-events", label: `Всички събития (${published.length})` },
      ]}
    >
      {mutationError && (
        <p className="mb-4 text-sm font-medium text-destructive">
          {getApiErrorMessage(mutationError)}
        </p>
      )}

      {activeTab === "manage" && (
        <EventOrganizerPanel
          drafts={drafts}
          onCreate={(data) => createMutation.mutate(data)}
          onUpdate={(eventId, data) => updateMutation.mutate({ eventId, data })}
          onPublish={(event) => setPublishingEvent(event)}
          onDelete={(eventId) => cancelMutation.mutate(eventId)}
          isSubmitting={isSubmitting}
        />
      )}

      {activeTab === "all-events" && (
        <div>
          <h2 className="mb-6 text-xl font-medium text-gray-900">
            Всички налични събития в платформата
          </h2>
          {eventsQuery.isPending ? (
            <p className="py-12 text-center text-gray-500">Зареждане...</p>
          ) : published.length === 0 ? (
            <p className="border border-gray-200 bg-white py-12 text-center text-gray-500">
              Няма публикувани събития в момента.
            </p>
          ) : (
            <div className="grid gap-6">
              {published.map((event) => (
                <div
                  key={event.id}
                  className="border border-gray-200 bg-white p-6 shadow-sm"
                >
                  <h3 className="text-lg font-medium text-gray-900">
                    {event.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">
                    {event.description}
                  </p>
                  <div className="mt-6 grid grid-cols-1 gap-4 border-t border-gray-100 pt-4 text-sm text-gray-600 sm:grid-cols-3">
                    <div>
                      <strong className="text-gray-900">Начало:</strong>{" "}
                      {formatDisplayDate(event.starts_at)}
                    </div>
                    <div>
                      <strong className="text-gray-900">Място:</strong>{" "}
                      {event.location}
                    </div>
                    <div>
                      <strong className="text-gray-900">Капацитет:</strong>{" "}
                      {event.capacity} места
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "account" && <AccountTab />}

      {publishingEvent && (
        <PublishConfirmation
          event={publishingEvent}
          onPublish={confirmPublish}
          onCancel={() => setPublishingEvent(null)}
          isLoading={publishMutation.isPending}
        />
      )}
    </EventsLayout>
  );
};
