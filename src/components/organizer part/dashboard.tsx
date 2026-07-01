import { getApiErrorMessage } from "@/api/client";
import type { EventResponse, OrganizerStats } from "@/api/types";
import { useStats } from "@/hooks/use-stats";

interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
}

function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <div className="border border-border bg-card p-6">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold text-card-foreground">
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

interface DashboardProps {
  /** Organizer's own events, used for the "needs attention" list. */
  events: EventResponse[];
}

function occupancyPct(stats: OrganizerStats): number {
  if (stats.total_capacity === 0) return 0;
  return Math.round((stats.total_confirmed / stats.total_capacity) * 100);
}

/** Organizer home dashboard — aggregate metrics + events needing attention. */
export function Dashboard({ events }: DashboardProps) {
  const statsQuery = useStats();

  if (statsQuery.isPending) {
    return (
      <p className="py-12 text-center text-muted-foreground">Зареждане...</p>
    );
  }

  if (statsQuery.isError) {
    return (
      <p className="py-12 text-center text-sm font-medium text-destructive">
        {getApiErrorMessage(statsQuery.error)}
      </p>
    );
  }

  const stats = statsQuery.data;
  const full = events.filter(
    (e) => e.status === "published" && e.confirmed_count >= e.capacity,
  );

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-medium text-foreground">Начало</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Събития"
          value={String(stats.events_total)}
          hint={`${stats.events_published} публикувани · ${stats.events_draft} чернови`}
        />
        <StatCard
          label="Предстоящи"
          value={String(stats.events_upcoming)}
          hint="публикувани, в бъдещето"
        />
        <StatCard
          label="Заети места"
          value={`${stats.total_confirmed} / ${stats.total_capacity}`}
          hint={`${occupancyPct(stats)}% запълване`}
        />
        <StatCard
          label="Нови записвания"
          value={String(stats.new_registrations_7d)}
          hint={`последните 7 дни · ${stats.total_waitlisted} в изчакване`}
        />
      </div>

      <div>
        <h3 className="mb-4 text-base font-medium text-foreground">
          Изисква внимание
        </h3>
        {full.length === 0 ? (
          <p className="border border-border bg-card py-8 text-center text-sm text-muted-foreground">
            Няма препълнени събития.
          </p>
        ) : (
          <ul className="space-y-2">
            {full.map((event) => (
              <li
                key={event.id}
                className="flex items-center justify-between border border-border bg-card px-4 py-3 text-sm"
              >
                <span className="font-medium text-foreground">
                  {event.title}
                </span>
                <span className="text-muted-foreground">
                  {event.confirmed_count} / {event.capacity} — пълно
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
