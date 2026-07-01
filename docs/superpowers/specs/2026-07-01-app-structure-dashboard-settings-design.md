# App Structure: Organizer Dashboard, Stats Endpoint & Editable Settings

**Date:** 2026-07-01
**Target:** `hefest-frontend` (web SPA) + `hefest-api` (backend)
**Status:** Approved design

## Goal

Bring the authenticated web app in line with the intended 6-screen structure. Most
screens already exist; this spec covers the two real gaps — an **organizer Home
dashboard** (backed by a new `GET /stats` endpoint) and an **editable Settings
screen** (name + password) — plus small polish on the event detail view.

## Current state (what already exists)

The authenticated app is **tab-driven**, not routed per screen. `EventsLayout`
(`components/common/events-layout.tsx`) renders the sticky header, tab bar, an
auto-appended "Акаунт" tab, and logout. Role components own their tabs:

- **Organizer** — `organizer part/event-manager.tsx`: tabs `manage`
  (`Организаторски панел`), `all-events` (`Всички събития`), `account`.
  `event-draft.tsx` is already a **unified create+edit form** (`editingId`
  toggles create vs. edit). `event-confirmation.tsx` handles publish.
- **Student** — `student part/student-events.tsx` + `event-card.tsx`.
- **Both** — `common/account-tab.tsx`: read-only profile + a non-functional
  "email notifications" checkbox.
- Event detail is a route: `EventDetailPage` at `/hefest-frontend/events/:eventId`.

Screen mapping: list (2), detail (3), add/create-edit (4/5) already exist. Home
(1) is missing; Settings (6) is read-only.

## Scope

In scope:

1. **Backend `GET /stats`** — organizer-scoped aggregates.
2. **Organizer Home dashboard** — new default tab consuming `GET /stats`.
3. **Backend `PATCH /users/me`** — edit `full_name`.
4. **Backend `POST /auth/change-password`** — verify current, set new, revoke sessions.
5. **Editable Settings** — name form + change-password form in `account-tab.tsx`.
6. **Event detail polish** — ensure registrant + waitlist lists and organizer Edit action.

Out of scope (YAGNI): "new users" metric (not role-appropriate, no admin role),
email change / re-verification, real email-notification preferences, moving the
tab shell to routed pages.

## Design

### 1. Backend: `GET /stats` (organizer-only)

New router `hefest/routers/stats.py`, service `hefest/services/stats.py`, schema
`hefest/schemas/stats.py`. Guarded by `_require_organizer` (students get 403 —
they have no dashboard). All aggregates are scoped to the caller's own events.

Response `OrganizerStatsResponse`:

| Field | Meaning |
|-------|---------|
| `events_total` | count of caller's events (any status) |
| `events_draft` | caller's events in `draft` |
| `events_published` | caller's events in `published` |
| `events_upcoming` | published events with `starts_at > now()` |
| `total_capacity` | Σ capacity over caller's **published** events |
| `total_confirmed` | Σ confirmed registrations over caller's published events |
| `total_waitlisted` | Σ waitlisted registrations over caller's published events |
| `new_registrations_7d` | confirmed registrations on caller's events with `registered_at >= now() - 7d` |

All registration counts are naturally published-only (registration requires a
published event), so scoping capacity to published events keeps the "seats filled"
ratio `total_confirmed / total_capacity` coherent.

Implemented as aggregate SQL/ORM queries (no per-event N+1): one grouped query
over `events` for status counts + capacity, one join `registrations`→`events`
(filtered `event.organizer_id = me`) grouped by status for confirmed/waitlisted,
one count for the 7-day window. No migration required.

### 2. Frontend: Organizer Home dashboard

- `api/stats.ts` — `getStats(): Promise<OrganizerStats>`; type in `api/types.ts`.
- `hooks/use-stats.ts` — react-query wrapper, keyed via `lib/query-keys.ts`.
- `organizer part/dashboard.tsx` — stat cards (events by status, seats filled as
  `total_confirmed / total_capacity`, waitlist total, new registrations 7d) and a
  "needs attention" section highlighting published events at/over capacity.
- `event-manager.tsx` — prepend a `dashboard` tab labeled `Начало`, make it the
  default `activeTab`. Student flow unchanged.

### 3. Backend: `PATCH /users/me`

In `routers/auth.py`. Body `UserUpdateRequest { full_name: str }` (trimmed,
non-empty, reasonable max length). Returns updated `UserMeResponse`. Auth via
`get_current_user`.

### 4. Backend: `POST /auth/change-password`

In `routers/auth.py`. Body `ChangePasswordRequest { current_password, new_password }`.
Flow: verify `current_password` against `password_hash` (401 on mismatch,
`X-Error-Code: invalid_credentials`); validate `new_password` with the existing
register password validator (min 12); hash and persist; **revoke all other
refresh tokens** for the user (reuse the logout-all path) so other sessions are
invalidated. Returns 204. Auth-sensitive → run `security-reviewer` before merge.

### 5. Frontend: editable Settings

Rework `common/account-tab.tsx`:

- **Profile form** — editable `full_name` (prefilled from `useMe`), Save →
  `PATCH /users/me`, invalidate the `me` query. Email + role stay read-only.
- **Change-password form** — current / new / confirm, client validation
  (new ≥ 12, new === confirm), Submit → `POST /auth/change-password`, success/error
  banner via the existing `form-banner` pattern.
- Remove the non-functional notifications checkbox.
- `api/auth.ts` gains `updateMe` + `changePassword`; hooks in
  `hooks/use-auth-mutations.ts` / a `use-me` mutation.

### 6. Event detail polish

Confirm `EventDetailPage` shows event info + location, the confirmed registrant
list and waitlist (with positions) for the owning organizer via
`GET /events/{id}/registrations`, and an **Edit** action (owning organizer only)
that opens `event-draft` prefilled. Fill any gaps; no redesign.

## Testing

- **Backend (pytest):** `GET /stats` — organizer aggregates correct across
  draft/published/confirmed/waitlisted fixtures; student → 403. `PATCH /users/me`
  — name updated; empty/whitespace rejected. `POST /auth/change-password` —
  happy path; wrong current → 401; short new → 422; other sessions revoked.
- **Frontend (vitest/RTL):** dashboard renders stats from a mocked `getStats`;
  settings name form submits + reflects update; password form enforces
  match/length and surfaces server errors.

## Delivery workflow

Work committed **straight to `dev`** in each repo (no PR). Every push MUST have
green CI — run `act` (or `act --job test` when 5432 is occupied) locally before
each push, per project convention. Backend and frontend change independently;
each commit keeps its repo's CI green.
