// Comparison Workspace — selection normalization (PURE, shared by the SERVER page and the CLIENT
// provider so both derive the exact same 2–5 vendor set from the same `?sel=` + disclosed set). No
// "use client" — this must be importable from a Server Component.
//
// The 2–5 selection is the frozen W-1 CS vendor set consumed by `get_comparison_statement`
// (`getComparativeStatement(rfqId, selectedQuotationIds)`); it is ephemeral and never persisted.

export const MIN_COMPARE = 2;
export const MAX_COMPARE = 5;

/** Parse the raw `?sel=` searchParam (string | string[] | undefined) into an id list. */
export function parseSelParam(sel: string | string[] | undefined): string[] {
  if (sel === undefined) return [];
  return Array.isArray(sel) ? sel : [sel];
}

/** The frozen default selection: the first `MAX_COMPARE` disclosed quotations, in System order. */
export function defaultSelection(disclosedIdsInSystemOrder: string[]): string[] {
  return disclosedIdsInSystemOrder.slice(0, MAX_COMPARE);
}

/**
 * Normalize a requested selection against the disclosed set: drop unknown/duplicate ids, restore
 * System order, cap at `MAX_COMPARE`, and fall back to `fallback` when fewer than `MIN_COMPARE` valid
 * ids remain. Deterministic — the server and the client always agree on the displayed subset.
 */
export function normalizeSelection(
  requested: string[],
  disclosedIdsInSystemOrder: string[],
  fallback: string[],
): string[] {
  const disclosed = new Set(disclosedIdsInSystemOrder);
  const requestedValid = new Set(requested.filter((id) => disclosed.has(id)));
  const ordered = disclosedIdsInSystemOrder.filter((id) => requestedValid.has(id));
  const capped = ordered.slice(0, MAX_COMPARE);
  if (capped.length < MIN_COMPARE) return fallback.slice(0, MAX_COMPARE);
  return capped;
}
