import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface DraftEvent {
	id: string;
	title: string;
	description: string;
	starts_at: string;
	ends_at?: string;
	capacity: number;
	location?: string;
	status: "DRAFT";
}

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

// Convert dd/mm/yyyy to YYYY-MM-DD
const ddmmyyyyToYYYYmmdd = (ddmmyyyy: string): string => {
	if (!ddmmyyyy || ddmmyyyy.length < 10) return "";
	const [dd, mm, yyyy] = ddmmyyyy.split("/");
	return `${yyyy}-${mm}-${dd}`;
};

// Convert YYYY-MM-DD to dd/mm/yyyy
const yyyymmddToDdmmyyyy = (yyyymmdd: string): string => {
	if (!yyyymmdd) return "";
	const [yyyy, mm, dd] = yyyymmdd.split("-");
	return `${dd}/${mm}/${yyyy}`;
};

// Format date input as user types (dd/mm/yyyy) with month validation
const formatDateInput = (value: string): string => {
	const numbers = value.replace(/\D/g, "");
	if (numbers.length === 0) return "";
	if (numbers.length <= 2) return numbers;

	// For month validation: only allow 01-12
	if (numbers.length === 4) {
		const month = parseInt(numbers.slice(2, 4), 10);
		if (month > 12) {
			// If month > 12, truncate to just day
			return `${numbers.slice(0, 2)}/`;
		}
		return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
	}

	if (numbers.length <= 4) return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
	return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
};

// Format display date for event list (dd/mm/yyyy HH:mm)
const formatDateTimeDisplay = (isoString: string): string => {
	if (!isoString) return "";

	// Parse ISO string manually to avoid timezone issues
	const match = isoString.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
	if (!match) return "";

	const [, year, month, day, hours, minutes] = match;
	return `${day}/${month}/${year} ${hours}:${minutes}`;
};

export const EventOrganizerPanel = () => {
	const [events, setEvents] = useState<DraftEvent[]>([]);
	const [form, setForm] = useState<FormState>(initialFormState);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [errors, setErrors] = useState<Record<string, string>>({});

	const validate = (): boolean => {
		const newErrors: Record<string, string> = {};

		if (!form.title.trim()) {
			newErrors.title = "Название на събитието е задължително";
		}
		if (!form.description.trim()) {
			newErrors.description = "Описанието е задължително";
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

		const capacity = parseInt(form.capacity, 10);
		const startsAt = `${ddmmyyyyToYYYYmmdd(form.starts_date)}T${form.starts_time}:00`;
		const endsAt =
			form.ends_date && form.ends_date.length === 10 && form.ends_time
				? `${ddmmyyyyToYYYYmmdd(form.ends_date)}T${form.ends_time}:00`
				: undefined;

		const newEvent: DraftEvent = {
			id: editingId || Date.now().toString(),
			title: form.title.trim(),
			description: form.description.trim(),
			starts_at: startsAt,
			ends_at: endsAt,
			capacity,
			location: form.location.trim() || undefined,
			status: "DRAFT",
		};

		if (editingId) {
			setEvents(events.map((e) => (e.id === editingId ? newEvent : e)));
			setEditingId(null);
		} else {
			setEvents([newEvent, ...events]);
		}

		setForm(initialFormState);
		setErrors({});
	};

	const handleEdit = (event: DraftEvent) => {
		setEditingId(event.id);
		const [startsDate, startsTime] = event.starts_at.split("T");
		const [endsDate, endsTime] = event.ends_at
			? event.ends_at.split("T")
			: ["", ""];

		setForm({
			title: event.title,
			description: event.description,
			starts_date: yyyymmddToDdmmyyyy(startsDate),
			starts_time: startsTime.slice(0, 5),
			ends_date: endsDate ? yyyymmddToDdmmyyyy(endsDate) : "",
			ends_time: endsTime ? endsTime.slice(0, 5) : "",
			capacity: event.capacity.toString(),
			location: event.location || "",
		});
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const handleDelete = (id: string) => {
		setEvents(events.filter((e) => e.id !== id));
		if (editingId === id) {
			setEditingId(null);
			setForm(initialFormState);
			setErrors({});
		}
	};

	const handleCancel = () => {
		setEditingId(null);
		setForm(initialFormState);
		setErrors({});
	};

	return (
		<div className="mx-auto max-w-4xl p-4">
			{/* Form Section */}
			<div className="mb-8 p-6">
				<h2 className="mb-6 text-lg font-medium">
					{editingId ? "Редактиране на събитие" : "Създаване на ново събитие"}
				</h2>

				<form onSubmit={handleSubmit} className="space-y-5">
					<div>
						<label
							htmlFor="event-title"
							className="mb-2 block text-sm font-medium"
						>
							Название на събитието *
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
							<p className="mt-2 text-xs text-red-600">{errors.title}</p>
						)}
					</div>

					<div>
						<label
							htmlFor="event-description"
							className="mb-2 block text-sm font-medium"
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
							<p className="mt-2 text-xs text-red-600">{errors.description}</p>
						)}
					</div>

					<div className="grid grid-cols-2 gap-5">
						<div>
							<label
								htmlFor="event-start-date"
								className="mb-2 block text-sm font-medium"
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
										value={form.starts_time}
										onChange={(e) =>
											setForm({ ...form, starts_time: e.target.value })
										}
										className="flex h-8 w-full border border-input bg-transparent px-2 text-sm"
									/>
								</div>
							</div>
							{errors.starts_date && (
								<p className="mt-2 text-xs text-red-600">
									{errors.starts_date}
								</p>
							)}
							{errors.starts_time && (
								<p className="mt-2 text-xs text-red-600">
									{errors.starts_time}
								</p>
							)}
						</div>

						<div>
							<label
								htmlFor="event-end-date"
								className="mb-2 block text-sm font-medium"
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
										value={form.ends_time}
										onChange={(e) =>
											setForm({ ...form, ends_time: e.target.value })
										}
										className="flex h-8 w-full border border-input bg-transparent px-2 text-sm"
									/>
								</div>
							</div>
							{errors.ends_date && (
								<p className="mt-2 text-xs text-red-600">{errors.ends_date}</p>
							)}
							{errors.ends_time && (
								<p className="mt-2 text-xs text-red-600">{errors.ends_time}</p>
							)}
						</div>
					</div>

					<div className="grid grid-cols-2 gap-5">
						<div>
							<label
								htmlFor="event-capacity"
								className="mb-2 block text-sm font-medium"
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
								<p className="mt-2 text-xs text-red-600">{errors.capacity}</p>
							)}
						</div>

						<div>
							<label
								htmlFor="event-location"
								className="mb-2 block text-sm font-medium"
							>
								Местоположение или URL
							</label>
							<Input
								id="event-location"
								type="text"
								value={form.location}
								onChange={(e) => setForm({ ...form, location: e.target.value })}
								placeholder="Адрес на мястото или видео връзка"
							/>
						</div>
					</div>

					<div className="flex justify-end gap-3 pt-2">
						{editingId && (
							<Button type="button" onClick={handleCancel} variant="outline">
								Отказ
							</Button>
						)}
						<Button type="submit">
							{editingId
								? "Актуализиране на събитие"
								: "Създаване на ново събитие"}
						</Button>
					</div>
				</form>
			</div>

			{/* Events List Section */}
			{events.length > 0 && (
				<div>
					<h2 className="mb-4 text-lg font-medium">
						Чернови на събития ({events.length})
					</h2>

					<div className="space-y-4">
						{events.map((event) => (
							<div
								key={event.id}
								className="rounded-lg border border-gray-200 bg-white p-5"
							>
								<div className="mb-4 flex items-start justify-between">
									<div className="flex-1">
										<h3 className="mb-1 text-base font-medium">
											{event.title}
										</h3>
										<p className="text-sm text-gray-600">{event.description}</p>
									</div>
									<span className="ml-4 rounded bg-gray-100 px-3 py-1.5 text-xs font-medium whitespace-nowrap text-gray-700">
										ЧЕРНОВА
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
											{event.capacity}{" "}
											{event.capacity === 1 ? "човек" : "човека"}
										</p>
									</div>

									{event.location && (
										<div>
											<p className="mb-1 text-xs text-gray-600">
												Местоположение
											</p>
											<p className="text-sm font-medium break-words">
												{event.location}
											</p>
										</div>
									)}
								</div>

								<div className="flex justify-end gap-2">
									<Button
										onClick={() => handleEdit(event)}
										variant="outline"
										size="sm"
									>
										Редактиране
									</Button>
									<Button
										onClick={() => handleDelete(event.id)}
										variant="outline"
										size="sm"
										className="text-red-600"
									>
										Изтриване
									</Button>
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			{events.length === 0 && !editingId && (
				<div className="py-8 text-center text-gray-600">
					<p>
						Няма чернови на събития все още. Създайте едно, за да започнете.
					</p>
				</div>
			)}
		</div>
	);
};
