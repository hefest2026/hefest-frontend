import type React from "react";
import { useState } from "react";
import type {
  EventCreateRequest,
  EventResponse,
  EventUpdateRequest,
} from "@/api/types";
import { LocationMapPicker } from "@/components/common/location-map-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  type LatLng,
  parseLocationCoords,
  stripLocationCoords,
  withLocationCoords,
} from "@/lib/location-coords";

interface FormState {
  title: string;
  description: string;
  starts_date: string;
  starts_time: string;
  ends_date: string;
  ends_time: string;
  capacity: string;
  location: string;
}

interface EventOrganizerPanelProps {
  /** The organizer's DRAFT events, straight from the API. */
  drafts: EventResponse[];
  onCreate: (data: EventCreateRequest) => void;
  onUpdate: (eventId: string, data: EventUpdateRequest) => void;
  onPublish: (event: EventResponse) => void;
  onDelete: (eventId: string) => void;
  isSubmitting: boolean;
}

const initialFormState: FormState = {
  title: "",
  description: "",
  starts_date: "",
  starts_time: "",
  ends_date: "",
  ends_time: "",
  capacity: "1",
  location: "",
};

const ddmmyyyyToYYYYmmdd = (ddmmyyyy: string): string => {
  if (!ddmmyyyy || ddmmyyyy.length < 10) return "";
  const [dd, mm, yyyy] = ddmmyyyy.split("/");
  return `${yyyy}-${mm}-${dd}`;
};

const yyyymmddToDdmmyyyy = (yyyymmdd: string): string => {
  if (!yyyymmdd) return "";
  const [yyyy, mm, dd] = yyyymmdd.split("-");
  return `${dd}/${mm}/${yyyy}`;
};

const formatDateInput = (value: string): string => {
  const numbers = value.replace(/\D/g, "");
  if (numbers.length === 0) return "";
  if (numbers.length <= 2) return numbers;

  if (numbers.length === 4) {
    const month = parseInt(numbers.slice(2, 4), 10);
    if (month > 12) {
      return `${numbers.slice(0, 2)}/`;
    }
    return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
  }

  if (numbers.length <= 4) return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
  return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
};

const formatDateTimeDisplay = (isoString: string | null): string => {
  if (!isoString) return "";
  const match = isoString.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!match) return "";
  const [, year, month, day, hours, minutes] = match;
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

export const EventOrganizerPanel: React.FC<EventOrganizerPanelProps> = ({
  drafts,
  onCreate,
  onUpdate,
  onPublish,
  onDelete,
  isSubmitting,
}) => {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showMap, setShowMap] = useState(false);
  const [mapCoords, setMapCoords] = useState<LatLng | null>(null);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.title.trim()) {
      newErrors.title = "Название на събитието е задължително";
    }
    if (!form.description.trim()) {
      newErrors.description = "Описанието е задължително";
    }
    if (!form.location.trim()) {
      newErrors.location = "Местоположението е задължително";
    }
    if (!form.starts_date || form.starts_date.length < 10) {
      newErrors.starts_date = "Началната дата е задължителна (dd/mm/yyyy)";
    }
    if (!form.starts_time) {
      newErrors.starts_time = "Началното време е задължително";
    }

    if (form.ends_date && form.ends_date.length >= 10 && !form.ends_time) {
      newErrors.ends_time =
        "Крайното време е задължително, ако е зададена крайната дата";
    }
    if (!form.ends_date && form.ends_time) {
      newErrors.ends_date =
        "Крайната дата е задължителна, ако е зададено крайното време";
    }

    if (
      form.starts_date &&
      form.starts_date.length === 10 &&
      form.ends_date &&
      form.ends_date.length === 10 &&
      form.starts_time &&
      form.ends_time
    ) {
      const startsISO = `${ddmmyyyyToYYYYmmdd(form.starts_date)}T${form.starts_time}:00`;
      const endsISO = `${ddmmyyyyToYYYYmmdd(form.ends_date)}T${form.ends_time}:00`;
      if (endsISO <= startsISO) {
        newErrors.ends_date = "Крайното време трябва да бъде след началното";
      }
    }

    const capacity = parseInt(form.capacity, 10);
    if (Number.isNaN(capacity) || capacity < 1) {
      newErrors.capacity = "Капацитетът трябва да бъде поне 1";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    const startsAt = `${ddmmyyyyToYYYYmmdd(form.starts_date)}T${form.starts_time}:00`;
    const endsAt =
      form.ends_date && form.ends_date.length === 10 && form.ends_time
        ? `${ddmmyyyyToYYYYmmdd(form.ends_date)}T${form.ends_time}:00`
        : null;

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      starts_at: startsAt,
      ends_at: endsAt,
      location: withLocationCoords(
        form.location.trim(),
        showMap ? mapCoords : null,
      ),
      capacity: parseInt(form.capacity, 10),
    };

    if (editingId) {
      onUpdate(editingId, payload satisfies EventUpdateRequest);
      setEditingId(null);
    } else {
      onCreate(payload satisfies EventCreateRequest);
    }

    setForm(initialFormState);
    setErrors({});
    setShowMap(false);
    setMapCoords(null);
  };

  const handleEdit = (event: EventResponse) => {
    setEditingId(event.id);
    const [startsDate, startsTime] = event.starts_at.split("T");
    const [endsDate, endsTime] = event.ends_at
      ? event.ends_at.split("T")
      : ["", ""];
    const coords = parseLocationCoords(event.location);

    setForm({
      title: event.title,
      description: event.description,
      starts_date: yyyymmddToDdmmyyyy(startsDate),
      starts_time: startsTime.slice(0, 5),
      ends_date: endsDate ? yyyymmddToDdmmyyyy(endsDate) : "",
      ends_time: endsTime ? endsTime.slice(0, 5) : "",
      capacity: event.capacity.toString(),
      location: stripLocationCoords(event.location).trim(),
    });
    setShowMap(coords !== null);
    setMapCoords(coords);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(initialFormState);
    setErrors({});
    setShowMap(false);
    setMapCoords(null);
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 border border-border bg-card">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-base font-semibold text-card-foreground">
            {editingId ? "Редактиране на събитие" : "Ново събитие"}
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {editingId
              ? "Промените ще бъдат запазени като чернова"
              : "Попълнете детайлите — ще можете да прегледате преди публикуване"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div>
            <label
              htmlFor="event-title"
              className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground"
            >
              Заглавие *
            </label>
            <Input
              id="event-title"
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Въведете заглавие на събитието"
              aria-invalid={!!errors.title}
            />
            {errors.title && (
              <p className="mt-1.5 text-xs text-destructive">{errors.title}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="event-description"
              className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground"
            >
              Описание *
            </label>
            <Textarea
              id="event-description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Детали и информация за събитието"
              rows={4}
              aria-invalid={!!errors.description}
            />
            {errors.description && (
              <p className="mt-1.5 text-xs text-destructive">
                {errors.description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="event-start-date"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground"
              >
                Начало *
              </label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    id="event-start-date"
                    type="text"
                    value={form.starts_date}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        starts_date: formatDateInput(e.target.value),
                      })
                    }
                    placeholder="dd/mm/yyyy"
                    aria-invalid={!!errors.starts_date}
                    className="w-70"
                  />
                </div>
                <div className="w-32">
                  <input
                    type="time"
                    aria-label="Начален час"
                    value={form.starts_time}
                    onChange={(e) =>
                      setForm({ ...form, starts_time: e.target.value })
                    }
                    className="h-8 w-full border border-input bg-transparent px-2 text-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
                  />
                </div>
              </div>
              {errors.starts_date && (
                <p className="mt-1.5 text-xs text-destructive">
                  {errors.starts_date}
                </p>
              )}
              {errors.starts_time && (
                <p className="mt-1 text-xs text-destructive">
                  {errors.starts_time}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="event-end-date"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground"
              >
                Край
              </label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    id="event-end-date"
                    type="text"
                    value={form.ends_date}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        ends_date: formatDateInput(e.target.value),
                      })
                    }
                    placeholder="dd/mm/yyyy"
                    aria-invalid={!!errors.ends_date}
                    className="w-70"
                  />
                </div>
                <div className="w-32">
                  <input
                    type="time"
                    aria-label="Краен час"
                    value={form.ends_time}
                    onChange={(e) =>
                      setForm({ ...form, ends_time: e.target.value })
                    }
                    className="h-8 w-full border border-input bg-transparent px-2 text-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
                  />
                </div>
              </div>
              {errors.ends_date && (
                <p className="mt-1.5 text-xs text-destructive">
                  {errors.ends_date}
                </p>
              )}
              {errors.ends_time && (
                <p className="mt-1 text-xs text-destructive">
                  {errors.ends_time}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="event-capacity"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground"
              >
                Капацитет *
              </label>
              <Input
                id="event-capacity"
                type="number"
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                min="1"
                placeholder="1"
                aria-invalid={!!errors.capacity}
              />
              {errors.capacity && (
                <p className="mt-1.5 text-xs text-destructive">
                  {errors.capacity}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="event-location"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground"
              >
                Местоположение или URL *
              </label>
              <Input
                id="event-location"
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Адрес на мястото или видео връзка"
                aria-invalid={!!errors.location}
              />
              {errors.location && (
                <p className="mt-1.5 text-xs text-destructive">
                  {errors.location}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <input
                type="checkbox"
                checked={showMap}
                onChange={(e) => {
                  setShowMap(e.target.checked);
                  if (e.target.checked && !mapCoords) {
                    setMapCoords(null);
                  }
                }}
                className="h-3.5 w-3.5"
              />
              Покажи местоположението на карта
            </label>
            {showMap && (
              <div className="mt-2">
                <LocationMapPicker value={mapCoords} onChange={setMapCoords} />
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Кликни върху картата, за да поставиш или преместиш пина.
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-border pt-5">
            {editingId && (
              <Button
                type="button"
                onClick={handleCancelEdit}
                variant="outline"
              >
                Отказ
              </Button>
            )}
            <Button type="submit" size="lg" disabled={isSubmitting}>
              {editingId ? "Запази промените" : "Създай събитие"}
            </Button>
          </div>
        </form>
      </div>

      {drafts.length > 0 && (
        <div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Чернови ({drafts.length})
          </h2>

          <div className="space-y-4">
            {drafts.map((event) => (
              <div key={event.id} className="border border-border bg-card p-5">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="mb-1 text-base font-medium text-card-foreground">
                      {event.title}
                    </h3>
                    <p className="text-sm break-words text-muted-foreground">
                      {event.description}
                    </p>
                  </div>
                  <span className="ml-4 bg-secondary px-2.5 py-1 text-xs font-medium whitespace-nowrap text-secondary-foreground">
                    ЧЕРНОВА
                  </span>
                </div>

                <div className="mb-5 grid grid-cols-2 gap-5 border-b border-border pb-5 md:grid-cols-4">
                  <div>
                    <p className="mb-1 text-xs text-muted-foreground">Начало</p>
                    <p className="text-sm font-medium">
                      {formatDateTimeDisplay(event.starts_at)}
                    </p>
                  </div>
                  {event.ends_at && (
                    <div>
                      <p className="mb-1 text-xs text-muted-foreground">Край</p>
                      <p className="text-sm font-medium">
                        {formatDateTimeDisplay(event.ends_at)}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="mb-1 text-xs text-muted-foreground">
                      Капацитет
                    </p>
                    <p className="text-sm font-medium">
                      {event.capacity}{" "}
                      {event.capacity === 1 ? "човек" : "човека"}
                    </p>
                  </div>
                  <div>
                    <p className="mb-1 text-xs text-muted-foreground">
                      Местоположение
                    </p>
                    <p className="text-sm font-medium break-words">
                      {stripLocationCoords(event.location)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                  <Button
                    onClick={() => handleEdit(event)}
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    Редактиране
                  </Button>
                  <Button
                    onClick={() => onDelete(event.id)}
                    variant="outline"
                    size="sm"
                    className="w-full text-destructive sm:w-auto"
                    disabled={isSubmitting}
                  >
                    Изтрий
                  </Button>
                  <Button
                    onClick={() => onPublish(event)}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto"
                  >
                    Публикуване
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {drafts.length === 0 && !editingId && (
        <div className="border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
          Няма чернови все още — попълнете формата по-горе, за да създадете
          събитие.
        </div>
      )}
    </div>
  );
};
