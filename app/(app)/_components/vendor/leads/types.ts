// Typed presentation props for the Vendor Leads & Pipeline workspace (Milestone 6 — PL-1/PL-2;
// companion §13.2). The Vendor's PRIVATE CRM of RECEIVED RFQ invitations (Module M4 Operations,
// schema `operations`, BC-OPS-3). ZERO CONTRACT INVENTION: every field/enum binds a REAL frozen value
// (Doc-2 §10 operations schema, Doc-4F, Doc-5F). All optional → genuine-empty in the presentation phase.
//
// FIREWALL (R6, binding): a lead's `won`/`lost` is PRIVATE CRM — it is NEVER the RFQ award and NEVER a
// governance signal; it must not be system-voiced as an affirmative outcome (won → neutral/brand tone +
// "(CRM)" qualifier, never `success`). Leads are RECEIVED-ONLY: created out-of-wire by
// `ops.create_lead_on_invitation` on the `VendorInvited` event — the vendor NEVER self-creates a lead
// (no create affordance exists). Byte-equivalence (Invariant 11 / GR11 / CHK-7-040): no counts/totals,
// no lead-stage win-rate (ND-8), excluded ≡ not-matched ≡ zero, not-found ≡ absence.

/** Lead pipeline stage — FROZEN lead machine (Doc-5F Pass3 :29 / Doc-2 §3.5 · Doc-4F §F6.2):
 *  received → quoted → negotiation → won | lost → follow_up. Legal targets are server-derived; the
 *  exact adjacency/terminality is deferred to the corpus ([ESC-7G-LEAD-MACHINE]). */
export type LeadStage = "received" | "quoted" | "negotiation" | "won" | "lost" | "follow_up";

/** Quick-activity type — a CLIENT-CONVENIENCE prefill over the frozen `activity_jsonb.type` (the jsonb
 *  internal shape is dev-doc, NOT a frozen column set; companion §13.2 m-6). "note" is also the fallback
 *  for private notes until a vendor-owned note slug is confirmed ([ESC-7G-LEAD-NOTE]). */
export type LeadActivityType = "called" | "emailed" | "met" | "quoted_followup" | "note";

/** Non-numeric urgency for `next_action_at` — a UI-DERIVED pill driven purely by the row's OWN date
 *  (companion §13.2 M-1). NOT a domain field and NOT a count; caller/server-supplied (no client clock).
 *  An aggregate over leads is forbidden (ND-8). */
export type NextActionUrgency = "none" | "overdue" | "due_today" | "upcoming";

/** One lead row (PL-1) / header (PL-2) — frozen operations.lead fields. rfq_id / invitation_id /
 *  vendor_profile_id are BARE UUIDs (not a window into RFQ data — DF-3); RFQ display/title is resolved
 *  only on the M3 surface via the grant. No lead human_ref scheme is confirmed ([ESC-7G-LEAD-REF]). */
export interface LeadView {
  id: string;
  stage?: LeadStage;
  /** Frozen bare UUID — used only to link to the M3 RFQ surface (grant-scoped). */
  rfq_id?: string;
  /** Display-only RFQ reference/title, resolved by integration for the row label (not lead-owned data). */
  rfq_human_ref?: string;
  rfq_summary?: string;
  /** Frozen bare UUID. */
  invitation_id?: string;
  /** Frozen bare UUID. */
  vendor_profile_id?: string;
  /** Frozen value_estimate + currency (BDT default; currency stored per value field). */
  value_estimate?: number;
  currency?: string;
  /** Frozen next_action_at — server-formatted date label (no client clock). */
  next_action_at?: string;
  /** UI-derived urgency tier for the pill (from the row's own date). */
  next_action_urgency?: NextActionUrgency;
  /** Custom non-date next-action text (e.g. "Re-engage Q4"); own CRM data. */
  next_action_label?: string;
  /** "Lead created … (from your invitation)" — server-formatted. */
  created_at?: string;
  /** Relative "updated" label ("2h ago") — server-formatted. */
  updated_at?: string;
  /** True once the vendor has submitted a quotation on this RFQ — drives the "Open your quotation" link. */
  has_quotation?: boolean;
}

/** One append-only activity entry (PL-2) — frozen ops.add_lead_activity.v1 (`activity_jsonb`,
 *  server-captured `actor_user_id`). Immutable (Invariant 8): never overwritten or deleted. */
export interface LeadActivityView {
  id: string;
  /** Prefilled from a quick chip; lives inside activity_jsonb (dev-doc shape). */
  type?: LeadActivityType;
  /** Display text of the activity (from activity_jsonb). */
  text?: string;
  /** Resolved label for the server-captured actor ("you" / "system" / a name). */
  actor_label?: string;
  /** True for out-of-wire system entries (e.g. "Lead received from invitation"). */
  is_system?: boolean;
  created_at?: string;
}

/** PL-2 full view model. `legal_targets` is the SERVER-DERIVED set of stages the lead may advance to
 *  (never hard-coded; empty in the presentation phase). */
export interface LeadDetailView {
  lead?: LeadView;
  activities?: LeadActivityView[];
  legal_targets?: LeadStage[];
}
