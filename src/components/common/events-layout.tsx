import type { ReactNode } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLogout } from "@/hooks/use-auth-mutations";
import { cn } from "@/lib/utils";
import { BrandMark } from "./brand-mark";

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
  const [menuOpen, setMenuOpen] = useState(false);
  const allTabs: EventsTab[] = [...tabs, { id: "account", label: "Акаунт" }];

  const handleTabChange = (id: string) => {
    onTabChange(id);
    setMenuOpen(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-muted text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-card shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <button
            type="button"
            className="flex shrink-0 cursor-pointer items-center gap-2.5 border-none bg-transparent p-0 text-left"
            onClick={() => handleTabChange(tabs[0]?.id ?? "account")}
          >
            <BrandMark />
          </button>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-0.5 sm:flex">
            {allTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  "px-3 py-2 text-xs font-medium transition-colors",
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                {tab.label}
              </button>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="ml-3"
              onClick={() => logout.mutate()}
              disabled={logout.isPending}
            >
              Изход
            </Button>
          </nav>

          {/* Mobile: burger only */}
          <div className="flex items-center sm:hidden">
            <button
              type="button"
              aria-label={menuOpen ? "Затвори менюто" : "Отвори менюто"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
              className="flex h-8 w-8 items-center justify-center border border-border bg-transparent text-foreground transition-colors hover:bg-accent"
            >
              {menuOpen ? (
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <nav className="border-t border-border sm:hidden">
            {allTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  "w-full border-b border-border px-4 py-3.5 text-left text-sm font-medium transition-colors",
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-foreground hover:bg-accent",
                )}
              >
                {tab.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                logout.mutate();
                setMenuOpen(false);
              }}
              disabled={logout.isPending}
              className="w-full px-4 py-3.5 text-left text-sm font-medium text-muted-foreground bg-card transition-colors hover:bg-accent disabled:opacity-50"
            >
              Изход
            </button>
          </nav>
        )}
      </header>

      <main className="mx-auto mt-6 w-full max-w-4xl flex-1 p-4">
        {children}
      </main>

      <footer className="mt-10 w-full border-t border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-6 text-center text-xs text-muted-foreground">
          EventHub — Платформа за училищни събития и уъркшопи.
        </div>
      </footer>
    </div>
  );
}
