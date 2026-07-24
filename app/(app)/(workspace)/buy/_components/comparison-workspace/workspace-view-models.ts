// Comparison Workspace — presentation view-model assembly (PURE; server-usable). Maps the two
// EXISTING adapter reads onto the workspace's region shape and COINS NOTHING: it pointer-maps
// `ComparisonData` (descriptive, the tray + matrix attributes) and `ComparativeStatementData`
// (arithmetic subset — line items, computed totals, letterhead, approval roles). No arithmetic is
// computed here (R7 — the adapter/server owns it); this file only slices and aligns.

import type { ComparisonData, ComparisonSupplier } from "@/frontend/components/comparison";
import type { ComparativeStatementData } from "../comparative-statement/cs-view-models";
import { defaultSelection } from "./selection";

export interface ComparisonWorkspaceData {
  rfqId: string;
  humanRef?: string;
  rfqTitle: string;
  currency: string;
  project?: string;
  deliveryLocation?: string;
  issueDate: string;
  /** Mock-era reference (owner MAJOR-2/MINOR-1) — "Draft Reference"; no `CS-` series until ESC-CS-REF. */
  draftReference: string;
  /** Full disclosed set (System order) — the tray source. */
  traySuppliers: ComparisonSupplier[];
  /** The server-normalized selected subset of the descriptive suppliers (matrix region ③). */
  selectedSuppliers: ComparisonSupplier[];
  /** The arithmetic subset (line items, computed totals, letterhead, approval roles) — regions ④/⑥. */
  statement: ComparativeStatementData;
  /** Server-normalized selected ids (System order) — the tray's initial checked set. */
  selectedIds: string[];
  /** Disclosed ids in System order — initializer input. */
  disclosedIds: string[];
  /** Frozen default selection — initializer input. */
  defaultSelection: string[];
  /** Default procurement purpose (RFQ title) — initializer seeds this on first init only. */
  defaultPurpose: string;
}

/**
 * Assemble the workspace view-model from the two resolved reads and the server-normalized selection.
 * `selectedIds` is computed by the page via `normalizeSelection` (the same pure function the client
 * provider uses), so the displayed subset always matches its server-computed arithmetic.
 */
export function buildWorkspaceData(
  rfqId: string,
  comparison: ComparisonData,
  statement: ComparativeStatementData,
  selectedIds: string[],
): ComparisonWorkspaceData {
  const disclosedIds = comparison.suppliers.map((s) => s.quotationId);
  const selectedSet = new Set(selectedIds);
  const selectedSuppliers = comparison.suppliers.filter((s) => selectedSet.has(s.quotationId));
  return {
    rfqId,
    humanRef: statement.humanRef ?? comparison.humanRef,
    rfqTitle: statement.rfqTitle,
    currency: statement.currency,
    project: statement.project,
    deliveryLocation: statement.deliveryLocation,
    issueDate: statement.issueDate,
    draftReference: statement.draftReference,
    traySuppliers: comparison.suppliers,
    selectedSuppliers,
    statement,
    selectedIds,
    disclosedIds,
    defaultSelection: defaultSelection(disclosedIds),
    defaultPurpose: statement.rfqTitle,
  };
}

/** The idempotent-initializer payload (shared by both leaf routes). `requestedIds` = the server-
 *  normalized selection, so the client reconcile is an identity op and the two never disagree. */
export function toInitializeInput(data: ComparisonWorkspaceData) {
  return {
    requestedIds: data.selectedIds,
    disclosedIdsInSystemOrder: data.disclosedIds,
    defaultSelection: data.defaultSelection,
    defaultPurpose: data.defaultPurpose,
  };
}
