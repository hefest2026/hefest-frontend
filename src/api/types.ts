/**
 * TypeScript mirror of the Hefest API OpenAPI schema (openapi.json).
 *
 * Hand-maintained to stay aligned with the FastAPI declarations. If the API
 * contract changes, update these types to match the generated schema.
 */

export type EventStatus = "draft" | "published" | "cancelled";
export type RegistrationStatus = "confirmed" | "waitlisted" | "cancelled";
export type JobStatus = "pending" | "published";
export type DeliveryStatus = "processing" | "completed" | "failed";
export type UserRole = "student" | "organizer";

// --- Users ---

export interface UserMeResponse {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
}

export interface UserUpdateRequest {
  full_name: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

// --- Stats ---

export interface OrganizerStats {
  events_total: number;
  events_draft: number;
  events_published: number;
  events_upcoming: number;
  total_capacity: number;
  total_confirmed: number;
  total_waitlisted: number;
  new_registrations_7d: number;
}

// --- Auth ---

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

// --- SSO ---

export interface OAuthProviderInfo {
  name: string;
  available: boolean;
  login_url: string | null;
}

export interface ProvidersResponse {
  password: Record<string, boolean>;
  providers: OAuthProviderInfo[];
}

// --- Events ---

export interface EventCreateRequest {
  title: string;
  description?: string;
  starts_at: string;
  ends_at?: string | null;
  location: string;
  capacity: number;
}

export type EventUpdateRequest = Partial<{
  title: string | null;
  description: string | null;
  starts_at: string | null;
  ends_at: string | null;
  location: string | null;
  capacity: number | null;
}>;

export interface EventResponse {
  id: string;
  organizer_id: string;
  title: string;
  description: string;
  starts_at: string;
  ends_at: string | null;
  location: string;
  capacity: number;
  confirmed_count: number;
  status: EventStatus;
  created_at: string;
  updated_at: string;
}

export interface EventDetailResponse extends EventResponse {
  waitlist_count: number;
  organizer_name: string;
}

export interface ListEventsParams {
  limit?: number;
  offset?: number;
}

// --- Registrations ---

export interface RegistrationResponse {
  id: string;
  event_id: string;
  student_id: string;
  status: RegistrationStatus;
  registered_at: string;
  waitlist_position: number | null;
}

export interface MyRegistrationResponse {
  id: string;
  event_id: string;
  status: RegistrationStatus;
  registered_at: string;
  cancelled_at: string | null;
  waitlist_position: number | null;
}

export interface RegistrationSummary {
  id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  status: RegistrationStatus;
  registered_at: string;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

// --- Notification jobs ---

export interface NotificationJobResponse {
  id: string;
  event_id: string;
  event_type: string;
  payload: Record<string, unknown>;
  status: JobStatus;
  idempotency_key: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationJobDetailResponse extends NotificationJobResponse {
  delivery_status: DeliveryStatus | null;
}

export interface ListNotificationJobsParams extends PaginationParams {
  event_id?: string;
}

// --- Errors ---

export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface HTTPValidationError {
  detail?: ValidationError[];
}
