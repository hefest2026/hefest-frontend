import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { BrandMark } from "./brand-mark";

interface PublicLayoutProps {
  children: ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="flex min-h-svh flex-col bg-muted">
      <header className="border-b border-border bg-card shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center px-4 py-3">
          <Link
            to="/hefest-frontend/"
            className="flex items-center gap-2.5 no-underline"
          >
            <BrandMark />
          </Link>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-6 p-6 md:p-10">
        <div className="w-full max-w-sm">{children}</div>
      </main>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-6 text-center text-xs text-muted-foreground">
          EventHub — Платформа за училищни събития и уъркшопи.
        </div>
      </footer>
    </div>
  );
}
