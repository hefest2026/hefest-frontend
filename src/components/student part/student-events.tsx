import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

interface BaseEvent {
  id: string
  title: string
  description: string
  starts_at: string
  ends_at?: string
  capacity: number
  location?: string
}

interface PublishedEvent extends BaseEvent {
  status: "PUBLISHED"
  published_at: string
  participants: string[] // array of student IDs
  waitlist: string[] // array of student IDs
}

interface StudentEventsPageProps {
  events: PublishedEvent[]
  currentStudentId: string
  onRegister: (eventId: string, studentId: string) => void
  onJoinWaitlist: (eventId: string, studentId: string) => void
  onCancel: (eventId: string, studentId: string) => void
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

const EventCard: React.FC<{
  event: PublishedEvent
  currentStudentId: string
  onRegister: (eventId: string) => void
  onJoinWaitlist: (eventId: string) => void
  onCancel: (eventId: string) => void
}> = ({ event, currentStudentId, onRegister, onJoinWaitlist, onCancel }) => {
  const isFull = event.participants.length >= event.capacity
  const isParticipating = event.participants.includes(currentStudentId)
  const isWaitlisted = event.waitlist.includes(currentStudentId)
  const availableSpots = event.capacity - event.participants.length

  return (
    <div
      className="border border-gray-200 bg-white p-5"
      style={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <h3 className="mb-1 text-base font-medium">{event.title}</h3>
          <p
            className="text-sm text-gray-600"
            style={{ wordBreak: "break-word" }}
          >
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
            {formatDateTimeDisplay(event.starts_at)}
          </p>
        </div>

        {event.ends_at && (
          <div>
            <p className="mb-1 text-xs text-gray-600">Край</p>
            <p className="text-sm font-medium">
              {formatDateTimeDisplay(event.ends_at)}
            </p>
          </div>
        )}

        <div>
          <p className="mb-1 text-xs text-gray-600">Капацитет</p>
          <p className="text-sm font-medium">
            {event.participants.length}/{event.capacity}
          </p>
        </div>

        {event.ends_at && (
          <div>
            <p className="mb-1 text-xs text-gray-600">Продължителност</p>
            <p className="text-sm font-medium">
              {calculateDuration(event.starts_at, event.ends_at)}
            </p>
          </div>
        )}

        {event.location && (
          <div className="md:col-span-full">
            <p className="mb-1 text-xs text-gray-600">Местоположение</p>
            <p className="text-sm font-medium break-words">{event.location}</p>
          </div>
        )}
      </div>

      {/* Status and Info */}
      <div className="mb-5">
        {isParticipating && (
          <div className="mb-3 rounded-md bg-green-50 p-3">
            <p className="text-sm font-medium text-green-700">
              ✓ Регистриран си за това събитие
            </p>
          </div>
        )}

        {isWaitlisted && (
          <div className="mb-3 rounded-md bg-yellow-50 p-3">
            <p className="text-sm font-medium text-yellow-700">
              ⏳ В списъка на чакащите (№
              {event.waitlist.indexOf(currentStudentId) + 1})
            </p>
          </div>
        )}

        {!isFull && !isParticipating && (
          <div className="bg-secondary p-3">
            <p className="text-sm font-medium text-black">
              📍 {availableSpots}
              {availableSpots === 1 ? " свободно място" : " свободни места"}
            </p>
          </div>
        )}

        {isFull && !isParticipating && !isWaitlisted && (
          <div className="bg-red-50 p-3">
            <p className="text-sm font-medium text-red-700">
              ⚠ Събитието е пълно. Можеш да се присъединиш към списъка на
              чакащите.
            </p>
          </div>
        )}

        {event.waitlist.length > 0 && (
          <p className="mt-3 text-xs text-gray-600">
            {event.waitlist.length} студент
            {event.waitlist.length === 1 ? "" : "и"} чакат място
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        {isParticipating && (
          <Button
            onClick={() => onCancel(event.id)}
            variant="outline"
            size="sm"
            className="text-red-600"
          >
            Откажи участието
          </Button>
        )}

        {!isParticipating && !isWaitlisted && !isFull && (
          <Button onClick={() => onRegister(event.id)} size="sm">
            Участвай
          </Button>
        )}

        {!isParticipating && !isWaitlisted && isFull && (
          <Button
            onClick={() => onJoinWaitlist(event.id)}
            size="sm"
            variant="outline"
          >
            Добави се в списъка
          </Button>
        )}

        {isWaitlisted && (
          <Button
            onClick={() => onCancel(event.id)}
            variant="outline"
            size="sm"
            className="text-red-600"
          >
            Напусни списъка
          </Button>
        )}
      </div>
    </div>
  )
}

export const StudentEventsList: React.FC<StudentEventsPageProps> = ({
  events,
  currentStudentId,
  onRegister,
  onJoinWaitlist,
  onCancel,
}) => {
  const [localEvents, setLocalEvents] = useState<PublishedEvent[]>(events)

  const handleRegister = (eventId: string) => {
    setLocalEvents(
      events.map((event) =>
        event.id === eventId
          ? {
              ...event,
              participants: [...event.participants, currentStudentId],
            }
          : event
      )
    )
    onRegister(eventId, currentStudentId)
  }

  const handleJoinWaitlist = (eventId: string) => {
    setLocalEvents(
      events.map((event) =>
        event.id === eventId
          ? {
              ...event,
              waitlist: [...event.waitlist, currentStudentId],
            }
          : event
      )
    )
    onJoinWaitlist(eventId, currentStudentId)
  }

  const handleCancel = (eventId: string) => {
    setLocalEvents(
      events.map((event) => {
        if (event.id === eventId) {
          const isParticipating = event.participants.includes(currentStudentId)
          const isWaitlisted = event.waitlist.includes(currentStudentId)

          if (isParticipating) {
            // Remove from participants
            const newParticipants = event.participants.filter(
              (id) => id !== currentStudentId
            )

            // Move first person from waitlist to participants if available
            if (event.waitlist.length > 0) {
              const firstWaitlisted = event.waitlist[0]
              return {
                ...event,
                participants: [...newParticipants, firstWaitlisted],
                waitlist: event.waitlist.slice(1),
              }
            }

            return {
              ...event,
              participants: newParticipants,
            }
          }

          if (isWaitlisted) {
            // Remove from waitlist
            return {
              ...event,
              waitlist: event.waitlist.filter((id) => id !== currentStudentId),
            }
          }
        }

        return event
      })
    )
    onCancel(eventId, currentStudentId)
  }

  if (events.length === 0) {
    return (
      <div className="mx-auto max-w-4xl p-4">
        <h1 className="mb-8 text-2xl font-medium">Публикувани събития</h1>
        <div className="py-8 text-center text-gray-600">
          <p>Няма налични събития в момента.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl p-4">
      <h1 className="mb-8 text-2xl font-medium">Публикувани събития</h1>

      <div className="space-y-4">
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            currentStudentId={currentStudentId}
            onRegister={handleRegister}
            onJoinWaitlist={handleJoinWaitlist}
            onCancel={handleCancel}
          />
        ))}
      </div>

      {/* Student Stats */}
      <div className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-5">
        <h3 className="mb-4 font-medium">Твоя статистика</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-600">Участвам в</p>
            <p className="text-lg font-semibold text-gray-900">
              {
                localEvents.filter((e) =>
                  e.participants.includes(currentStudentId)
                ).length
              }
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Чакам място</p>
            <p className="text-lg font-semibold text-gray-900">
              {
                localEvents.filter((e) => e.waitlist.includes(currentStudentId))
                  .length
              }
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Налични събития</p>
            <p className="text-lg font-semibold text-gray-900">
              {localEvents.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
