// Public DTOs / IDs for module "billing" (cross-module surface). DTOs/IDs only — domain value-objects
// stay private. Realized per Doc-4I §HB-1.4 (the two Plan/Entitlement reads) + Doc-5I §4 (wire) +
// Doc-2 §10.8 (column set) + Doc-6I §3.1 (schema) — bound by pointer, never re-authored.
//
// SCOPE (W3-BILL-1, M7 pilot slice): the two authenticated Platform-Public catalog reads
// `billing.get_plan.v1` (`GET /billing/plans/{plan_id}`) and `billing.list_plans.v1`
// (`GET /billing/plans`). Both are authenticated (Doc-5I §3.6 "authentication only" — no billing slug,
// no org/tenant scope) reads of the platform-owned plan catalog. NO audit (reads — Doc-5A §17.1), NO
// events, NO state mutation.
//
// RESULT CASING (Doc-5A v1.0.1 Option B, program-binding): the wire `result` payload property NAMES
// are camelCase (`planId`, `billingCycle`, `pageInfo`, …); the envelope/identifiers/enum-values stay
// as their frozen strings. Same convention the shipped M2 reads use (see
// `src/modules/marketplace/contracts/types.ts`).
//
// RETIRED-PLAN VISIBILITY — `[ESC-BILL-RETIRE-VIS]` RESOLVED (owner ruling 2026-07-11; Doc-5I §4
// corrected to match Doc-6I — `Doc-5I_RetiredVisibility_Patch_v1.0`): retired plans are visible to
// **staff/admin only**; active + draft → authenticated users. These reads return the non-retired
// catalog (`deleted_at IS NULL`, the `plans_public_read` set) to a non-staff caller — retired is hidden
// (a normal user never reads a retired plan). So `status` on this non-staff surface is only ever
// `draft` | `active`. The staff-facing retired-read WIRE path lands with DC-3 staff resolution (carried,
// not a gap — the non-staff security fence is enforced here).

/**
 * Plan lifecycle status (Doc-2 §3.8 `draft → active → retired`). DERIVED, never stored (Doc-2 §10.8:
 * `plans` carries no `status` column) — `retired` ⟺ soft-deleted, `active` ⟺ `is_active`, else `draft`.
 */
export type PlanStatus = "draft" | "active" | "retired";

/** Plan billing cadence (Doc-2 §10.8 `billing_cycle` enum). */
export type BillingCycle = "monthly" | "annual";

/** Entitlement value type (Doc-2 §10.8 `entitlement_type` enum). */
export type EntitlementType = "boolean" | "numeric" | "enum";

/** A bundled entitlement's resolved value (Doc-4I §HB-1.4 `value : boolean | integer | string`). */
export type PlanEntitlementValue = boolean | number | string;

/**
 * One entitlement bundled on a plan (Doc-4I §HB-1.4 `get_plan` output `entitlements[]`). `value` is the
 * per-plan `plan_entitlements.value_jsonb` (BL-CR4 — the gate is the entitlement VALUE, never the plan name).
 */
export interface PlanEntitlementView {
  entitlementId: string;
  slug: string;
  type: EntitlementType;
  value: PlanEntitlementValue;
}

/**
 * The full plan projection (Doc-4I §HB-1.4 / Doc-5I §4 `get_plan` output — EXACT field set: no
 * `human_ref`/`description`/timestamp, which are not in the Doc-4I output — adding one would be
 * `[ESC-BILL-FIELD]`). `price` is Doc-2 §10.8 `numeric` rendered as a precision-preserving decimal
 * STRING (JSON has no exact decimal type — the money-safe realization convention, disclosed).
 */
export interface PlanView {
  planId: string;
  name: string;
  billingCycle: BillingCycle;
  price: string;
  currency: string;
  status: PlanStatus;
  isActive: boolean;
  entitlements: PlanEntitlementView[];
}

/** Lookup key for `get_plan` — the path `{plan_id}` (Doc-5I §4). Public input; no org/tenant context. */
export interface GetPlanKey {
  planId: string;
}

/**
 * `get_plan` wire result: found (200) or not-found (404). Non-disclosure does NOT apply — the catalog
 * is platform-owned, not org-owned (Doc-5I §3.6), so `404` here means simply "no such plan_id"
 * (including a retired/soft-deleted plan on the non-staff surface — see the RETIRED-PLAN note above).
 */
export type GetPlanResult = { found: true; plan: PlanView } | { found: false };

/**
 * The application-level `get_plan` outcome: the frozen found/not-found result PLUS the pre-lookup
 * SYNTAX validation leg (a malformed `plan_id` — Doc-4I §HB-1.4 Stage 1). The wire mapper
 * (`api/get-plan.handler.ts`) turns `invalidInput` into a `400 VALIDATION`; found/not-found map to
 * `200`/`404`. The `GetPlanResult` success shape is byte-identical to the frozen contract.
 */
export type GetPlanOutcome = GetPlanResult | { found: false; invalidInput: true };

// ─────────────────────────────────────────────────────────────────────────────
// `billing.list_plans.v1` (Doc-4I §HB-1.4 / Doc-5I §4 `GET /billing/plans`). Paginated catalog read —
// cursor-based (Doc-5A §8): `?cursor=&page_size=`; declared `filter` allowlist `{ billing_cycle?,
// is_active?, status? }` (Doc-4I §HB-1.4). Sort is server-fixed to `name` asc / `plan_id` tiebreak for
// a total order (the M2 directory precedent) — no client `sort` parameter is exposed.
// ─────────────────────────────────────────────────────────────────────────────

/** `list_plans` filter allowlist (Doc-4I §HB-1.4). Each field independently optional; undeclared → VALIDATION. */
export interface ListPlansFilters {
  billingCycle?: BillingCycle;
  isActive?: boolean;
  status?: PlanStatus;
}

/** Request shape for `list_plans` (Doc-4I §HB-1.4; Doc-5A §8 cursor/page_size grammar). */
export interface ListPlansRequest {
  filters?: ListPlansFilters;
  cursor?: string;
  pageSize?: number;
}

/** One `list_plans` item (Doc-4I §HB-1.4 list output — no `entitlements`; use `get_plan` for the bundle). */
export interface PlanListItem {
  planId: string;
  name: string;
  billingCycle: BillingCycle;
  price: string;
  currency: string;
  status: PlanStatus;
}

/** Doc-5A §8.6 page_info (camelCase result realization — Option B; `total_count` omitted, optional per §8.6). */
export interface ListPlansPageInfo {
  nextCursor?: string;
  hasMore: boolean;
}

/** Result of `list_plans` — the Doc-5A §8.6 list shape (items + page_info), carried under the §5.6 `result`. */
export interface ListPlansResult {
  items: PlanListItem[];
  pageInfo: ListPlansPageInfo;
}

/**
 * The application-level `list_plans` outcome: the frozen list result PLUS the pre-scope SYNTAX leg (an
 * undeclared filter field, malformed `billing_cycle`/`is_active`/`status`/`cursor`, or out-of-bound
 * `page_size` — Doc-5A §8.3/§8.4/§8.5). The wire mapper turns `invalidInput` into `400 VALIDATION`; the
 * success leg is byte-identical to `ListPlansResult`.
 */
export type ListPlansOutcome = ListPlansResult | { invalidInput: true };

// ─────────────────────────────────────────────────────────────────────────────
// BC-BILL-1 Admin PLAN-CATALOG WRITES (W3-BILL-2) — `create_plan` / `activate_plan` / `update_plan` /
// `retire_plan` (Doc-4I §HB-1.1 + §HB-1.1a ActivatePlan patch / Doc-5I §4). Platform-staff (Admin, §5.6)
// audited writes — no org/tenant scope, no §8 event. Authority = `[ESC-BILL-SLUG]` (platform-staff basis;
// no slug coined). Audit = `[ESC-BILL-AUDIT]` (Admin-attributed; §9 Platform "service-role sensitive
// operations" by pointer). Concurrency = `expected_status` (Doc-4A §14 — the derived-status assertion,
// Model B), NOT an `updated_at` ETag.
// ─────────────────────────────────────────────────────────────────────────────

/** The Doc-4A §12 error classes a BC-BILL-1 catalog write can raise (module-outcome shape). */
export type PlanWriteErrorClass =
  | "VALIDATION"
  | "AUTHORIZATION"
  | "STATE"
  | "CONFLICT"
  | "REFERENCE"
  | "BUSINESS"
  | "DEPENDENCY"
  | "SYSTEM";

/** A BC-BILL-1 catalog-write failure (the in-process outcome; the handler maps it to the §6.2 status). */
export interface PlanWriteError {
  errorClass: PlanWriteErrorClass;
  errorCode: string;
  message: string;
}

/** `create_plan` input (Doc-4I §HB-1.1 create — verbatim; `is_active` is NOT accepted: create always
 *  mints a `draft`, i.e. `is_active=false`, under Model B). */
export interface CreatePlanInput {
  name: string;
  billingCycle: BillingCycle;
  /** Doc-2 §10.8 `numeric` money — accepted as a decimal string (precision-safe). */
  price: string;
  currency: string;
}

/** `create_plan` success (Doc-4I §HB-1.1 minimal output; `status` is always `draft`). */
export interface CreatePlanResult {
  planId: string;
  status: PlanStatus;
}

export type CreatePlanOutcome =
  { ok: true; result: CreatePlanResult } | { ok: false; error: PlanWriteError };

/** The shared minimal lifecycle output (Doc-5I §4 — `{ plan_id, status }`). */
export interface PlanLifecycleResult {
  planId: string;
  status: PlanStatus;
}

/** `activate_plan` input (Doc-4I §HB-1.1a — `expected_status` must be `draft`). */
export interface ActivatePlanInput {
  planId: string;
  expectedStatus: "draft";
}

export type ActivatePlanOutcome =
  { ok: true; result: PlanLifecycleResult } | { ok: false; error: PlanWriteError };

/** `update_plan` input (Doc-4I §HB-1.1 — marketing-config mutation; NOT `is_active`, NOT a status edge).
 *  `expected_status` ∈ {`draft`,`active`} (a `retired` plan is terminal — rejected `STATE`). */
export interface UpdatePlanInput {
  planId: string;
  expectedStatus: "draft" | "active";
  name?: string;
  billingCycle?: BillingCycle;
  price?: string;
  currency?: string;
}

export type UpdatePlanOutcome =
  { ok: true; result: PlanLifecycleResult } | { ok: false; error: PlanWriteError };

/** `retire_plan` input (Doc-4I §HB-1.1 — `active|draft → retired`; `expected_status` ∈ {`draft`,`active`}). */
export interface RetirePlanInput {
  planId: string;
  expectedStatus: "draft" | "active";
}

export type RetirePlanOutcome =
  { ok: true; result: PlanLifecycleResult } | { ok: false; error: PlanWriteError };

// ─────────────────────────────────────────────────────────────────────────────
// BC-BILL-1 ENTITLEMENT-CATALOG + BUNDLE WRITES (W3-BILL-3) — `create_entitlement` / `update_entitlement`
// (Doc-4I §HB-1.3) + `bundle_plan_entitlement` (Doc-4I §HB-1.2), per Doc-5I §4. Platform-staff (Admin)
// audited writes; no org scope, no §8 event; `[ESC-BILL-SLUG]` authority; `[ESC-BILL-AUDIT]` audit. The
// error/failure shape is the shared `PlanWriteError` (BUSINESS = the duplicate-slug leg).
// ─────────────────────────────────────────────────────────────────────────────

/** `create_entitlement` input (Doc-4I §HB-1.3 — `slug` UNIQUE; `type`; optional `default_value`). */
export interface CreateEntitlementInput {
  slug: string;
  type: EntitlementType;
  /** Default per type (presence/shape only — Doc-4I §HB-1.3). Any JSON value; omitted = null. */
  defaultValue?: unknown;
}

/** The shared entitlement write output (Doc-5I §4 — `{ entitlement_id, slug, type }`). */
export interface EntitlementView {
  entitlementId: string;
  slug: string;
  type: EntitlementType;
}

export type CreateEntitlementOutcome =
  { ok: true; result: EntitlementView } | { ok: false; error: PlanWriteError };

/** `update_entitlement` input (Doc-4I §HB-1.3 — mutate `type`/`default_value`; `slug` is immutable identity).
 *  Both fields optional (omitted = unchanged). No concurrency token in the frozen wire (Doc-5I §4). */
export interface UpdateEntitlementInput {
  entitlementId: string;
  type?: EntitlementType;
  defaultValue?: unknown;
}

export type UpdateEntitlementOutcome =
  { ok: true; result: EntitlementView } | { ok: false; error: PlanWriteError };

/** `bundle_plan_entitlement` input (Doc-4I §HB-1.2 — PK `plan_id`+`entitlement_id`; `value_jsonb` required). */
export interface BundlePlanEntitlementInput {
  planId: string;
  entitlementId: string;
  /** The per-plan bundle value (presence required; any JSON value — Doc-4I §HB-1.2). */
  valueJsonb: unknown;
}

/** `bundle_plan_entitlement` output (Doc-5I §4 — `{ plan_id, entitlement_id }`). */
export interface BundlePlanEntitlementResult {
  planId: string;
  entitlementId: string;
}

export type BundlePlanEntitlementOutcome =
  { ok: true; result: BundlePlanEntitlementResult } | { ok: false; error: PlanWriteError };

// ─────────────────────────────────────────────────────────────────────────────
// BC-BILL-2 SUBSCRIPTIONS (W3-BILL-4) — `purchase_subscription` (Doc-4I §HB-2.1) + `get_subscription`
// (Doc-4I §HB-2.5) per Doc-5I §5. ORG-SCOPED (Users Act, Orgs Own): the actor is a User with
// `can_manage_billing` (Owner), the write runs in the server-validated active-org context (never a
// client org id — Invariant #5). `purchase` emits `SubscriptionPurchased` (Doc-2 §8, at creation) via
// the M0 outbox. The failure shape reuses `PlanWriteError` (STATE = one-active-per-org; REFERENCE = plan
// not active).
// ─────────────────────────────────────────────────────────────────────────────

/** Subscription lifecycle status (Doc-2 §5.7 — the stored `subscriptions.state`). */
export type SubscriptionStatus = "pending_payment" | "active" | "expired";

/** `purchase_subscription` input (Doc-4I §HB-2.1 — `plan_id`; optional `auto_renew` default true). */
export interface PurchaseSubscriptionInput {
  planId: string;
  autoRenew?: boolean;
}

/** `purchase_subscription` success (Doc-4I §HB-2.1 / Doc-5I §5 — `{ subscription_id, status, plan_id }`;
 *  `status` is `pending_payment` at creation). */
export interface PurchaseSubscriptionResult {
  subscriptionId: string;
  status: SubscriptionStatus;
  planId: string;
}

export type PurchaseSubscriptionOutcome =
  { ok: true; result: PurchaseSubscriptionResult } | { ok: false; error: PlanWriteError };

/** The org's subscription head (Doc-4I §HB-2.5 output). `period_*` are ISO-8601 strings (nullable). */
export interface SubscriptionView {
  subscriptionId: string;
  planId: string;
  status: SubscriptionStatus;
  periodStart: string | null;
  periodEnd: string | null;
  autoRenew: boolean;
}

/** `get_subscription` result — the org's current subscription, or none (Doc-4I §HB-2.5). */
export type GetSubscriptionResult =
  { found: true; subscription: SubscriptionView } | { found: false };

// ─────────────────────────────────────────────────────────────────────────────
// BC-BILL-2 COMPLETION (W3-BILL-5) — `cancel_subscription` (Doc-4I §HB-2.2) + `list_subscription_events`
// (Doc-4I §HB-2.5) per Doc-5I §5. Both are ORG-SCOPED, User-only (Doc-5I §3.6 [ESC-BILL-ADMINSCOPE]):
// cancel = `can_manage_billing` (Owner); list = `can_view_billing` (Owner, Delegate). `resolve_entitlements`
// (Doc-4I §HB-2.4) is OUT-OF-WIRE (Doc-5I §10/R1) — an intra-module internal query (no HTTP surface); its
// types live here only so the module's own BC-BILL-3 consumer + tests share one shape.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The Doc-4A §12 error classes a BC-BILL-2 subscription COMMAND can raise. Distinct from `PlanWriteError`:
 * a subscription is ORG-OWNED, so a cross-org/absent id collapses to `NOT_FOUND` (§3.5 non-disclosure) —
 * the catalog writes (platform-owned) never do. No `REFERENCE`/`BUSINESS` legs on cancel.
 */
export type SubscriptionWriteErrorClass =
  "VALIDATION" | "AUTHORIZATION" | "NOT_FOUND" | "STATE" | "CONFLICT" | "DEPENDENCY" | "SYSTEM";

/** A BC-BILL-2 subscription-command failure (the in-process outcome; the handler maps it to the §6.2 status). */
export interface SubscriptionWriteError {
  errorClass: SubscriptionWriteErrorClass;
  errorCode: string;
  message: string;
}

/** `cancel_subscription` input (Doc-4I §HB-2.2 — `subscription_id`; `expected_status` must be `active`,
 *  the optimistic-concurrency assertion). Sets `auto_renew=false`; status stays `active` (no state edge). */
export interface CancelSubscriptionInput {
  subscriptionId: string;
  expectedStatus: "active";
}

/** `cancel_subscription` success (Doc-4I §HB-2.2 / Doc-5I §5 — `{ subscription_id, status }`; `status`
 *  stays `active` after cancel — `auto_renew` is now false, read the detail via `get_subscription`). */
export interface CancelSubscriptionResult {
  subscriptionId: string;
  status: SubscriptionStatus;
}

export type CancelSubscriptionOutcome =
  { ok: true; result: CancelSubscriptionResult } | { ok: false; error: SubscriptionWriteError };

/** One `subscription_events` history item (Doc-4I §HB-2.5 `items` — `{ event_type, occurred_at }` verbatim).
 *  `event_type` is the stored Doc-2 §10.8 domain value (`purchase|renew|expire|cancel`), rendered as-is —
 *  Doc-5I §5.3's "e.g. purchased|activated|…" is an explicitly illustrative gloss, not the binding domain. */
export interface SubscriptionEventItem {
  eventType: "purchase" | "renew" | "expire" | "cancel";
  occurredAt: string;
}

/** Doc-5A §8.6 page_info for the events list (camelCase result — Option B; `total_count` omitted). */
export interface SubscriptionEventsPageInfo {
  nextCursor?: string;
  hasMore: boolean;
}

/** `list_subscription_events` request (Doc-4I §HB-2.5; Doc-5A §8 cursor/page_size grammar). */
export interface ListSubscriptionEventsRequest {
  subscriptionId: string;
  cursor?: string;
  pageSize?: number;
}

/** `list_subscription_events` result — the Doc-5A §8.6 list shape (items DESC by `occurred_at` + page_info). */
export interface ListSubscriptionEventsResult {
  items: SubscriptionEventItem[];
  pageInfo: SubscriptionEventsPageInfo;
}

/**
 * The application-level `list_subscription_events` outcome: success, a pre-lookup SYNTAX leg
 * (`VALIDATION` — malformed `subscription_id`/`cursor`, out-of-bound `page_size`), or `NOT_FOUND` (the
 * subscription is absent or belongs to another org — protected-fact collapse §3.5). `AUTHORIZATION`
 * (`can_view_billing`) is resolved earlier at the composition edge, never in the query.
 */
export type ListSubscriptionEventsOutcome =
  | { ok: true; result: ListSubscriptionEventsResult }
  | { ok: false; errorClass: "VALIDATION" | "NOT_FOUND" };

// ── `resolve_entitlements` (Doc-4I §HB-2.4) — OUT-OF-WIRE internal-service authority (Doc-5I §10/R1/R10). ──

/** One resolved effective entitlement (Doc-4I §HB-2.4 output `entitlements[]` — `{ slug, type, value }`). */
export interface ResolvedEntitlement {
  slug: string;
  type: EntitlementType;
  /** The per-plan `plan_entitlements.value_jsonb` for the org's active-subscription plan (BL-CR4 — the gate
   *  is the entitlement VALUE, never the plan name). */
  value: PlanEntitlementValue;
}

/** `resolve_entitlements` input (Doc-4I §HB-2.4 — `organization_id`; optional single-slug narrow). */
export interface ResolveEntitlementsInput {
  organizationId: string;
  entitlementSlug?: string;
}

/**
 * `resolve_entitlements` result (Doc-4I §HB-2.4). `source` distinguishes the org's `active`-subscription
 * plan bundle from the Basic profile (A-11) returned when the org has no `active` subscription. The Basic
 * profile is a STATIC empty grant set — never a plan-name lookup (the billing firewall bars plan-name
 * gating; Doc-2 §2 M7 / Invariant #10). Concrete Basic quota values, if ever needed, are a Doc-3 POLICY
 * decision, not invented here.
 */
export interface ResolveEntitlementsResult {
  organizationId: string;
  entitlements: ResolvedEntitlement[];
  source: "active_subscription" | "basic_profile";
}

// ─────────────────────────────────────────────────────────────────────────────
// BC-BILL-3 USAGE & QUOTA (W3-BILL-6) — `enforce_quota` (Doc-4I §HB-3.2, OUT-OF-WIRE) + `get_usage`
// (Doc-4I §HB-3.3 / Doc-5I §6, wired). `record_usage` (§HB-3.1, the writer) is DEFERRED on
// `[ESC-BILL-USAGE-ENTID]` (the `usage_ledger.entitlement_id` NOT-NULL FK has no population path in the
// frozen contract). `amount`/`limit`/`used`/`remaining` are QUOTA UNITS (numbers), never money (Doc-6I §3.3).
// ─────────────────────────────────────────────────────────────────────────────

/** The metered-action source (Doc-2 §10.8 `usage_source`). */
export type UsageSource = "rfq_response" | "lead_access" | "ad_launch";

/** `enforce_quota` input (Doc-4I §HB-3.2 — `organization_id`, `quota_key`; optional `requested_amount`=1). */
export interface EnforceQuotaInput {
  organizationId: string;
  quotaKey: string;
  requestedAmount?: number;
}

/** `enforce_quota` decision (Doc-4I §HB-3.2 output verbatim). `allowed=false` is a QUOTA denial ONLY —
 *  never a routing/eligibility/trust signal (moat/firewall). */
export interface QuotaDecision {
  allowed: boolean;
  quotaKey: string;
  limit: number;
  used: number;
  remaining: number;
}

/** `enforce_quota` outcome — the decision, or a SYNTAX leg. (No wire; the caller surfaces `QUOTA`.) */
export type EnforceQuotaOutcome =
  { ok: true; result: QuotaDecision } | { ok: false; errorClass: "VALIDATION" };

/** One `get_usage` item (Doc-4I §HB-3.3 `items` — `{ quota_key, amount, period, source }`, camelCased). */
export interface UsageItem {
  quotaKey: string;
  amount: number;
  period: string | null;
  source: UsageSource;
}

/** `get_usage` totals facet (Doc-4I §HB-3.3 `totals` — `{ quota_key, used }`; `quotaKey` echoes the filter,
 *  `""` when unfiltered — [realization convention, disclosed]). */
export interface UsageTotals {
  quotaKey: string;
  used: number;
}

/** Doc-5A §8.6 page_info for the usage list (camelCase result — Option B; `total_count` omitted). */
export interface UsagePageInfo {
  nextCursor?: string;
  hasMore: boolean;
}

/** `get_usage` request (Doc-4I §HB-3.3 / Doc-5I §6.2). `filters` is the RAW `filter[*]` map (allowlist
 *  `{ quota_key?, period? }`, validated in the query); `period` defaults to the current `YYYY-MM`. */
export interface GetUsageRequest {
  filters?: Record<string, string>;
  cursor?: string;
  pageSize?: number;
}

/** `get_usage` result — the Doc-4I §HB-3.3 list (items + totals facet + page_info). */
export interface GetUsageResult {
  items: UsageItem[];
  totals: UsageTotals;
  pageInfo: UsagePageInfo;
}

/**
 * The application-level `get_usage` outcome: success, a SYNTAX leg (`VALIDATION` — undeclared filter,
 * malformed `period`/`cursor`, out-of-bound `page_size`), or `BUSINESS` (a FUTURE `period` — Doc-5I §6.2).
 * `AUTHORIZATION` (`can_view_billing`) resolves earlier at the composition edge; org = server-validated
 * active org (never a caller `org_id` — Doc-5I §6.2).
 */
export type GetUsageOutcome =
  { ok: true; result: GetUsageResult } | { ok: false; errorClass: "VALIDATION" | "BUSINESS" };
