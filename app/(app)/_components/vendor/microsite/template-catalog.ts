// Canonical vendor-profile template catalogue — the name↔letter binding for the FROZEN
// `marketplace.microsites.layout_template` enum (A–E; Doc-2 §10.744, Doc-4D PassB:18,
// Doc-6D Pass2:146 `CREATE TYPE`, with `DEFAULT 'A'` at Pass2:152).
//
// ⚠️ GOVERNANCE STATUS: **PROPOSED — Board mint pending.** Gate **G3 is READY, not minted.** The
// owner PROPOSED this name↔letter binding on 2026-07-20 (plan `digital_showcase_planning_and_design.md`
// §3A.0); no formal G3 governance artifact has been created, reviewed, folded into `generatedDocs/`,
// or registered in the Authority Map — verified: the five names appear NOWHERE in the frozen corpus.
// Until that artifact lands, nothing may treat this binding as authoritative production semantics:
// it is a presentation label layer over an enum whose letters stay opaque, it is written nowhere but
// the frozen `layout_template` value, and no behaviour may be derived from a name. Vendor-facing UI
// shows the names without any governance marker (gate handles are internal, never vendor copy —
// the DS-W0 ruling); this header is where the status is recorded.
//
// Two rules the binding carries, both load-bearing:
//
//  1. The canonical template axis is **visual layout style** — not vendor business type. A vendor's
//     business shape may inform WHICH SECTIONS are emphasized (that lives in `profile_sections`
//     `display_order`/`is_visible`), but it never creates a template identity and never locks a
//     vendor to a template. Any "recommended template" affordance is guidance the vendor may ignore.
//
//  2. The corpus attaches NO semantics to the letters — they are opaque slots. This file is the only
//     place the naming lives; nothing downstream may re-derive a meaning from a letter.
//
// Template E (Business Landing) is the single-page Starter. Its route semantics inside the canonical
// seven-route public IA are still undecided (plan G4), and it has no design artifact yet (G3A) —
// hence `pageModel` is declared here but no routing behaviour is implied by this module.
import type { LayoutTemplate } from "./types";

export interface TemplateCatalogEntry {
  /** The frozen enum value written to `microsites.layout_template`. */
  template: LayoutTemplate;
  name: string;
  /** One-line use case shown on the picker card. */
  description: string;
  /** Which content this layout foregrounds — presentation guidance, never a capability claim. */
  emphasis: string;
  pageModel: "multi" | "single";
}

/** Frozen DB default (`Doc-6D Pass2:152 … DEFAULT 'A'`). */
export const DEFAULT_LAYOUT_TEMPLATE: LayoutTemplate = "A";

export const TEMPLATE_CATALOG: TemplateCatalogEntry[] = [
  {
    template: "A",
    name: "Corporate Classic",
    description: "Formal and credential-forward.",
    emphasis: "Capabilities, credentials and a balanced overview",
    pageModel: "multi",
  },
  {
    template: "B",
    name: "Modern Industrial",
    description: "Bold split hero, capability-led.",
    emphasis: "Capabilities and services, with strong visual impact",
    pageModel: "multi",
  },
  {
    template: "C",
    name: "Product Catalogue",
    description: "Catalogue-first, for deep product ranges.",
    emphasis: "Products and categories, built for browsing",
    pageModel: "multi",
  },
  {
    template: "D",
    name: "Portfolio & Projects",
    description: "Case-study led; delivered work carries the story.",
    emphasis: "Projects and case studies",
    pageModel: "multi",
  },
  {
    template: "E",
    name: "Business Landing",
    description: "Single-page starter — everything on one scroll.",
    emphasis: "A concise introduction",
    pageModel: "single",
  },
];

/**
 * Look up the catalogue entry for a template letter. **Absence in ⇒ absence out.**
 *
 * This deliberately does NOT fall back to `DEFAULT_LAYOUT_TEMPLATE`. A lookup that always succeeds
 * would name "Corporate Classic" for an unread or unknown letter, and callers render that name as
 * the vendor's own selection — fabricating a choice nobody made. The frozen DB default belongs at
 * the WRITE site, not in a display lookup.
 */
export function templateEntry(template?: LayoutTemplate): TemplateCatalogEntry | undefined {
  if (!template) return undefined;
  return TEMPLATE_CATALOG.find((entry) => entry.template === template);
}
