import type React from "react"
import { Button } from "@/components/ui/button"

interface DraftEvent {
  id: string
  title: string
  description: string
  starts_at: string
  ends_at?: string
  capacity: number
  location?: string
  status: "DRAFT"
}

interface PublishConfirmationProps {
  event: DraftEvent
  onPublish: (eventId: string) => void
  onCancel: () => void
  isLoading?: boolean
}

const formatDateTimeDisplay = (isoString: string): string => {
  if (!isoString) return ""

  const match = isoString.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/)
  if (!match) return ""

  const [, year, month, day, hours, minutes] = match
  return `${day}/${month}/${year} ${hours}:${minutes}`
}

const calculateDuration = (startISO: string, endISO?: string): string => {
  if (!endISO) return "Не е зададено"

  try {
    const start = new Date(startISO)
    const end = new Date(endISO)
    const diffMinutes = Math.round((end.getTime() - start.getTime()) / 60000)

    if (diffMinutes < 60) {
      return `${diffMinutes} мин.`
    }

    const hours = Math.floor(diffMinutes / 60)
    const mins = diffMinutes % 60
    return mins > 0 ? `${hours}ч ${mins}мин.` : `${hours}ч`
  } catch {
    return "Невалидни дати"
  }
}

export const PublishConfirmation: React.FC<PublishConfirmationProps> = ({
  event,
  onPublish,
  onCancel,
  isLoading = false,
}) => {
  const handlePublish = () => {
    onPublish(event.id)
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.45)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "var(--border-radius-lg)",
          border: "0.5px solid var(--color-border-tertiary)",
          padding: "2rem",
          maxWidth: "520px",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <div style={{ marginBottom: "2rem" }}>
          <h2
            style={{
              fontSize: "20px",
              fontWeight: 500,
              margin: "0 0 0.5rem",
              color: "var(--color-text-primary)",
            }}
          >
            Публикуване на събитието
          </h2>
          <p
            style={{
              fontSize: "14px",
              color: "var(--color-text-secondary)",
              margin: 0,
            }}
          >
            Преглед на детайлите преди публикуване
          </p>
        </div>

        <div
          style={{
            background: "var(--color-background-secondary)",
            borderRadius: "var(--border-radius-md)",
            padding: "1.25rem",
            marginBottom: "1.75rem",
          }}
        >
          <div style={{ marginBottom: "1.25rem" }}>
            <h3
              style={{
                fontSize: "16px",
                fontWeight: 500,
                margin: "0 0 0.5rem",
                color: "var(--color-text-primary)",
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
              borderTop: "0.5px solid var(--color-border-tertiary)",
              paddingTop: "1rem",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
            <div>
              <p
                style={{
                  fontSize: "12px",
                  color: "var(--color-text-tertiary)",
                  margin: "0 0 0.5rem",
                  textTransform: "uppercase",
                  fontWeight: 500,
                  letterSpacing: "0.4px",
                }}
              >
                Начало
              </p>
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: 500,
                  margin: 0,
                  color: "var(--color-text-primary)",
                }}
              >
                {formatDateTimeDisplay(event.starts_at)}
              </p>
            </div>

            {event.ends_at && (
              <div>
                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--color-text-tertiary)",
                    margin: "0 0 0.5rem",
                    textTransform: "uppercase",
                    fontWeight: 500,
                    letterSpacing: "0.4px",
                  }}
                >
                  Край
                </p>
                <p
                  style={{
                    fontSize: "14px",
                    fontWeight: 500,
                    margin: 0,
                    color: "var(--color-text-primary)",
                  }}
                >
                  {formatDateTimeDisplay(event.ends_at)}
                </p>
              </div>
            )}

            <div>
              <p
                style={{
                  fontSize: "12px",
                  color: "var(--color-text-tertiary)",
                  margin: "0 0 0.5rem",
                  textTransform: "uppercase",
                  fontWeight: 500,
                  letterSpacing: "0.4px",
                }}
              >
                Капацитет
              </p>
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: 500,
                  margin: 0,
                  color: "var(--color-text-primary)",
                }}
              >
                {event.capacity} {event.capacity === 1 ? "човек" : "човека"}
              </p>
            </div>

            {event.ends_at && (
              <div>
                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--color-text-tertiary)",
                    margin: "0 0 0.5rem",
                    textTransform: "uppercase",
                    fontWeight: 500,
                    letterSpacing: "0.4px",
                  }}
                >
                  Продължителност
                </p>
                <p
                  style={{
                    fontSize: "14px",
                    fontWeight: 500,
                    margin: 0,
                    color: "var(--color-text-primary)",
                  }}
                >
                  {calculateDuration(event.starts_at, event.ends_at)}
                </p>
              </div>
            )}

            {event.location && (
              <div style={{ gridColumn: "1 / -1" }}>
                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--color-text-tertiary)",
                    margin: "0 0 0.5rem",
                    textTransform: "uppercase",
                    fontWeight: 500,
                    letterSpacing: "0.4px",
                  }}
                >
                  Местоположение
                </p>
                <p
                  style={{
                    fontSize: "14px",
                    fontWeight: 500,
                    margin: 0,
                    color: "var(--color-text-primary)",
                    wordBreak: "break-word",
                  }}
                >
                  {event.location}
                </p>
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            padding: "0.75rem 1rem",
            marginBottom: "1.75rem",
          }}
        >
          <p className="bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700">
            {/* <i
              className="ti ti-info-circle"
              style={{
                fontSize: "16px",
                verticalAlign: "-2px",
                marginRight: "8px",
              }}
              aria-hidden="true"
            /> */}
            След публикуване събитието ще бъде видимо за всички. Можете да го
            редактирате или скриете по-късно.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "flex-end",
          }}
        >
          <Button
            onClick={onCancel}
            variant="outline"
            disabled={isLoading}
            style={{
              minWidth: "120px",
            }}
          >
            Отказ
          </Button>
          <Button
            onClick={handlePublish}
            disabled={isLoading}
            style={{
              minWidth: "120px",
            }}
          >
            {isLoading ? "Публикуване..." : "Публикуване"}
          </Button>
        </div>
      </div>
    </div>
  )
}
