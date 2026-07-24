// P-BUY-RFQ (P-BUY-07) Phase 2 — SUBMISSION-READINESS EVALUATION (pure, no React, no I/O).
//
// The FE MIRRORS the frozen submission FIXED-set (Doc-3 §1.2 / Doc-4E §E4.3 stage-8 BUSINESS) to
// GUIDE the buyer; the server ENFORCES it. This module coins no lifecycle state — the readiness
// states (`not-ready` / `needs-attention` / `ready`) are PRESENTATION only (Doc-2 §5.4 owns RFQ
// lifecycle states). Nothing here mutates; it derives guidance from the draft form + the
// server-provided `rfq.min_scope_chars` seam value.
//
// The submission FIXED-set (Doc-3 §1.2):
//   • category active · `work_nature` non-empty · `estimated_value` > 0 BDT · delivery ≥ district
//   • `routing_mode` set · (≥1 spec attachment OR `no_formal_spec` + scope ≥ rfq.min_scope_chars)

import type { RfqDraftForm } from "./rfq-form-models";

/** The eight canvas sections (rail order). Each blocker/warning is anchored to one. */
export type RfqSectionId =
  | "requirement"
  | "specification"
  | "attachments"
  | "terms"
  | "delivery"
  | "routing"
  | "value"
  | "communication";

/** A single readiness row — a mirrored FIXED-set check (blocker) or a non-blocking nudge (warning). */
export interface ReadinessItem {
  id: string;
  /** Human sentence rendered in the readiness panel. */
  label: string;
  /** Whether the condition is currently satisfied. */
  met: boolean;
  /** The section this row jumps to. */
  section: RfqSectionId;
  /** Optional element id to focus after the scroll (the field the buyer must fix). */
  focusId?: string;
  /** Short "go to …" affordance text. */
  hint?: string;
}

/** Presentation readiness state — NEVER persisted as an RFQ lifecycle state (Doc-2 §5.4). */
export type RfqReadinessState = "not-ready" | "needs-attention" | "ready";

/** Parse a buyer-typed amount ("1,800,000" / "1 800 000") into a number; non-numeric → 0. */
export function parseAmount(value?: string): number {
  if (!value) return 0;
  const n = Number.parseFloat(String(value).replace(/[,\s]/g, ""));
  return Number.isNaN(n) ? 0 : n;
}

/** Length of the trimmed written scope (drives the `no_formal_spec` conditional meter). */
export function scopeLength(form: RfqDraftForm): number {
  return (form.scopeText ?? "").trim().length;
}

/** Count of presentation attachments that are not rejected (real upload is gated). */
export function readyAttachmentCount(form: RfqDraftForm): number {
  return (form.attachments ?? []).filter((a) => a.status !== "too-large").length;
}

/** Whether the conditional specification rule is satisfied (≥1 attachment OR no_formal_spec + scope). */
export function isSpecSatisfied(form: RfqDraftForm, minScopeChars: number): boolean {
  if (readyAttachmentCount(form) > 0) return true;
  return !!form.noFormalSpec && scopeLength(form) >= minScopeChars;
}

/** Does any item row carry a name? (a warning-level nudge, never a submission blocker). */
export function hasNamedItem(form: RfqDraftForm): boolean {
  return (form.itemRows ?? []).some((r) => (r.itemName ?? "").trim().length > 0);
}

/** The blocking submission checks — the FE mirror of the Doc-3 §1.2 FIXED-set (server enforces). */
export function evaluateBlockers(form: RfqDraftForm, minScopeChars: number): ReadinessItem[] {
  const attachments = readyAttachmentCount(form);
  return [
    {
      id: "category",
      label: "Category selected",
      met: !!form.categoryId,
      section: "requirement",
      hint: "Set in Zone 1",
    },
    {
      id: "work_nature",
      label: "Work nature chosen",
      met: (form.workNature ?? []).length > 0,
      section: "requirement",
      hint: "Set in Zone 1",
    },
    {
      id: "estimated_value",
      label: "Estimated value greater than BDT 0",
      met: parseAmount(form.budget) > 0,
      section: "value",
      focusId: "rfq-estimated-value",
      hint: "Go to Estimated value",
    },
    {
      id: "district",
      label: "Delivery district",
      met: !!(form.district ?? "").trim(),
      section: "delivery",
      focusId: "rfq-district",
      hint: "Go to Delivery",
    },
    {
      id: "routing_mode",
      label: "Routing breadth",
      met: !!form.routingMode,
      section: "routing",
      focusId: "rfq-routing",
      hint: "Go to Vendor routing",
    },
    {
      id: "specification",
      label:
        attachments > 0
          ? "Specification attached"
          : `Specification — attachment, or written scope of ${minScopeChars}+ characters`,
      met: isSpecSatisfied(form, minScopeChars),
      section: "specification",
      focusId: "rfq-scope",
      hint: "Go to Specification",
    },
  ];
}

/** Non-blocking nudges — improve quotability, never gate Submit. */
export function evaluateWarnings(form: RfqDraftForm): ReadinessItem[] {
  return [
    {
      id: "items",
      label: "No item lines yet — vendors quote more accurately against a line list",
      met: hasNamedItem(form),
      section: "requirement",
      hint: "Go to Requirement",
    },
    {
      id: "delivery_date",
      label: "No required delivery date — logistics can't be priced",
      met: !!(form.deliveryDate ?? "").trim(),
      section: "delivery",
      hint: "Go to Delivery",
    },
    {
      id: "attachments",
      label: "No attachments — vendors will quote from your written scope alone",
      met: readyAttachmentCount(form) > 0,
      section: "attachments",
      hint: "Go to Attachments",
    },
    {
      id: "contact",
      label: "No RFQ contact person named",
      met: !!(form.contactPersonName ?? "").trim(),
      section: "communication",
      hint: "Go to Communication",
    },
  ];
}

/** Per-section completion + blocker count for the rail (dot + badge). */
export interface SectionStatus {
  /** Section's own required fields satisfied (drives the completion dot). */
  done: boolean;
  /** Count of unmet submission blockers anchored to this section (drives the red badge). */
  blockers: number;
}

export function sectionStatuses(
  form: RfqDraftForm,
  minScopeChars: number,
): Record<RfqSectionId, SectionStatus> {
  const specOk = isSpecSatisfied(form, minScopeChars);
  const districtOk = !!(form.district ?? "").trim();
  const routingOk = !!form.routingMode;
  const valueOk = parseAmount(form.budget) > 0;
  const termsOk = (form.termsAndConditions ?? []).some((t) => t.trim().length > 0);
  return {
    requirement: { done: !!form.categoryId && (form.workNature ?? []).length > 0, blockers: 0 },
    specification: { done: specOk, blockers: specOk ? 0 : 1 },
    attachments: { done: readyAttachmentCount(form) > 0, blockers: 0 },
    terms: { done: termsOk, blockers: 0 },
    delivery: { done: districtOk, blockers: districtOk ? 0 : 1 },
    routing: { done: routingOk, blockers: routingOk ? 0 : 1 },
    value: { done: valueOk, blockers: valueOk ? 0 : 1 },
    communication: { done: !!(form.contactPersonName ?? "").trim(), blockers: 0 },
  };
}

/** Overall readiness state from the unmet blockers/warnings (presentation only). */
export function readinessState(
  blockers: ReadinessItem[],
  warnings: ReadinessItem[],
): RfqReadinessState {
  if (blockers.some((b) => !b.met)) return "not-ready";
  if (warnings.some((w) => !w.met)) return "needs-attention";
  return "ready";
}

/** Convenience: everything a readiness view needs in one derive. */
export interface ReadinessSnapshot {
  blockers: ReadinessItem[];
  warnings: ReadinessItem[];
  sections: Record<RfqSectionId, SectionStatus>;
  state: RfqReadinessState;
  /** Number of met blockers over total (drives the progress bar). */
  metBlockers: number;
  totalBlockers: number;
}

export function evaluateReadiness(form: RfqDraftForm, minScopeChars: number): ReadinessSnapshot {
  const blockers = evaluateBlockers(form, minScopeChars);
  const warnings = evaluateWarnings(form);
  return {
    blockers,
    warnings,
    sections: sectionStatuses(form, minScopeChars),
    state: readinessState(blockers, warnings),
    metBlockers: blockers.filter((b) => b.met).length,
    totalBlockers: blockers.length,
  };
}
