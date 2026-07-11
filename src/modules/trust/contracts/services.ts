// Public service interfaces + callables for module "trust" — the ONLY cross-module call surface
// (REPOSITORY_STRUCTURE §3). Cross-module consumers (the app-layer composition edge `src/server/trust`)
// import from here, never the private application/domain/infrastructure/api layers.
//
// W3-TRUST-2 realizes the `trust.request_verification.v1` write facade (Doc-4G §G4.1; the D7
// audited-write pattern + the SECURITY-DEFINER twist). The concrete callable delegates to THIS module's
// application command (same-module contracts-facade — `${from.module}`-scoped; no cross-module internal
// access is opened). The M0 `appendAuditRecord` is INJECTED by the caller via the contract TYPE — never
// a concrete cross-module value import. NO `@/modules/identity` / `@/modules/marketplace` import here:
// the AUTHZ (`can_submit_verification` → M1 `check_permission`) lives at the composition edge
// (`src/server/trust` → `src/server/authz`), never inside this module.

import type { DbExecutor } from "@/shared/db";
import { requestVerificationCommand } from "../application/commands/request-verification.command";
import {
  confirmVerifiedTier as confirmVerifiedTierService,
  downgradeVerifiedTier as downgradeVerifiedTierService,
  establishVerifiedTier as establishVerifiedTierService,
  expireVerifiedTier as expireVerifiedTierService,
  suspendVerifiedTier as suspendVerifiedTierService,
} from "../application/services/verified-tier.service";
import {
  computePerformanceScore as computePerformanceScoreService,
  ingestPerformanceInput as ingestPerformanceInputService,
  triggerPerformanceReview as triggerPerformanceReviewService,
} from "../application/services/performance-score.service";
import { computeTrustScore as computeTrustScoreService } from "../application/services/trust-score.service";
import {
  actionFraudSignal as actionFraudSignalService,
  createFraudSignal as createFraudSignalService,
  dismissFraudSignal as dismissFraudSignalService,
  reviewFraudSignal as reviewFraudSignalService,
} from "../application/services/fraud-signal.service";
import type {
  ComputePerformanceScoreInput,
  ComputePerformanceScoreOutcome,
  ComputeTrustScoreInput,
  ComputeTrustScoreOutcome,
  ConfirmVerifiedTierInput,
  CreateFraudSignalInput,
  CreateFraudSignalOutcome,
  DowngradeVerifiedTierInput,
  EstablishVerifiedTierInput,
  ExpireVerifiedTierInput,
  FraudSignalActorContext,
  FraudSignalDeps,
  FraudSignalTriageInput,
  FraudSignalTriageOutcome,
  IngestPerformanceInputDeps,
  IngestPerformanceInputInput,
  IngestPerformanceInputOutcome,
  PerformanceScoreDeps,
  RequestVerificationContext,
  RequestVerificationDeps,
  RequestVerificationInput,
  RequestVerificationOutcome,
  SuspendVerifiedTierInput,
  TriggerPerformanceReviewInput,
  TriggerPerformanceReviewOutcome,
  TrustScoreDeps,
  VerifiedTierAdminContext,
  VerifiedTierDeps,
  VerifiedTierOutcome,
} from "./types";

// Re-export the command's context/deps DTOs on the contracts surface so the composition edge builds
// them via `@/modules/trust/contracts` (contracts-only).
export type { RequestVerificationContext, RequestVerificationDeps };

// W3-TRUST-3 — the Verified-Tier write-service DTOs + the `VendorTierChanged` event surface, re-exported so
// the DEFERRED admin command / System timer (and consumers) build them via `@/modules/trust/contracts`.
export type {
  ConfirmVerifiedTierInput,
  DowngradeVerifiedTierInput,
  EstablishVerifiedTierInput,
  ExpireVerifiedTierInput,
  SuspendVerifiedTierInput,
  VerifiedTierAdminContext,
  VerifiedTierDeps,
  VerifiedTierOutcome,
  VerifiedTierResult,
  VerifiedTierError,
  FinancialTier,
  VerifiedTierStatus,
} from "./types";
export {
  VENDOR_TIER_CHANGED_EVENT,
  VENDOR_TIER_CHANGED_EVENT_VERSION,
  type VendorTierChangedPayload,
} from "./events";

// W3-TRUST-4a — the Performance-Score write-service DTOs + the two §8 event surfaces, re-exported so the
// DEFERRED production triggers / consumers build them via `@/modules/trust/contracts`.
export type {
  IngestPerformanceInputInput,
  IngestPerformanceInputDeps,
  IngestPerformanceInputOutcome,
  IngestPerformanceInputResult,
  IngestPerformanceInputError,
  ComputePerformanceScoreInput,
  ComputePerformanceScoreOutcome,
  ComputePerformanceScoreResult,
  ComputePerformanceScoreError,
  TriggerPerformanceReviewInput,
  TriggerPerformanceReviewOutcome,
  TriggerPerformanceReviewResult,
  TriggerPerformanceReviewError,
  PerformanceScoreDeps,
  PerformanceInputTypeValue,
  PerformanceSourceTypeValue,
  ScoreFreezeStateValue,
  PerformanceComputeTrigger,
  PerformanceReviewReason,
} from "./types";
export {
  PERFORMANCE_SCORE_UPDATED_EVENT,
  PERFORMANCE_REVIEW_TRIGGERED_EVENT,
  PERFORMANCE_EVENT_VERSION,
  type PerformanceScoreUpdatedPayload,
  type PerformanceReviewTriggeredPayload,
} from "./events";

// W3-TRUST-4b — the BC-TRUST-2 Trust-Score compute DTOs + the `TrustScoreUpdated` event surface, re-exported
// so the DEFERRED production triggers / consumers (M2 directory band, M3 matching) build them via
// `@/modules/trust/contracts`.
export type {
  ComputeTrustScoreInput,
  ComputeTrustScoreOutcome,
  ComputeTrustScoreResult,
  ComputeTrustScoreError,
  TrustScoreDeps,
  TrustComputeTrigger,
} from "./types";
export {
  TRUST_SCORE_UPDATED_EVENT,
  TRUST_EVENT_VERSION,
  type TrustScoreUpdatedPayload,
} from "./events";

// The stage-1 SYNTAX validator + its result→outcome mapper — surfaced so the composition edge runs SYNTAX
// BEFORE AUTHZ (Doc-4A §11.2 fixed order), from the SAME single source the command re-runs (self-guard).
export {
  requestVerificationSyntaxOutcome,
  validateRequestVerificationInput,
} from "../application/commands/request-verification.command";
export type { RequestVerificationSyntaxResult } from "../application/commands/request-verification.command";

// The Doc-2 §7 AUTHZ slug (bound by pointer) — surfaced so the composition edge references ONE source.
export { CAN_SUBMIT_VERIFICATION_SLUG } from "../domain/request-verification.constants";

/**
 * `trust.request_verification.v1` (Doc-4G §G4.1) — the PUBLIC, contracts-only face over the private M5
 * write command. Open an organization verification case (state `requested`), appending the canonical
 * ENUMERATED audit action (`verification_requested`) ATOMICALLY with the privileged SD-function write.
 * The active org is RESOLVED + enforced upstream by the app-layer org-context guard; AUTHZ
 * (`can_submit_verification`) is performed at the composition edge BEFORE this call; the M0
 * `appendAuditRecord` is INJECTED by the contract TYPE.
 *
 * MUST be invoked INSIDE `withActiveOrgContext` — the `db` executor carries the server-set
 * `app.active_org` / `app.user_id` GUCs the audit `WITH CHECK` reads (and under which the SD function
 * runs). RESTRICTED to `subject_type = organization` (this WP).
 */
export type RequestVerification = (
  input: RequestVerificationInput,
  ctx: RequestVerificationContext,
  deps: RequestVerificationDeps,
  db?: DbExecutor,
) => Promise<RequestVerificationOutcome>;

/** Concrete `trust.request_verification.v1` facade (M5 contracts → M5 application command). */
export const requestVerification: RequestVerification = (input, ctx, deps, db) =>
  requestVerificationCommand(input, ctx, deps, db);

// The M5 WIRE FACE for the verification-request write (outcome → Doc-5A envelope + §6.2 status) + the two
// error-builders the composition edge consumes. One-Owner placement — M5 owns how its write becomes HTTP;
// this contracts re-export is the boundary-legal handle the app-layer composition consumes via
// `@/modules/trust/contracts` (same-module contracts → own `api/`; no cross-module internal access).
export {
  mapRequestVerification,
  requestVerificationForbidden,
  requestVerificationInvalidInput,
} from "../api/request-verification.handler";

// ── W3-TRUST-3 — the Verified Financial Tier write-service facades (Doc-4G §G4.6/§G4.7) ────────────────
// The PUBLIC, contracts-only faces over the private M5 write-service. Each writes the tier via the
// SECURITY-DEFINER function, EMITS `VendorTierChanged` (M0 `core.write_outbox_event.v1`), and appends ONE
// audit — ALL atomically on the caller's tx (Doc-8F). The admin HTTP commands (`staff_can_verify` authz +
// routes) and the System expire timer are DEFERRED; these functions are what they will call, invoked
// directly by tests. The M0 `appendAuditRecord` + `writeOutboxEvent` are INJECTED by contract TYPE. MUST be
// invoked INSIDE a staff-scoped tx (`app.is_platform_staff = true`) so the outbox INSERT + audit append are
// RLS-admitted (natural for the Admin/System actor).

/** `trust.set_verified_tier.v1` (Doc-4G §G4.6) — establish a vendor's verified tier (Admin). */
export type EstablishVerifiedTier = (
  input: EstablishVerifiedTierInput,
  ctx: VerifiedTierAdminContext,
  deps: VerifiedTierDeps,
  db?: DbExecutor,
) => Promise<VerifiedTierOutcome>;

/** `trust.confirm_verified_tier.v1` (Doc-4G §G4.6) — renew a verified tier's review window (Admin). */
export type ConfirmVerifiedTier = (
  input: ConfirmVerifiedTierInput,
  ctx: VerifiedTierAdminContext,
  deps: VerifiedTierDeps,
  db?: DbExecutor,
) => Promise<VerifiedTierOutcome>;

/** `trust.downgrade_verified_tier.v1` (Doc-4G §G4.6) — lower a verified tier's band (Admin). */
export type DowngradeVerifiedTier = (
  input: DowngradeVerifiedTierInput,
  ctx: VerifiedTierAdminContext,
  deps: VerifiedTierDeps,
  db?: DbExecutor,
) => Promise<VerifiedTierOutcome>;

/** `trust.suspend_verified_tier.v1` (Doc-4G §G4.7) — suspend a verified tier; reason required (Admin). */
export type SuspendVerifiedTier = (
  input: SuspendVerifiedTierInput,
  ctx: VerifiedTierAdminContext,
  deps: VerifiedTierDeps,
  db?: DbExecutor,
) => Promise<VerifiedTierOutcome>;

/** `trust.expire_verified_tier.v1` (Doc-4G §G4.7) — expire a verified tier on the review lapse (System). */
export type ExpireVerifiedTier = (
  input: ExpireVerifiedTierInput,
  deps: VerifiedTierDeps,
  db?: DbExecutor,
) => Promise<VerifiedTierOutcome>;

/** Concrete `trust.set_verified_tier.v1` facade (M5 contracts → M5 write-service). */
export const establishVerifiedTier: EstablishVerifiedTier = (input, ctx, deps, db) =>
  establishVerifiedTierService(input, ctx, deps, db);

/** Concrete `trust.confirm_verified_tier.v1` facade. */
export const confirmVerifiedTier: ConfirmVerifiedTier = (input, ctx, deps, db) =>
  confirmVerifiedTierService(input, ctx, deps, db);

/** Concrete `trust.downgrade_verified_tier.v1` facade. */
export const downgradeVerifiedTier: DowngradeVerifiedTier = (input, ctx, deps, db) =>
  downgradeVerifiedTierService(input, ctx, deps, db);

/** Concrete `trust.suspend_verified_tier.v1` facade. */
export const suspendVerifiedTier: SuspendVerifiedTier = (input, ctx, deps, db) =>
  suspendVerifiedTierService(input, ctx, deps, db);

/** Concrete `trust.expire_verified_tier.v1` facade (System). */
export const expireVerifiedTier: ExpireVerifiedTier = (input, deps, db) =>
  expireVerifiedTierService(input, deps, db);

// ── W3-TRUST-4a — the BC-TRUST-3 Performance-Score write-service facades (Doc-4G §G6.1/§G6.2/§G6.4) ─────
// The PUBLIC, contracts-only faces over the private M5 Performance-Score services. All three are System
// contracts (out-of-wire, no api/route); the live production triggers + consumers are DEFERRED — these are the
// functions they will call, invoked directly by tests. The M0 `appendAuditRecord` + `writeOutboxEvent` are
// INJECTED by contract TYPE. MUST be invoked INSIDE a staff-scoped tx (`app.is_platform_staff = true`) so the
// SD reads + outbox INSERT + audit append are RLS-admitted (natural for the System actor).

/** `trust.ingest_performance_input.v1` (Doc-4G §G6.1) — sole writer of performance_inputs (System; emits no event). */
export type IngestPerformanceInput = (
  input: IngestPerformanceInputInput,
  deps: IngestPerformanceInputDeps,
  db?: DbExecutor,
) => Promise<IngestPerformanceInputOutcome>;

/** `trust.compute_performance_score.v1` (Doc-4G §G6.2) — compute + publish-on-change + audit (System). */
export type ComputePerformanceScore = (
  input: ComputePerformanceScoreInput,
  deps: PerformanceScoreDeps,
  db?: DbExecutor,
) => Promise<ComputePerformanceScoreOutcome>;

/** `trust.trigger_performance_review.v1` (Doc-4G §G6.4) — emit review-trigger + audit; no score write (System). */
export type TriggerPerformanceReview = (
  input: TriggerPerformanceReviewInput,
  deps: PerformanceScoreDeps,
  db?: DbExecutor,
) => Promise<TriggerPerformanceReviewOutcome>;

/** Concrete `trust.ingest_performance_input.v1` facade (M5 contracts → M5 service). */
export const ingestPerformanceInput: IngestPerformanceInput = (input, deps, db) =>
  ingestPerformanceInputService(input, deps, db);

/** Concrete `trust.compute_performance_score.v1` facade. */
export const computePerformanceScore: ComputePerformanceScore = (input, deps, db) =>
  computePerformanceScoreService(input, deps, db);

/** Concrete `trust.trigger_performance_review.v1` facade. */
export const triggerPerformanceReview: TriggerPerformanceReview = (input, deps, db) =>
  triggerPerformanceReviewService(input, deps, db);

// ── W3-TRUST-4b — the BC-TRUST-2 Trust-Score compute facade (Doc-4G §G5.1) ─────────────────────────────
// The PUBLIC, contracts-only face over the private M5 Trust-Score service. `compute_trust_score` is a System
// contract (out-of-wire, no api/route); the live production triggers + consumers + freeze/reactivate + reads
// are DEFERRED — this is the function they will call, invoked directly by tests. The M0 `appendAuditRecord` +
// `writeOutboxEvent` are INJECTED by contract TYPE. MUST be invoked INSIDE a staff-scoped tx
// (`app.is_platform_staff = true`) so the firewall-scoped input reads (verification_records +
// performance_scores) + outbox INSERT + audit append are RLS-admitted (natural for the System actor).

/** `trust.compute_trust_score.v1` (Doc-4G §G5.1) — compute + publish-on-change `TrustScoreUpdated` + audit
 *  (System); reads Verification + Performance + Fraud ONLY (INVARIANT to Financial Tier — Invariant #6). */
export type ComputeTrustScore = (
  input: ComputeTrustScoreInput,
  deps: TrustScoreDeps,
  db?: DbExecutor,
) => Promise<ComputeTrustScoreOutcome>;

/** Concrete `trust.compute_trust_score.v1` facade (M5 contracts → M5 service). */
export const computeTrustScore: ComputeTrustScore = (input, deps, db) =>
  computeTrustScoreService(input, deps, db);

// ── W3-TRUST-4c — the BC-TRUST-4 Fraud & Risk Signal write-lifecycle facades (Doc-4G §G7.1/§G7.2) ───────
// The PUBLIC, contracts-only faces over the private M5 fraud-signal service. This is an IN-BAND
// AUDITED-WRITE aggregate — each writes `fraud_signals` + appends ONE `[ESC-TRUST-AUDIT]` audit atomically
// on the caller's tx; NO event (Doc-4G §H.7 — Doc-2 §8 has no Trust fraud event); NO SD (Doc-6G §3.4);
// firewall (mutates no score/verification/tier; never a ban — Doc-4G §H.9b/c). The §G7.3 staff reads, the
// Admin HTTP wiring, and the `staff_can_ban` composition-edge authz are DEFERRED — these are the functions
// they will call, invoked directly by tests. The M0 `appendAuditRecord` is INJECTED by contract TYPE (NO
// `writeOutboxEvent`). MUST be invoked INSIDE a staff-scoped tx (`app.is_platform_staff = true`) so the
// in-band `fraud_signals` write + the audit append are RLS-admitted (natural for the Admin/System actor).

/** The re-exported fraud-signal DTOs (create + triage; actor context; deps) so the DEFERRED Admin command /
 *  System detector (and consumers) build them via `@/modules/trust/contracts`. */
export type {
  CreateFraudSignalInput,
  CreateFraudSignalResult,
  CreateFraudSignalOutcome,
  FraudSignalTriageInput,
  FraudSignalTriageResult,
  FraudSignalTriageOutcome,
  FraudSignalActorContext,
  FraudSignalDeps,
  FraudSignalError,
  FraudSignalStateValue,
} from "./types";

// The Doc-2 §7 platform-staff AUTHZ slug (bound by pointer) — surfaced so the DEFERRED composition edge
// references ONE source (staff-reported create + all triage; System-detected create carries no slug).
export { STAFF_CAN_BAN_SLUG } from "../domain/fraud-signal.constants";

/** `trust.create_fraud_signal.v1` (Doc-4G §G7.1) — open a fraud signal (System-detected or staff-reported);
 *  IN-BAND write + ONE audit, atomic; idempotent on the detection key; NO event. */
export type CreateFraudSignal = (
  input: CreateFraudSignalInput,
  ctx: FraudSignalActorContext,
  deps: FraudSignalDeps,
  db?: DbExecutor,
) => Promise<CreateFraudSignalOutcome>;

/** `trust.review_fraud_signal.v1` (Doc-4G §G7.2) — open → reviewed (Admin). */
export type ReviewFraudSignal = (
  input: FraudSignalTriageInput,
  ctx: FraudSignalActorContext,
  deps: FraudSignalDeps,
  db?: DbExecutor,
) => Promise<FraudSignalTriageOutcome>;

/** `trust.action_fraud_signal.v1` (Doc-4G §G7.2) — reviewed → actioned, terminal (Admin). */
export type ActionFraudSignal = (
  input: FraudSignalTriageInput,
  ctx: FraudSignalActorContext,
  deps: FraudSignalDeps,
  db?: DbExecutor,
) => Promise<FraudSignalTriageOutcome>;

/** `trust.dismiss_fraud_signal.v1` (Doc-4G §G7.2) — reviewed → dismissed, terminal (Admin). */
export type DismissFraudSignal = (
  input: FraudSignalTriageInput,
  ctx: FraudSignalActorContext,
  deps: FraudSignalDeps,
  db?: DbExecutor,
) => Promise<FraudSignalTriageOutcome>;

/** Concrete `trust.create_fraud_signal.v1` facade (M5 contracts → M5 service). */
export const createFraudSignal: CreateFraudSignal = (input, ctx, deps, db) =>
  createFraudSignalService(input, ctx, deps, db);

/** Concrete `trust.review_fraud_signal.v1` facade. */
export const reviewFraudSignal: ReviewFraudSignal = (input, ctx, deps, db) =>
  reviewFraudSignalService(input, ctx, deps, db);

/** Concrete `trust.action_fraud_signal.v1` facade. */
export const actionFraudSignal: ActionFraudSignal = (input, ctx, deps, db) =>
  actionFraudSignalService(input, ctx, deps, db);

/** Concrete `trust.dismiss_fraud_signal.v1` facade. */
export const dismissFraudSignal: DismissFraudSignal = (input, ctx, deps, db) =>
  dismissFraudSignalService(input, ctx, deps, db);
