// Framework-level shared code ("http") — NOT a domain module (REPOSITORY_STRUCTURE §5). The
// platform-wide HTTP wire envelope realized from Doc-5A §5.6 (single-entity success) and §6.1
// (error envelope). These are the CROSS-MODULE wire shapes (every module's caller-facing endpoint
// returns them), so they live in `shared` — reachable by `app`/`server` route composition (the
// boundary linter allows `app`/`server` → `shared`). This coins nothing: the keys (`result`,
// `error`, top-level `reference_id`) and the class→status mapping are owned by Doc-5A and bound
// by pointer here, never re-decided.
//
// Reference-never-restate:
//   - Success envelope  — Doc-5A §5.6: `{ "result": <representation>, "reference_id": <uuidv7> }`.
//   - Error envelope    — Doc-5A §6.1: `{ "error": <Doc-4A §12.1 structure>, "reference_id": <uuidv7> }`,
//                         `reference_id` a TOP-LEVEL sibling of `error`, never nested (Doc-4A §22.1 C-05).
//   - reference_id      — Doc-4A §22.1 C-05 / CHK-5A-042: a platform-assigned UUIDv7 on EVERY
//                         body-bearing response; NOT caller-supplied. Minted via the M0 ID generator.
//   - error_class→HTTP  — Doc-5A §6.2 (normative): NOT_FOUND → 404 (incl. every protected-fact
//                         collapse — §6.3). Doc-5A §6.6 safe default for an ambiguous
//                         AUTHORIZATION/NOT_FOUND failure point is NOT_FOUND (404), non-disclosure-preserving.

import { uuidv7 } from "@/shared/ids";

/**
 * The closed Doc-4A §12.2 error-class set, realized to HTTP status by Doc-5A §6.2. Only the subset
 * a given endpoint can raise is used; nothing is invented (Doc-5A §6.6). Bound by pointer.
 */
export type ErrorClass =
  | "VALIDATION"
  | "AUTHORIZATION"
  | "NOT_FOUND"
  | "STATE"
  | "CONFLICT"
  | "REFERENCE"
  | "BUSINESS"
  | "QUOTA"
  | "RATE_LIMITED"
  | "DEPENDENCY"
  | "SYSTEM";

/** Doc-5A §6.2 error-class → HTTP status mapping (normative; a module MUST NOT remap a class). */
const ERROR_STATUS: Record<ErrorClass, number> = {
  VALIDATION: 400,
  AUTHORIZATION: 403,
  NOT_FOUND: 404,
  STATE: 409,
  CONFLICT: 409,
  REFERENCE: 422,
  BUSINESS: 422,
  QUOTA: 403,
  RATE_LIMITED: 429,
  DEPENDENCY: 503,
  SYSTEM: 500,
};

/** The Doc-4A §12.1 error structure (field names owned upstream; bound by shape, not coined). */
export interface WireError {
  error_class: ErrorClass;
  error_code: string;
  message: string;
  retryable: boolean;
}

/** Doc-5A §5.6 single-entity success body: `result` + top-level `reference_id`. */
export interface SuccessEnvelope<T> {
  result: T;
  reference_id: string;
}

/** Doc-5A §6.1 error body: top-level `error` + top-level `reference_id` (a sibling, never nested). */
export interface ErrorEnvelope {
  error: WireError;
  reference_id: string;
}

/**
 * The DC-4 AUTH-BOUNDARY response body — OUTSIDE the Doc-5A contract error model. Authentication is
 * infrastructure (Doc-5C §3.1: "the wire carries `Authorization` only; the auth mechanism is
 * infrastructure"). An UNAUTHENTICATED request is PRE-CONTRACT: it never reaches a Doc-5A contract, so
 * it carries NO `error_class` (the Doc-5A closed class set is contract-level, post-auth — it has no
 * authentication/401 class by design). This body therefore carries the top-level `reference_id` for
 * traceability ONLY — no `error`, no `error_class`. See `governanceReviews/ESC-W1-AUTH-401_v1.0.md`.
 */
export interface AuthChallengeEnvelope {
  reference_id: string;
}

/**
 * A realized wire response: the HTTP status + the JSON-object-root body. The body is the Doc-5A §5.6
 * success envelope, the §6.1 error envelope, or the DC-4 auth-boundary envelope (transport-level 401,
 * outside the Doc-5A contract error model).
 */
export interface WireResponse<T> {
  status: number;
  body: SuccessEnvelope<T> | ErrorEnvelope | AuthChallengeEnvelope;
}

/**
 * Mint the platform-assigned `reference_id` (Doc-4A §22.1 C-05 / CHK-5A-042) — a UUIDv7 from the
 * M0 ID generator, generated at request acceptance. NEVER caller-supplied.
 */
export function newReferenceId(): string {
  return uuidv7();
}

/**
 * Build a Doc-5A §5.6 single-entity success response (`200`/`201`): `{ result, reference_id }`.
 * @param status the §5.5 success status (e.g. `200` for a read).
 */
export function successResponse<T>(result: T, status = 200): WireResponse<T> {
  return { status, body: { result, reference_id: newReferenceId() } };
}

/**
 * Build a Doc-5A §6.1 error response: `{ error, reference_id }` with the HTTP status fixed by the
 * §6.2 class→status mapping. `reference_id` is top-level (Doc-4A §22.1 C-05), never nested in `error`.
 */
export function errorResponse(error: WireError): WireResponse<never> {
  return {
    status: ERROR_STATUS[error.error_class],
    body: { error, reference_id: newReferenceId() },
  };
}

/**
 * Build the DC-4 AUTH-BOUNDARY response (transport-level `401`) for an UNAUTHENTICATED request. This is
 * NOT a Doc-5A contract error: the body carries the top-level `reference_id` for traceability ONLY and
 * carries NO `error`/`error_class` (the request is pre-contract — Doc-5C §3.1 / DC-4). It is intentionally
 * outside the Doc-5A §6.2 class→status mapping, which has no authentication/401 class by design.
 * See `governanceReviews/ESC-W1-AUTH-401_v1.0.md`.
 */
export function authChallengeResponse(): WireResponse<never> {
  return { status: 401, body: { reference_id: newReferenceId() } };
}

/**
 * Parse the `If-Match` optimistic-concurrency token (Doc-5C §4.3 realization of Doc-5A §9:
 * "Updates declaring `Concurrency: optimistic` carry `If-Match` with `updated_at`; a stale token is
 * CONFLICT → 409"). The token VALUE is the entity's `updated_at` timestamp (ISO-8601); surrounding
 * ETag quote syntax / a weak-validator prefix are tolerated transport dressing (HTTP-standard header,
 * outside the Doc-5A application-header registry — Doc-5A §4.0 posture, same as `Retry-After`).
 *
 * Returns an INVALID Date (`NaN` time) when the header is absent or unparseable — the owning
 * command's SYNTAX validation rejects it as the single `updated_at`-required failure path
 * (`VALIDATION` → 400); no parallel error shape is minted at the transport edge.
 */
export function parseIfMatchTimestamp(request: Request): Date {
  const raw = request.headers.get("if-match");
  if (raw === null) return new Date(Number.NaN);
  const unwrapped = raw
    .trim()
    .replace(/^W\//i, "")
    .replace(/^"(.*)"$/, "$1");
  return new Date(unwrapped);
}
