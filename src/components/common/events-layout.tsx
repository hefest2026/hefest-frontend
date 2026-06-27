import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useLogout } from "@/hooks/use-auth-mutations";

export interface EventsTab {
  id: string;
  label: string;
}

interface EventsLayoutProps {
  /** Page-specific tabs (the "Акаунт" tab is appended automatically). */
  tabs: EventsTab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  children: ReactNode;
}

function navButtonClass(active: boolean): string {
  return `px-3 py-2 text-sm font-medium transition-colors ${
    active
      ? "bg-primary text-white"
      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
  }`;
}

/**
 * Shared chrome for the authenticated event views (student + organizer):
 * sticky header with brand, tab navigation, a logout action, and the footer.
 */
export function EventsLayout({
  tabs,
  activeTab,
  onTabChange,
  children,
}: EventsLayoutProps) {
  const logout = useLogout();
  const allTabs: EventsTab[] = [...tabs, { id: "account", label: "Акаунт" }];

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900">
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <button
            type="button"
            className="flex cursor-pointer items-center gap-2 border-none bg-transparent p-0 text-left"
            onClick={() => onTabChange(tabs[0]?.id ?? "account")}
          >
            <svg
              className="h-6 w-6 text-black"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <title>EventHub Logo</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-lg font-bold tracking-tight">EventHub</span>
          </button>

          <nav className="flex items-center gap-1">
            {allTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={navButtonClass(activeTab === tab.id)}
              >
                {tab.label}
              </button>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="ml-2"
              onClick={() => logout.mutate()}
              disabled={logout.isPending}
            >
              Изход
            </Button>
          </nav>
        </div>
      </header>

      <main className="mx-auto mt-6 w-full max-w-4xl flex-1 p-4">
        {children}
      </main>

      <footer className="mx-auto mt-10 w-full border-t border-gray-200 bg-white px-4 py-8 text-gray-600">
        <div className="mx-auto max-w-6xl text-center text-xs text-gray-500">
          EventHub — Модерната платформа за училищни събития и уъркшопи.
        </div>
      </footer>
    </div>
  );
}
