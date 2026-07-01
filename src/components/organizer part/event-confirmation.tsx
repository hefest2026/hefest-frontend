import type React from "react";
import type { EventResponse } from "@/api/types";
import { Button } from "@/components/ui/button";

interface PublishConfirmationProps {
  event: EventResponse;
  onPublish: (eventId: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const formatDateTimeDisplay = (isoString: string | null): string => {
  if (!isoString) return "";

  const match = isoString.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!match) return "";

  const [, year, month, day, hours, minutes] = match;
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

const calculateDuration = (
  startISO: string,
  endISO?: string | null,
): string => {
  if (!endISO) return "Не е зададено";

  try {
    const start = new Date(startISO);
    const end = new Date(endISO);
    const diffMinutes = Math.round((end.getTime() - start.getTime()) / 60000);

    if (diffMinutes < 60) {
      return `${diffMinutes} мин.`;
    }

    const hours = Math.floor(diffMinutes / 60);
    const mins = diffMinutes % 60;
    return mins > 0 ? `${hours}ч ${mins}мин.` : `${hours}ч`;
  } catch {
    return "Невалидни дати";
  }
};

export const PublishConfirmation: React.FC<PublishConfirmationProps> = ({
  event,
  onPublish,
  onCancel,
  isLoading = false,
}) => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/45 p-4">
      <div className="w-full max-w-[520px] border border-border bg-card p-8">
        <div className="mb-6">
          <h2 className="mb-1.5 text-xl font-medium text-card-foreground">
            Публикуване на събитието
          </h2>
          <p className="text-sm text-muted-foreground">
            Преглед на детайлите преди публикуване
          </p>
        </div>

        <div className="mb-6 bg-muted p-5">
          <div className="mb-4">
            <h3 className="mb-1.5 break-words text-base font-medium text-foreground">
              {event.title}
            </h3>
            <p className="break-words text-sm leading-relaxed text-muted-foreground">
              {event.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Начало
              </p>
              <p className="text-sm font-medium text-foreground">
                {formatDateTimeDisplay(event.starts_at)}
              </p>
            </div>

            {event.ends_at && (
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Край
                </p>
                <p className="text-sm font-medium text-foreground">
                  {formatDateTimeDisplay(event.ends_at)}
                </p>
              </div>
            )}

            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Капацитет
              </p>
              <p className="text-sm font-medium text-foreground">
                {event.capacity} {event.capacity === 1 ? "човек" : "човека"}
              </p>
            </div>

            {event.ends_at && (
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Продължителност
                </p>
                <p className="text-sm font-medium text-foreground">
                  {calculateDuration(event.starts_at, event.ends_at)}
                </p>
              </div>
            )}

            {event.location && (
              <div className="col-span-2">
                <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Местоположение
                </p>
                <p className="break-words text-sm font-medium text-foreground">
                  {event.location}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mb-6">
          <p className="bg-secondary px-3 py-2 text-xs text-secondary-foreground">
            След публикуване събитието ще бъде видимо за всички. Можете да го
            редактирате или скриете по-късно.
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            onClick={onCancel}
            variant="outline"
            disabled={isLoading}
            className="min-w-[100px]"
          >
            Отказ
          </Button>
          <Button
            onClick={() => onPublish(event.id)}
            disabled={isLoading}
            className="min-w-[100px]"
          >
            {isLoading ? "Публикуване..." : "Публикуване"}
          </Button>
        </div>
      </div>
    </div>
  );
};
