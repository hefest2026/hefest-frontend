import { useMemo, useState } from "react";
import { getApiErrorMessage } from "@/api/client";
import type { EventResponse } from "@/api/types";
import { useAuth } from "@/auth/auth-context";
import { AccountTab } from "@/components/common/account-tab";
import { EventsLayout } from "@/components/common/events-layout";
import { Button } from "@/components/ui/button";
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

interface PublishedEventCardProps {
  event: EventResponse;
  isOwner: boolean;
  onCancel: (eventId: string) => void;
  isCancelling: boolean;
}

function PublishedEventCard({
  event,
  isOwner,
  onCancel,
  isCancelling,
}: PublishedEventCardProps) {
  return (
    <div className="border border-border bg-card p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-medium text-card-foreground">
            {event.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {event.description}
          </p>
        </div>
        {isOwner && (
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 text-destructive"
            onClick={() => onCancel(event.id)}
            disabled={isCancelling}
          >
            Отмени
          </Button>
        )}
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 border-t border-border pt-4 text-sm text-muted-foreground sm:grid-cols-4">
        <div>
          <strong className="text-foreground">Начало:</strong>{" "}
          {formatDisplayDate(event.starts_at)}
        </div>
        <div>
          <strong className="text-foreground">Място:</strong> {event.location}
        </div>
        <div>
          <strong className="text-foreground">Места:</strong>{" "}
          {event.confirmed_count} / {event.capacity}
        </div>
        {isOwner && (
          <div>
            <span className="inline-block border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              Твое събитие
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export const EventManager = () => {
  const { userId } = useAuth();
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
                <PublishedEventCard
                  key={event.id}
                  event={event}
                  isOwner={event.organizer_id === userId}
                  onCancel={(id) => cancelMutation.mutate(id)}
                  isCancelling={cancelMutation.isPending}
                />
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
