// Platform shell — Hybrid nav COMPOSITION helper ([ESC-7G-A7] realization; Doc-7A R6 / Doc-7C SR3
// "Hybrid mounts both"). PRESENTATION-ONLY, App-Shell-owned config — NOT an Identity-domain artifact;
// never import into backend modules or Identity services.
//
// Boundary (the load-bearing rule): *which* surface groups mount, and their tagging / ordering /
// Trust-isolation, are resolved by the SEAM (Identity/context layer, SR3 — or the demo seed standing
// in for it). This module only CONCATENATES the already-resolved groups and renders. It performs NO
// authorization, participation check, leaf classification, or dedup beyond the fail-loud safety net
// below. Identity/seam validates·selects·tags·orders; presentation concatenates·renders.
//
// Ordering is honored BY POSITION — the seam supplies segments in the fixed order (role groups first
// — Buying, then Selling — then Trust always TERMINAL). `composeNav` never sorts or classifies.
import type { NavSection } from "./types";

/** A structural clone so a composed result never aliases (or lets a caller mutate) `BUYER_NAV` /
 *  `VENDOR_NAV`. All nav data is plain/serializable, so a shallow spread per level suffices. */
function cloneSection(section: NavSection): NavSection {
  return {
    ...section,
    items: section.items.map((item) => ({
      ...item,
      children: item.children ? item.children.map((child) => ({ ...child })) : undefined,
    })),
  };
}

/** Rendered group HEADERS whose text must be unique so the sidebar is unambiguous and the accordion
 *  (keyed on a children-bearing item's `label`) never opens two groups at once. Two kinds:
 *  labeled sections, and children-bearing items (`NavGroup`). Duplicate LEAF labels under DISTINCT
 *  labeled sections are allowed (e.g. `Buying › Dashboard` + `Selling › Dashboard`). */
function duplicateGroupLabels(sections: readonly NavSection[]): {
  sectionDupes: string[];
  groupDupes: string[];
} {
  const seenSections = new Set<string>();
  const seenGroups = new Set<string>();
  const sectionDupes: string[] = [];
  const groupDupes: string[] = [];
  for (const section of sections) {
    if (section.label) {
      if (seenSections.has(section.label)) sectionDupes.push(section.label);
      seenSections.add(section.label);
    }
    for (const item of section.items) {
      if (item.children && item.children.length > 0) {
        if (seenGroups.has(item.label)) groupDupes.push(item.label);
        seenGroups.add(item.label);
      }
    }
  }
  return { sectionDupes, groupDupes };
}

/** Drop sections/groups whose header label already appeared (keep-first) — the PRODUCTION safe
 *  fallback only; the normal path performs no dedup (a clean seam never hits this). */
function dropDuplicateGroups(sections: readonly NavSection[]): NavSection[] {
  const seenSections = new Set<string>();
  const seenGroups = new Set<string>();
  const out: NavSection[] = [];
  for (const section of sections) {
    if (section.label && seenSections.has(section.label)) continue;
    if (section.label) seenSections.add(section.label);
    const items = section.items.filter((item) => {
      if (!item.children || item.children.length === 0) return true;
      if (seenGroups.has(item.label)) return false;
      seenGroups.add(item.label);
      return true;
    });
    out.push({ ...section, items });
  }
  return out;
}

/**
 * Concatenate the seam-resolved nav segments (already selected, labeled, and ordered) into the single
 * `NavSection[]` the shell renders. Deterministic and side-effect free — never mutates its inputs and
 * always returns a freshly cloned structure (SSR/cache-safe).
 *
 * Input contract: each segment is a valid, seam-produced `NavSection[]`; segments arrive in the
 * intended visual order (Buying, Selling, Trust). `composeNav` trusts that selection/authz already
 * happened upstream.
 *
 * Fail-loud on a duplicate group header (a seam bug): DEV throws so the defect is immediately visible;
 * PRODUCTION reports via `console.error` and renders a de-duplicated safe fallback (never a silent
 * duplicate, never a crash).
 */
export function composeNav(...segments: ReadonlyArray<readonly NavSection[]>): NavSection[] {
  const composed = segments.flatMap((segment) => segment.map(cloneSection));

  const { sectionDupes, groupDupes } = duplicateGroupLabels(composed);
  if (sectionDupes.length > 0 || groupDupes.length > 0) {
    const detail = [
      sectionDupes.length ? `section label(s): ${sectionDupes.join(", ")}` : null,
      groupDupes.length ? `group label(s): ${groupDupes.join(", ")}` : null,
    ]
      .filter(Boolean)
      .join("; ");
    const message = `composeNav: duplicate nav group header(s) — ${detail}. The seam must disambiguate (label or dedupe) before composing.`;
    if (process.env.NODE_ENV !== "production") {
      throw new Error(message);
    }
    console.error(message);
    return dropDuplicateGroups(composed);
  }

  return composed;
}
