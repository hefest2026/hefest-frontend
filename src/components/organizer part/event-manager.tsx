import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AccountTab } from "../common/account-tab";
import { PublishConfirmation } from "../organizer part/event-confirmation";
import { EventOrganizerPanel } from "../organizer part/event-draft";

interface BaseEvent {
  id: string;
  title: string;
  description: string;
  starts_at: string;
  ends_at?: string;
  capacity: number;
  location?: string;
}

interface DraftEvent extends BaseEvent {
  status: "DRAFT";
}

interface PublishedEvent extends BaseEvent {
  status: "PUBLISHED";
  published_at: string;
}

type Event = DraftEvent | PublishedEvent;

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
];

export const EventManager = () => {
  // Navigation State updated to include 'account'
  const [activeTab, setActiveTab] = useState<
    "manage" | "all-events" | "account"
  >("manage");

  const [draftEvents, setDraftEvents] = useState<DraftEvent[]>([]);
  const [publishedEvents, setPublishedEvents] = useState<PublishedEvent[]>([]);
  const [globalEvents] = useState<PublishedEvent[]>(MOCK_GLOBAL_EVENTS);

  const [publishingEventId, setPublishingEventId] = useState<string | null>(
    null,
  );
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = (event: Event) => {
    setPublishingEventId(event.id);
  };

  const confirmPublish = async () => {
    if (!publishingEventId) return;

    setIsPublishing(true);
    const eventToPublish = draftEvents.find((e) => e.id === publishingEventId);

    if (!eventToPublish) {
      setIsPublishing(false);
      return;
    }

    try {
      const publishedEvent: PublishedEvent = {
        ...eventToPublish,
        status: "PUBLISHED",
        published_at: new Date().toISOString(),
      };

      setPublishedEvents((prevPublished) => [...prevPublished, publishedEvent]);
      setDraftEvents((prevDrafts) =>
        prevDrafts.filter((e) => e.id !== publishingEventId),
      );
      setPublishingEventId(null);
    } catch (error) {
      console.error("Error publishing event:", error);
    } finally {
      setIsPublishing(false);
    }
  };

  const cancelPublish = () => {
    setPublishingEventId(null);
  };

  const handleDeleteOwnPublished = (eventId: string) => {
    setPublishedEvents((prev) => prev.filter((e) => e.id !== eventId));
  };

  const eventToPublish = draftEvents.find((e) => e.id === publishingEventId);
  const allAvailablePublishedEvents = [...publishedEvents, ...globalEvents];

  const formatDisplayDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleString("bg-BG", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900">
      {/* 1. HEADER & NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          {/* Logo / Brand Name */}
          <button
            type="button"
            className="flex cursor-pointer items-center gap-2 border-none bg-transparent p-0 text-left"
            onClick={() => setActiveTab("all-events")}
          >
            <svg
              className="h-6 w-6 text-black"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <title id="svg-title">EventHub Logo</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-lg font-bold tracking-tight">EventHub</span>
          </button>

          {/* Moved Tab Navigation Menu */}
          <nav className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab("manage")}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === "manage"
                  ? "bg-primary text-white"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              Организаторски панел
            </button>
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
                <title id="svg-title">Profile</title>
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

      {/* MAIN CONTENT CONTAINER */}
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        {/* TAB 1: MANAGEMENT TAB */}
        {activeTab === "manage" && (
          <div className="space-y-6">
            <EventOrganizerPanel
              events={draftEvents}
              onEventsChange={setDraftEvents}
              onPublishRequest={handlePublish}
            />

            {publishedEvents.length > 0 && (
              <div className="mt-12 border-t border-gray-200 pt-8">
                <h2 className="mb-4 text-lg font-medium text-gray-900">
                  Вашите публикувани събития ({publishedEvents.length})
                </h2>
                <div className="grid gap-4">
                  {publishedEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex flex-col justify-between border border-gray-200 bg-white p-5 sm:flex-row sm:items-center"
                    >
                      <div>
                        <h3 className="text-base font-medium text-gray-900">
                          {event.title}
                        </h3>
                        <div className="mt-1 text-sm text-gray-500">
                          Публикувано на:{" "}
                          {formatDisplayDate(event.published_at)}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4 text-red-600 hover:bg-red-50 sm:mt-0"
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
            <h2 className="mb-6 text-xl font-medium text-gray-900">
              Всички налични събития в платформата
            </h2>

            {allAvailablePublishedEvents.length === 0 ? (
              <p className="border border-gray-200 bg-white py-12 text-center text-gray-500">
                Няма публикувани събития в момента.
              </p>
            ) : (
              <div className="grid gap-6">
                {allAvailablePublishedEvents.map((event) => {
                  const isMyOwnEvent = publishedEvents.some(
                    (e) => e.id === event.id,
                  );

                  return (
                    <div
                      key={event.id}
                      className="relative border border-gray-200 bg-white p-6 shadow-sm"
                    >
                      <span
                        className={`absolute top-6 right-6 px-2.5 py-1 text-[11px] font-semibold tracking-wide ${
                          isMyOwnEvent
                            ? "bg-black text-white"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {isMyOwnEvent ? "ВАШЕ СЪБИТИЕ" : "ОРГАНИЗАТОР: ДРУГ"}
                      </span>

                      <div className="pr-24">
                        <h3 className="text-lg font-medium text-gray-900">
                          {event.title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-gray-600">
                          {event.description}
                        </p>
                      </div>

                      <div className="mt-6 grid grid-cols-1 gap-4 border-t border-gray-100 pt-4 text-sm text-gray-600 sm:grid-cols-3">
                        <div>
                          <strong className="text-gray-900">Начало:</strong>{" "}
                          {formatDisplayDate(event.starts_at)}
                        </div>
                        <div>
                          <strong className="text-gray-900">Място:</strong>{" "}
                          {event.location || "Не е указано"}
                        </div>
                        <div>
                          <strong className="text-gray-900">Капацитет:</strong>{" "}
                          {event.capacity} места
                        </div>
                      </div>

                      {isMyOwnEvent && (
                        <div className="mt-4 flex justify-end">
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
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ACCOUNT TAB */}
        {activeTab === "account" && <AccountTab />}
      </main>

      {/* 2. FOOTER */}
      <footer className="mt-10mx-auto w-full flex-1 border-t border-gray-200 bg-white px-4 py-8 text-gray-600">
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
                    type="button"
                    onClick={() => setActiveTab("manage")}
                    className="transition-colors hover:text-gray-900"
                  >
                    Организаторски панел
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveTab("all-events")}
                    className="transition-colors hover:text-gray-900"
                  >
                    Всички събития
                  </button>
                </li>
                <li>
                  <button
                    type="button"
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
                  <a
                    href="/hefest-frontend/helpdesk"
                    className="transition-colors hover:text-gray-900"
                  >
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
                    <title id="svg-title">EventHub's Facebook Profile</title>
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
                    <title id="svg-title">EventHub's LinkedIn Profile</title>
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
                    <title id="svg-title">EventHub's Twitter Profile</title>
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Global Confirmation Modal */}
      {eventToPublish && (
        <PublishConfirmation
          event={eventToPublish}
          onPublish={confirmPublish}
          onCancel={cancelPublish}
          isLoading={isPublishing}
        />
      )}
    </div>
  );
};
