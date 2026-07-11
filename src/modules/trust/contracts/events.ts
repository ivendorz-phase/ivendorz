// Event names + versioned payload types emitted by module "trust" (Doc-2 §8 / Doc-4J catalog).
//
// W3-TRUST-3 realizes the FIRST §8 emitter for M5: `VendorTierChanged` (Doc-2 §8 — the
// `trust.verified_financial_tiers` status/tier-change event; Doc-4G §G4.6/§G4.7 §8). The event NAME is
// bound BY POINTER to the Doc-2 §8 catalog (`VendorTierChanged`); it is NEVER coined here. The payload is
// THIN (Doc-4A §16.5 — IDs + minimal metadata). The verified-tier write-service emits this via the M0
// `core.write_outbox_event.v1` primitive (Doc-4B §B10) IN THE SAME transaction as the tier write.
//
// CONSUMER note (deferred): Marketplace consumes `VendorTierChanged[verified]` and writes
// `marketplace.financial_tier_history` + its read-model band — Trust NEVER writes that table (Doc-4G
// §G4.6/§G4.7 §8). No consumer is built in this WP.

import type { FinancialTier } from "./types";

/**
 * `VendorTierChanged` — the Doc-2 §8 event name (bound by pointer; the `trust.verified_financial_tiers`
 * status/tier-change event). Emitted on set / confirm / downgrade / suspend / expire. Never coined here.
 */
export const VENDOR_TIER_CHANGED_EVENT = "VendorTierChanged" as const;

/**
 * The emitted `event_version` for `VendorTierChanged`. The corpus mandates `event_version ≥ 1` (Doc-4A
 * §16.4) but pins NO value — `1` is the first-version REALIZATION DEFAULT (documented; NOT a coined frozen
 * value). A payload-shape change would bump this via an additive Doc-2/Doc-4G patch.
 */
export const VENDOR_TIER_CHANGED_EVENT_VERSION = 1 as const;

/**
 * The THIN payload of `VendorTierChanged` (Doc-4G §G4.6/§G4.7 §8: `tier_type='verified'` + old/new tier).
 * `aggregate_id` on the outbox row is the `vendorProfileId` (the aggregate the event concerns). Property
 * NAMES are camelCase (Doc-5A v1.0.1 Option B — result-payload convention); enum VALUES are the frozen sets.
 */
export interface VendorTierChangedPayload {
  /** The tier dimension this event concerns — always `verified` here (M5 owns the verified tier). */
  tierType: "verified";
  /** The vendor profile the verified tier belongs to (bare UUID → M2). = the outbox `aggregate_id`. */
  vendorProfileId: string;
  /** The tier BEFORE the change — `null` only on `set` (absence-of-row → verified). */
  oldTier: FinancialTier | null;
  /** The tier AFTER the change (A–E). Unchanged on confirm/suspend/expire (status-only change). */
  newTier: FinancialTier;
}
