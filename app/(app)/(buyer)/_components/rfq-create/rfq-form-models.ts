// P-BUY-RFQ (RFQ create, P-BUY-07 · `T-WIZARD`) — PRESENTATION FORM VIEW-MODEL.
//
// The presentation form the buyer fills; the server layer (Doc-7C SR5, GI-02) MAPS it onto the frozen
// `rfq.create_rfq.v1` / `rfq.submit_rfq.v1` commands (Doc-4E §E4.1/§E4.3) when wiring lands (Wave 4; PARKED).
// PRESENTATION-ONLY: no fetch, no mutation, no submit, no business logic (Content ≠ Presentation, Inv #9).
//
// ─ GROUNDING (no invented FROZEN fields) ─────────────────────────────────────────────────────────────
// PINNED `create_rfq` request fields (Doc-4E §E4.1 / Doc-2 §10.4) — modeled here by their EXACT frozen
// names + enums:
//   • `category_id` (uuid)           • `work_nature[]` ⊆ {supply,service,fabricate,consult} (set, no dup)
//   • `estimated_value` (numeric)    • `currency` <BDT>          • `routing_mode` <4 enum>
//   • `scope_text` (text)            • `delivery_geography` (jsonb — dev-doc shape) • `no_formal_spec` (bool)
//   • `spec_document_ids[]` (uuid[]) — the attached spec docs.
// DEV-DOC CAPTURE (NOT frozen create_rfq fields — the surface serializes these into `scope_text` /
// `delivery_geography` / `rfq_versions.content_jsonb`, whose internal schema is "dev-doc scope", exactly
// like the quotation jsonb blobs in P-BUY-14): item/quantity/unit, brand/alt-brand/condition/standards/
// certifications, delivery district/date, payment preference / incoterms / tax, and the granular vendor
// preferences. These are buyer-facing presentation fields, not coined contract fields. Where a granular
// vendor preference overlaps a frozen concept it points, never coins: routing breadth = `routing_mode`;
// "Financial Tier" = the frozen A–E tier (Doc-2). The buyer NEVER sets matching weights (the engine
// decides — R6); these are routing/preference hints only.
//
// GOVERNANCE: draft is permissive (Doc-3 §1.2 — no submission FIXED-set enforced at create); `estimated_value`
// /`delivery_geography`/`routing_mode` are required only at SUBMIT (rendered as such, never wired here). The
// matching engine is never bypassed; no auto-winner/recommendation; AI is absent (Board scope).

// ── Frozen enums (verbatim — Doc-4E §E4.1 / Doc-2 §10.4) ──────────────────────────────────────────────

/** `work_nature` — the frozen capability set (Inv #1: a matrix of flags, never a single label). 1..4, no dup. */
export type WorkNature = "supply" | "service" | "fabricate" | "consult";

/** `routing_mode` — how broadly the (governed) engine may route. The buyer sets breadth; the engine matches. */
export type RoutingMode =
  "approved_only" | "approved_conditional" | "approved_open" | "open_market";

/** `currency` — frozen <BDT> at create (Doc-2 §0.4 multi-currency-ready; only BDT today). */
export type RfqCurrency = "BDT";

/** Frozen Financial Tier (Doc-2 §Governance signals) — a capability tier (A best … E), NOT a subscription
 *  plan (Inv #10). A vendor-preference HINT only; never a matching weight the buyer controls (R6). */
export type FinancialTier = "A" | "B" | "C" | "D" | "E";

// ── The presentation form (every field optional — a draft is permissive, Doc-3 §1.2) ─────────────────

/** One attachment row in the presentation upload list (`spec_document_ids[]` at wiring; ESC-7-API/upload).
 *  PRESENTATION-ONLY — no real file handling; `status` drives the validation-state UI. */
export interface RfqAttachment {
  id: string;
  name: string;
  sizeLabel?: string;
  /** Presentation validation state (no real upload occurs this milestone). */
  status?: "ready" | "too-large" | "unsupported";
}

export interface RfqDraftForm {
  // Phase 2 — Requirement details
  /** Presentation-only industry grouping that filters the category picker — NOT a stored create_rfq field. */
  industry?: string;
  /** `category_id` (the picker's value is the opaque category id; the label is display). */
  categoryId?: string;
  categoryLabel?: string;
  /** `work_nature[]` — the frozen set (Request Type). */
  workNature?: WorkNature[];
  /** Dev-doc capture → serialized into scope_text/content_jsonb. */
  itemName?: string;
  quantity?: string;
  unit?: string;

  // Phase 3 — Technical requirements (dev-doc capture; `scope_text` is the frozen free-text home)
  /** `scope_text` — the specification editor (the one frozen text field; min length enforced at submit). */
  scopeText?: string;
  /** `no_formal_spec` (frozen bool) — the buyer attaches no formal spec. */
  noFormalSpec?: boolean;
  brandPreference?: string;
  alternativeBrand?: string;
  productCondition?: string;
  standards?: string;
  certifications?: string;

  // Phase 4 — Attachments (`spec_document_ids[]` at wiring; presentation-only here)
  attachments?: RfqAttachment[];

  // Phase 5 — Logistics & commercial (`delivery_geography` jsonb + dev-doc capture)
  deliveryLocation?: string;
  district?: string;
  deliveryDate?: string;
  /** `estimated_value` (numeric) + `currency` <BDT>. */
  budget?: string;
  currency?: RfqCurrency;
  paymentPreference?: string;
  incoterm?: string;
  tax?: string;

  // Phase 6 — Vendor preferences (`routing_mode` frozen + dev-doc preference hints; never matching weights)
  routingMode?: RoutingMode;
  preferredVendor?: string;
  verifiedOnly?: boolean;
  manufacturerOrImporter?: string;
  financialTier?: FinancialTier;
  acceptAlternatives?: boolean;
}

/** Submission states for Phase 8 (presentation only — NO real submit occurs this milestone). */
export type RfqSubmissionState = "idle" | "submitting" | "success" | "error";

/** The complete P-BUY-RFQ view-model. `form` seeds field values (empty by default — a blank draft). */
export interface RfqCreateData {
  form: RfqDraftForm;
  /** Which wizard step is active (0-based) — presentation state. */
  activeStep?: number;
  /** Drives the Phase-8 submission-state UI (success/error pages, loading). Default `idle`. */
  submission?: RfqSubmissionState;
}
