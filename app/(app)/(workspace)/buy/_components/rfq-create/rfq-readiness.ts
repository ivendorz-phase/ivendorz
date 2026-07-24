// P-BUY-RFQ — SUBMIT READINESS (owner ruling D3, 2026-07-24). Pure derivation over the presentation
// form; no React, no fetch, no state.
//
// GROUNDING — this file MIRRORS the frozen submission gate, it does not invent one. The blocking set
// below is Doc-3 §1.2's submission FIXED-set, item for item:
//   category present and active · `work_nature` non-empty · `estimated_value` present and > 0 BDT ·
//   delivery geography at least to district level · routing mode selected · at least one
//   specification attachment OR an explicit `no_formal_spec` flag with free-text scope ≥ POLICY
//   `rfq.min_scope_chars` · attached specs reference an active document revision.
// The last item cannot be evaluated client-side (document revisions are a server read), so it is
// NOT modelled here — the server enforces it and a BUSINESS failure maps back onto this panel at
// wiring (Doc-4E §E4.3 stage-8). Everything here is GUIDANCE; the server decides.
//
// TWO TIERS (D3): `startBlockers` is what `create_rfq` requires to exist at all (Doc-4E §E4.1 marks
// `category_id` and `work_nature[]` Required: yes); `submitBlockers` is the FIXED-set above.
// Warnings never block — they are quality coaching, never a gate (Doc-3 §1.7: RFQ quality is
// operational metadata, never an exclusion).
//
// The readiness STATES are presentation only. They are never persisted and are not RFQ lifecycle
// states — Doc-2 §5.4 owns those, and this file coins none.

import type { RfqDraftForm } from "./rfq-form-models";

/** Which section a finding points at — used to jump and focus. Ids match the canvas sections. */
export type RfqSectionId =
  | "requirement"
  | "specification"
  | "attachments"
  | "terms"
  | "delivery"
  | "vendor"
  | "value"
  | "communication";

export interface RfqCheck {
  id: string;
  label: string;
  met: boolean;
  section: RfqSectionId;
  /** Element id to focus after jumping, when the finding points at one field. */
  focusId?: string;
  /** Set for the two Zone-1 answers — they are changed in the gate, not on the canvas. */
  inZoneOne?: boolean;
}

/** Presentation states only (D3). Never persisted, never an RFQ lifecycle state. */
export type RfqReadinessState = "not-ready" | "needs-attention" | "ready";

export interface RfqReadiness {
  submitBlockers: RfqCheck[];
  warnings: RfqCheck[];
  state: RfqReadinessState;
  metCount: number;
  totalCount: number;
  unmetBlockers: RfqCheck[];
  unmetWarnings: RfqCheck[];
}

function filled(value?: string) {
  return typeof value === "string" && value.trim().length > 0;
}

/** `estimated_value` — parsed leniently (the buyer may type separators), then bounded > 0. */
export function parseEstimatedValue(raw?: string): number {
  if (!filled(raw)) return 0;
  const n = Number.parseFloat(String(raw).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

/** Item rows that actually carry a requirement (a blank trailing row is not an item). */
export function meaningfulItemRows(form: RfqDraftForm) {
  return (form.itemRows ?? []).filter((r) => r.itemName.trim().length > 0);
}

/** Attachments that would resolve to a `spec_document_ids[]` entry (rejected files do not count). */
export function usableAttachments(form: RfqDraftForm) {
  return (form.attachments ?? []).filter(
    (a) => a.status !== "too-large" && a.status !== "unsupported",
  );
}

/** Tier 1 — what `create_rfq` needs before a draft can exist at all (Doc-4E §E4.1). */
export function startBlockers(form: RfqDraftForm): RfqCheck[] {
  return [
    {
      id: "category",
      label: "Category",
      met: filled(form.categoryId),
      section: "requirement",
      inZoneOne: true,
    },
    {
      id: "work-nature",
      label: "Type of work",
      met: (form.workNature ?? []).length > 0,
      section: "requirement",
      inZoneOne: true,
    },
  ];
}

export function canStartDraft(form: RfqDraftForm) {
  return startBlockers(form).every((c) => c.met);
}

/**
 * Tier 2 — the frozen submission FIXED-set (Doc-3 §1.2), mirrored for guidance.
 * `minScopeChars` is POLICY `rfq.min_scope_chars` and is SERVER-PROVIDED — never hardcode it in a
 * component; the caller threads it down from the route.
 */
export function evaluateReadiness(form: RfqDraftForm, minScopeChars: number): RfqReadiness {
  const attachments = usableAttachments(form);
  const scopeLength = (form.scopeText ?? "").trim().length;
  const specSatisfied =
    attachments.length > 0 || (form.noFormalSpec === true && scopeLength >= minScopeChars);

  const submitBlockers: RfqCheck[] = [
    ...startBlockers(form),
    {
      id: "estimated-value",
      label: "Estimated value greater than BDT 0",
      met: parseEstimatedValue(form.budget) > 0,
      section: "value",
      focusId: "rfq-budget",
    },
    {
      id: "district",
      label: "Delivery district",
      met: filled(form.district),
      section: "delivery",
      focusId: "rfq-district",
    },
    {
      id: "routing",
      label: "Routing breadth",
      met: filled(form.routingMode),
      section: "vendor",
      focusId: "rfq-routing",
    },
    {
      id: "specification",
      label:
        attachments.length > 0
          ? "Specification attached"
          : `Specification — an attachment, or a written scope of ${minScopeChars}+ characters`,
      met: specSatisfied,
      section: "specification",
      focusId: "rfq-scope",
    },
  ];

  // Quality coaching. Never gates — Doc-3 §1.7 (RFQ quality is operational metadata, not exclusion).
  const warnings: RfqCheck[] = [
    {
      id: "items",
      label: "No item lines yet — vendors quote more accurately against a line list",
      met: meaningfulItemRows(form).length > 0,
      section: "requirement",
    },
    {
      id: "delivery-date",
      label: "No required delivery date — logistics cannot be priced",
      met: filled(form.deliveryDate),
      section: "delivery",
      focusId: "rfq-date",
    },
    {
      id: "attachments",
      label: "No attachments — vendors will quote from your written scope alone",
      met: attachments.length > 0,
      section: "attachments",
    },
    {
      id: "contact",
      label: "No RFQ contact person named",
      met: filled(form.contactPersonName),
      section: "communication",
    },
  ];

  const unmetBlockers = submitBlockers.filter((c) => !c.met);
  const unmetWarnings = warnings.filter((c) => !c.met);

  const state: RfqReadinessState = unmetBlockers.length
    ? "not-ready"
    : unmetWarnings.length
      ? "needs-attention"
      : "ready";

  return {
    submitBlockers,
    warnings,
    state,
    metCount: submitBlockers.length - unmetBlockers.length,
    totalCount: submitBlockers.length,
    unmetBlockers,
    unmetWarnings,
  };
}

export const READINESS_LABEL: Record<RfqReadinessState, string> = {
  "not-ready": "Not ready",
  "needs-attention": "Needs attention",
  ready: "Ready to submit",
};

/** Per-section blocker counts, for the rail. */
export function blockersBySection(readiness: RfqReadiness): Record<string, number> {
  const out: Record<string, number> = {};
  for (const check of readiness.unmetBlockers) {
    out[check.section] = (out[check.section] ?? 0) + 1;
  }
  return out;
}
