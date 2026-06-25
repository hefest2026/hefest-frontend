import type React from "react"
import { useState } from "react"
//import { Button } from "@/components/ui/button"
import { EventOrganizerPanel } from "../components/event-draft"
import { PublishConfirmation } from "../components/event-confirmation"

interface BaseEvent {
  id: string
  title: string
  description: string
  starts_at: string
  ends_at?: string
  capacity: number
  location?: string
}

interface DraftEvent extends BaseEvent {
  status: "DRAFT"
}

interface PublishedEvent extends BaseEvent {
  status: "PUBLISHED"
  published_at: string
}

type Event = DraftEvent | PublishedEvent

export const EventManager = () => {
  const [draftEvents, setDraftEvents] = useState<DraftEvent[]>([])
  const [publishedEvents, setPublishedEvents] = useState<PublishedEvent[]>([])
  const [publishingEventId, setPublishingEventId] = useState<string | null>(
    null
  )
  const [isPublishing, setIsPublishing] = useState(false)

  const handlePublish = (event: Event) => {
    setPublishingEventId(event.id)
  }

  // 1. Remove the eventId parameter entirely
  const confirmPublish = async () => {
    // If there's no ID in state, get out early
    if (!publishingEventId) return

    setIsPublishing(true)

    // 2. Use publishingEventId straight from state
    const eventToPublish = draftEvents.find((e) => e.id === publishingEventId)

    if (!eventToPublish) {
      setIsPublishing(false)
      return
    }

    try {
      const publishedEvent: PublishedEvent = {
        ...eventToPublish,
        status: "PUBLISHED",
        published_at: new Date().toISOString(),
      }

      setPublishedEvents((prevPublished) => [...prevPublished, publishedEvent])

      // 3. Filter using the state ID
      setDraftEvents((prevDrafts) =>
        prevDrafts.filter((e) => e.id !== publishingEventId)
      )

      setPublishingEventId(null)
    } catch (error) {
      console.error("Error publishing event:", error)
    } finally {
      setIsPublishing(false)
    }
  }
  const cancelPublish = () => {
    setPublishingEventId(null)
  }

  const eventToPublish = draftEvents.find((e) => e.id === publishingEventId)

  return (
    <div>
      <EventOrganizerPanel
        events={draftEvents}
        onEventsChange={setDraftEvents}
        onPublishRequest={handlePublish}
      />

      {eventToPublish && (
        <PublishConfirmation
          event={eventToPublish}
          onPublish={confirmPublish} // Safely runs now regardless of what the child component sends back
          onCancel={cancelPublish}
          isLoading={isPublishing}
        />
      )}

      {publishedEvents.length > 0 && (
        <div
          style={{
            marginTop: "3rem",
            paddingTop: "2rem",

            borderTop: "0.5px solid var(--color-border-tertiary)",
          }}
          className="mx-auto max-w-4xl p-4"
        >
          <h2
            style={{ fontSize: "18px", fontWeight: 500, marginBottom: "1rem" }}
          >
            Публикувани събития ({publishedEvents.length})
          </h2>
          <div style={{ display: "grid", gap: "1rem" }}>
            {publishedEvents.map((event) => (
              <div
                key={event.id}
                style={{
                  background: "var(--color-background-primary)",
                  border: "0.5px solid var(--color-border-tertiary)",
                  borderRadius: "var(--border-radius-lg)",
                  padding: "1rem 1.25rem",
                }}
              >
                <div style={{ marginBottom: "0.75rem" }}>
                  <h3
                    style={{
                      fontSize: "16px",
                      fontWeight: 500,
                      margin: "0 0 0.5rem",
                      lineHeight: 1.5,
                      wordBreak: "break-word",
                    }}
                  >
                    {event.title}
                  </h3>
                  <p
                    style={{
                      fontSize: "14px",
                      color: "var(--color-text-secondary)",
                      margin: 0,
                      lineHeight: 1.5,
                      wordBreak: "break-word",
                    }}
                  >
                    {event.description}
                  </p>
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "var(--color-text-tertiary)",
                  }}
                >
                  Публикувано:{" "}
                  {new Date(event.published_at).toLocaleString("bg-BG")}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
