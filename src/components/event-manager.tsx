import { useState } from "react"
import { Button } from "@/components/ui/button"
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

// Mock data representing events published by OTHER users in the system
const MOCK_GLOBAL_EVENTS: PublishedEvent[] = [
  {
    id: "global-1",
    title: "React Advanced Уъркшоп",
    description:
      "Дълбоко гмуркане в архитектурата на компонентите, Server Actions и оптимизация на производителността.",
    starts_at: "2026-07-15T10:00:00",
    ends_at: "2026-07-15T16:00:00",
    capacity: 45,
    location: "София Тех Парк, Сграда Инкубатор",
    status: "PUBLISHED",
    published_at: "2026-06-20T12:00:00",
  },
  {
    id: "global-2",
    title: "AI & Дизайн Нетуъркинг Вечер",
    description:
      "Дискусия и демонстрации на тема как генеративният изкуствен интелект променя UI/UX процесите.",
    starts_at: "2026-07-22T19:00:00",
    ends_at: "2026-07-22T21:30:00",
    capacity: 30,
    location: "ул. „Генерал Гурко“ 12, София",
    status: "PUBLISHED",
    published_at: "2026-06-24T09:15:00",
  },
]

export const EventManager = () => {
  // Navigation State: 'manage' (Organizer Panel) vs 'all-events' (Global Feed)
  const [activeTab, setActiveTab] = useState<"manage" | "all-events">("manage")

  const [draftEvents, setDraftEvents] = useState<DraftEvent[]>([])
  const [publishedEvents, setPublishedEvents] = useState<PublishedEvent[]>([])
  const [globalEvents] = useState<PublishedEvent[]>(MOCK_GLOBAL_EVENTS)

  const [publishingEventId, setPublishingEventId] = useState<string | null>(
    null
  )
  const [isPublishing, setIsPublishing] = useState(false)

  const handlePublish = (event: Event) => {
    setPublishingEventId(event.id)
  }

  const confirmPublish = async () => {
    if (!publishingEventId) return

    setIsPublishing(true)
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

  // Action to delete a published event (Only allowed for own events)
  const handleDeleteOwnPublished = (eventId: string) => {
    setPublishedEvents((prev) => prev.filter((e) => e.id !== eventId))
  }

  const eventToPublish = draftEvents.find((e) => e.id === publishingEventId)

  // Combine own published events and other users' events for the "All Events" view
  const allAvailablePublishedEvents = [...publishedEvents, ...globalEvents]

  // Helper formatting function for dates
  const formatDisplayDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleString("bg-BG", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return isoString
    }
  }

  return (
    <div className="mx-auto max-w-4xl p-4">
      {/* Tab Navigation Menu */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "2.5rem",
          borderBottom: "1px solid var(--color-primary)",
          paddingBottom: "0.75rem",
        }}
      >
        <button
          onClick={() => setActiveTab("manage")}
          style={{
            background: "none",
            border: "none",
            fontSize: "16px",
            fontWeight: activeTab === "manage" ? 600 : 400,
            color:
              activeTab === "manage" ? "black" : "var(--color-text-secondary)",
            borderBottom:
              activeTab === "manage"
                ? "2px solid var(--color-primary)"
                : "none",
            padding: "0.5rem 1rem",
            cursor: "pointer",
            marginBottom: "-13px",
          }}
        >
          Организаторски панел
        </button>
        <button
          onClick={() => setActiveTab("all-events")}
          style={{
            background: "none",
            border: "none",
            fontSize: "16px",
            fontWeight: activeTab === "all-events" ? 600 : 400,
            color:
              activeTab === "all-events"
                ? "black"
                : "var(--color-text-secondary)",
            borderBottom:
              activeTab === "all-events"
                ? "2px solid var(--color-primary)"
                : "none",
            padding: "0.5rem 1rem",
            cursor: "pointer",
            marginBottom: "-13px",
          }}
        >
          Всички публикувани събития ({allAvailablePublishedEvents.length})
        </button>
      </div>

      {/* TAB 1: MANAGEMENT TAB */}
      {activeTab === "manage" && (
        <div>
          <EventOrganizerPanel
            events={draftEvents}
            onEventsChange={setDraftEvents}
            onPublishRequest={handlePublish}
          />

          {/* Local User Published List (Quick summary inside panel) */}
          {publishedEvents.length > 0 && (
            <div
              style={{
                marginTop: "3rem",
                paddingTop: "2rem",
                borderTop: "0.5px solid var(--color-border-tertiary)",
              }}
            >
              <h2
                style={{
                  fontSize: "18px",
                  fontWeight: 500,
                  marginBottom: "1rem",
                }}
              >
                Вашите публикувани събития ({publishedEvents.length})
              </h2>
              <div style={{ display: "grid", gap: "1rem" }}>
                {publishedEvents.map((event) => (
                  <div
                    key={event.id}
                    style={{
                      //   background: "var(--color-background-primary)",
                      //   border: "0.5px solid var(--color-border-tertiary)",
                      //   borderRadius: "var(--border-radius-lg)",
                      padding: "1rem 1.25rem",
                      //   display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                    className="border border-gray-200 bg-white"
                  >
                    <div>
                      <h3
                        style={{
                          fontSize: "16px",
                          fontWeight: 500,
                          margin: "0 0 0.25rem",
                        }}
                      >
                        {event.title}
                      </h3>
                      <div
                        style={{
                          fontSize: "13px",
                          color: "var(--color-text-tertiary)",
                        }}
                      >
                        Публикувано на: {formatDisplayDate(event.published_at)}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4 text-red-600"
                      onClick={() => handleDeleteOwnPublished(event.id)}
                    >
                      Изтриване
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: GLOBAL PUBLIC FEED TAB */}
      {activeTab === "all-events" && (
        <div>
          <h2
            style={{
              fontSize: "20px",
              fontWeight: 500,
              marginBottom: "1.5rem",
            }}
          >
            Всички налични събития в платформата
          </h2>

          {allAvailablePublishedEvents.length === 0 ? (
            <p
              style={{
                color: "var(--color-text-secondary)",
                textAlign: "center",
                padding: "2rem",
              }}
            >
              Няма публикувани събития в момента.
            </p>
          ) : (
            <div style={{ display: "grid", gap: "1.5rem" }}>
              {allAvailablePublishedEvents.map((event) => {
                // Check ownership dynamically by searching our local published state array
                const isMyOwnEvent = publishedEvents.some(
                  (e) => e.id === event.id
                )

                return (
                  <div
                    key={event.id}
                    className="border border-gray-200 bg-white p-5"
                    style={{
                      //   background: "white",
                      //   border: "1px solid var(--color-border-tertiary)",
                      //   padding: "1.5rem",
                      position: "relative",
                      //   boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    }}
                  >
                    {/* Badge showing if the item belongs to the organizer */}
                    <span
                      style={{
                        position: "absolute",
                        top: "1.5rem",
                        right: "1.5rem",
                        fontSize: "11px",
                        fontWeight: 600,
                        padding: "0.25rem 0.6rem",
                        borderRadius: "4px",
                        background: isMyOwnEvent
                          ? "var(--color-primary)"
                          : "#f3f4f6",
                        color: isMyOwnEvent ? "white" : "#4b5563",
                      }}
                    >
                      {isMyOwnEvent ? "ВАШЕ СЪБИТИЕ" : "ОРГАНИЗАТОР: ДРУГ"}
                    </span>

                    <div style={{ paddingRight: "7rem" }}>
                      <h3
                        style={{
                          fontSize: "18px",
                          fontWeight: 500,
                          margin: "0 0 0.5rem",
                          color: "var(--color-text-primary)",
                        }}
                      >
                        {event.title}
                      </h3>
                      <p
                        style={{
                          fontSize: "14px",
                          color: "var(--color-text-secondary)",
                          lineHeight: 1.5,
                          marginBottom: "1rem",
                        }}
                      >
                        {event.description}
                      </p>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(180px, 1fr))",
                        gap: "1rem",
                        fontSize: "13px",
                        borderTop: "1px solid #f3f4f6",
                        paddingTop: "1rem",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      <div>
                        <strong>Начало:</strong>{" "}
                        {formatDisplayDate(event.starts_at)}
                      </div>
                      {event.location && (
                        <div>
                          <strong>Място:</strong> {event.location}
                        </div>
                      )}
                      <div>
                        <strong>Капацитет:</strong> {event.capacity} места
                      </div>
                    </div>

                    {/* Dangerous Action Control: Rendered conditionally based on item ownership */}
                    {isMyOwnEvent && (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          marginTop: "1rem",
                        }}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => handleDeleteOwnPublished(event.id)}
                        >
                          Изтрийте вашето събитие
                        </Button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Global Modals */}
      {eventToPublish && (
        <PublishConfirmation
          event={eventToPublish}
          onPublish={confirmPublish}
          onCancel={cancelPublish}
          isLoading={isPublishing}
        />
      )}
    </div>
  )
}
