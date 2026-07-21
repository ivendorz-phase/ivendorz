// Canonical vendor-profile template catalogue — the name↔letter binding for the FROZEN
// `marketplace.microsites.layout_template` enum (A–E). Verified anchors:
// `Doc-2 §10.3` (`Doc-2_Domain_Model_And_Database_Blueprint_v1.0.2.md:744`),
// `Doc-4D_Content_v1.0_PassB_ProfileExperience.md:18` (`enum(A|B|C|D|E) : required` on create),
// `Doc-6D_Content_v1.0_Pass2.md:146` (`CREATE TYPE`), with `DEFAULT 'A'` at `Pass2:152`.
// (Corrected 2026-07-21, G3 Review-A findings A1/A2: the earlier "Doc-4D PassB:18" pointed at a
// horizontal rule in a part-file MANIFEST that contains no `layout_template`, and "§10.744" was a
// malformed hybrid of a section number and a line number.)
//
// 🛑 GOVERNANCE STATUS: **G3 BLOCKED — the G3 mint proposal was REJECTED FOR FOLD (owner/Board,
// 2026-07-21, on Review-B).** Production therefore renders NEUTRAL labels `Template A`…`Template E`.
//
// WHY, and the correction this file carries:
//
// A previous version of this header stated "the corpus attaches NO semantics to the letters — they
// are opaque slots." **That was FALSE and is removed.** The frozen corpus already binds a name AND
// behaviour to every letter:
//
//   `Master_System_Architecture_v1.0_FINAL.md:569` (rank 0, CANONICAL) and
//   `ADR_Compendium_v1.md:1008` (rank 1, ADR-020):
//     "Layout Templates — predefined structures: A Directory Style · B Engineering Company ·
//      C Manufacturer · D Service Company · E Corporate Microsite. Each defines hero, section,
//      and contact ordering."
//
// Both stand unamended. The owner-proposed names (Corporate Classic / Modern Industrial / Product
// Catalogue / Portfolio & Projects / Business Landing) would therefore be a REMAP of rank-0 and
// rank-1 text, not an additive naming register — so they must not render as production semantics
// until an additive Master §8.4 patch + an ADR-020 amendment are approved by the human Board.
// That amendment packet is drafted at
// `governanceReviews/G3_TemplateSemantics_Amendment_Packet_v1.0_PROPOSAL.md`.
//
// The escaped-detection lesson, recorded so it does not recur: every sweep that "verified" the
// letters were opaque searched the identifier `layout_template` (5 corpus hits, all DDL/contract).
// Ranks 0 and 1 write in PROSE — "Layout Templates … A Directory Style" contains no such token, so
// no identifier-scoped grep could ever reach it. Semantic review of an enum must search identifier
// names, literal values, human-readable prose names, rank-0/rank-1 sources, and amendment records.
//
// STILL TRUE and unaffected by the block: the vendor's choice is never mutated for them, business
// type never restricts which templates are offered, and section emphasis lives in `profile_sections`
// (`display_order`/`is_visible`), never in template identity. Entitlement-based availability
// (`template_access_level`, frozen) is a separate matter and is NOT denied here.
//
// GENUINE NEUTRALITY (owner directive 2026-07-21). Renaming only the visible label was NOT enough:
// the per-template `description`, `emphasis` and `pageModel` fields still encoded the blocked
// mapping under neutral titles ("Catalogue-first…" = Product Catalogue, "Case-study led…" =
// Portfolio & Projects, "Single-page starter…" + pageModel:"single" = Business Landing) — and they
// simultaneously contradicted the FROZEN semantics (A Directory Style · B Engineering Company ·
// C Manufacturer · D Service Company · E Corporate Microsite, "each defines hero, section, and
// contact ordering"). Production may only follow the frozen semantics or be genuinely neutral; it
// is now genuinely neutral. Those fields are REMOVED, not merely reworded. The owner-proposed
// visual implementations live in `prototypes/` only, under the required label.
//
// Nothing here declares a page model. G4 owns single-page and canonical-route semantics; G3A (no
// Business Landing design artifact) is likewise still open.
import type { LayoutTemplate } from "./types";

export interface TemplateCatalogEntry {
  /** The frozen enum value written to `microsites.layout_template`. */
  template: LayoutTemplate;
  /** NEUTRAL label only — `Template A`…`Template E`. See the GENUINE NEUTRALITY note above. */
  name: string;
}

/** Frozen DB default (`Doc-6D Pass2:152 … DEFAULT 'A'`). */
export const DEFAULT_LAYOUT_TEMPLATE: LayoutTemplate = "A";

export const TEMPLATE_CATALOG: TemplateCatalogEntry[] = [
  { template: "A", name: "Template A" },
  { template: "B", name: "Template B" },
  { template: "C", name: "Template C" },
  { template: "D", name: "Template D" },
  { template: "E", name: "Template E" },
];

/**
 * Look up the catalogue entry for a template letter. **Absence in ⇒ absence out.**
 *
 * This deliberately does NOT fall back to `DEFAULT_LAYOUT_TEMPLATE`. A lookup that always succeeds
 * would label an unread or unknown letter as "Template A", and callers render that as the vendor's
 * own selection — fabricating a choice nobody made. The frozen DB default (`DEFAULT 'A'`) is a
 * STORAGE safeguard that belongs at the WRITE site, never in a display lookup.
 */
export function templateEntry(template?: LayoutTemplate): TemplateCatalogEntry | undefined {
  if (!template) return undefined;
  return TEMPLATE_CATALOG.find((entry) => entry.template === template);
}
