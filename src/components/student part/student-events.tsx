import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AccountTab } from "../common/account-tab"

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
    participants: [12, 13, 14].map((id) => `student-${id}`), // Mock student IDs
    waitlist: [],
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
    participants: [14, 154, 54, 23, 67].map((id) => `student-${id}`), // Mock student IDs
    waitlist: [],
  },
]

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
  const [activeTab, setActiveTab] = useState<"all-events" | "account">(
    "all-events"
  )

  const [publishedEvents] = useState<PublishedEvent[]>([])
  const [globalEvents] = useState<PublishedEvent[]>(MOCK_GLOBAL_EVENTS)
  const allAvailablePublishedEvents = [...publishedEvents, ...globalEvents]
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
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900">
      {/* 1. HEADER & NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          {/* Logo / Brand Name */}
          <div
            className="flex cursor-pointer items-center gap-2"
            onClick={() => setActiveTab("all-events")}
          >
            <svg
              className="h-6 w-6 text-black"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-lg font-bold tracking-tight">EventHub</span>
          </div>

          {/* Moved Tab Navigation Menu */}
          <nav className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab("all-events")}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === "all-events"
                  ? "bg-primary text-white"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              Всички събития ({allAvailablePublishedEvents.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("account")}
              className={`flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === "account"
                  ? "bg-primary text-white"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Акаунт
            </button>
          </nav>
        </div>
      </header>
      <main>
        <div className="mx-auto mt-6 max-w-4xl p-4">
          {activeTab === "account" && <AccountTab />}
          {activeTab === "all-events" && (
            <div>
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
              <div className="mt-8 border border-gray-200 bg-white p-5">
                <h3 className="mb-4 font-medium">Твоята статистика</h3>
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
                    <p className="text-xs text-gray-600">Чакам място за</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {
                        localEvents.filter((e) =>
                          e.waitlist.includes(currentStudentId)
                        ).length
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
          )}
        </div>
      </main>
      <footer className="mx-auto mt-10 w-full flex-1 border-t border-gray-200 bg-white px-4 py-8 text-gray-600">
        <div className="max-w-6xl px-4 py-10">
          <div className="ml-10 grid grid-cols-1 place-items-center gap-8 md:grid-cols-4">
            {/* Branding Column */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-gray-900">
                  EventHub
                </span>
              </div>
              <p className="text-xs leading-relaxed text-gray-500">
                Модерната платформа за лесно организиране, управление и
                публикуване на училищни събития и уъркшопи.
              </p>
            </div>

            {/* Platform Links Column */}
            <div>
              <h4 className="mb-3 text-xs font-semibold tracking-wider text-gray-900 uppercase">
                Навигация
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <button
                    onClick={() => setActiveTab("all-events")}
                    className="transition-colors hover:text-gray-900"
                  >
                    Всички събития
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab("account")}
                    className="transition-colors hover:text-gray-900"
                  >
                    Управление на акаунт
                  </button>
                </li>
              </ul>
            </div>

            {/* Resources / Support Column */}
            <div>
              <h4 className="mb-3 text-xs font-semibold tracking-wider text-gray-900 uppercase">
                Документи
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <a
                    href="/hefest-frontend/privacy"
                    className="transition-colors hover:text-gray-900"
                  >
                    Политика за поверителност
                  </a>
                </li>
                <li>
                  <a
                    href="/hefest-frontend/terms"
                    className="transition-colors hover:text-gray-900"
                  >
                    Общи условия
                  </a>
                </li>
                <li>
                  <a href="" className="transition-colors hover:text-gray-900">
                    Помощен център / FAQ
                  </a>
                </li>
              </ul>
            </div>

            {/* Social Media Column */}
            <div>
              <h4 className="mb-3 text-xs font-semibold tracking-wider text-gray-900 uppercase">
                Последвайте ни
              </h4>
              <div className="flex gap-3">
                {/* Facebook */}
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded bg-gray-100 p-2 text-gray-600 transition-all hover:bg-gray-900 hover:text-white"
                >
                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                  </svg>
                </a>
                {/* LinkedIn */}
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded bg-gray-100 p-2 text-gray-600 transition-all hover:bg-gray-900 hover:text-white"
                >
                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
                {/* Twitter / X */}
                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded bg-gray-100 p-2 text-gray-600 transition-all hover:bg-gray-900 hover:text-white"
                >
                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
