"use client";

// Comparison Workspace — CLIENT STATE PROVIDER (the single source of truth for the buyer's
// session-local comparison session). Mounted once in the shared `(comparison)` route-group layout
// (`key={rfqId}`) so it persists across BOTH the compare workspace and the comparative-statement
// print route, and across `?sel=` changes — only an `rfqId` change (a parent segment) remounts it.
//
// GOVERNANCE (load-bearing):
//  • PRESENTATION-ONLY / session-local — nothing here is persisted (Wave-4 backend; do NOT coin a
//    contract). The panel copy states this honestly.
//  • Buyer-private — evaluation/purpose/signatory names live in memory only; only
//    `selectedQuotationIds` is ever mirrored to the URL (`?sel=`), never the private fields.
//  • R6 — the buyer AUTHORS every evaluative field; `recommendedQuotationId` is blank by default and
//    is NEVER auto-set from the arithmetic lowest (the recommendation is the buyer's own record).
//  • Evaluation is keyed by OPAQUE quotation id (never index) so deselecting a vendor cleanly drops
//    that vendor's entry (reconcile-on-deselect) without index drift.
//  • Two-stage init: the layout cannot see the leaf `searchParams` or the disclosed set, so the
//    provider mounts UNINITIALIZED and the page-level `ComparisonWorkspaceInitializer` calls the
//    idempotent `initializeWorkspace(...)` once the disclosed set has resolved.

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { CsBuyerEvaluation, CsVendor } from "../comparative-statement/cs-view-models";
import { normalizeSelection } from "./selection";

/** Buyer's per-vendor technical assessment (buyer-authored). `unset` renders as no claim. */
export type VendorCompliance = "unset" | "fully" | "partial" | "non";

export interface VendorEvalEntry {
  compliance: VendorCompliance;
  /** Free-text technical note the buyer records for this vendor. */
  technical?: string;
}

/**
 * The buyer's session-local evaluation, keyed by OPAQUE quotation id (never index — a deselect must
 * drop exactly that vendor's entry). Converted to the index-based `CsBuyerEvaluation` view-model at
 * render time, against the currently-selected vendor list (`toBuyerEvaluation`).
 */
export interface WorkspaceEvaluation {
  executiveSummary: string;
  byQuotation: Record<string, VendorEvalEntry>;
  /** The buyer's own recommendation — blank by default; NEVER auto-filled from arithmetic. */
  recommendedQuotationId?: string;
  /** Reasons for the recommendation, one per line (split + trimmed at conversion). */
  reasons: string;
  risk: string;
  commercialAdvantage: string;
  remarks: string;
}

/** A printed (wet-ink) signatory slot override — name/title only; nothing is captured digitally. */
export interface SignatoryOverride {
  name?: string;
  title?: string;
}

export interface InitializeInput {
  requestedIds: string[];
  disclosedIdsInSystemOrder: string[];
  /** The frozen default selection (≤5, System order) used when `requestedIds` yields < 2 valid ids. */
  defaultSelection: string[];
  /** Seeds `procurementPurpose` on first init only (defaults from the RFQ title/purpose). */
  defaultPurpose: string;
}

export interface ComparisonWorkspaceState {
  didInitialize: boolean;
  selectedQuotationIds: string[];
  evaluation: WorkspaceEvaluation;
  procurementPurpose: string;
  signatoryNames: Record<string, SignatoryOverride>;
  /**
   * True once the buyer has edited any PRIVATE session field (evaluation / purpose / signatory). A
   * quotation SELECTION change never sets this — the selection lives in `?sel=` and survives refresh
   * (§2.11A.7). Cleared by the two reset actions; drives the Unsaved indicator + the leave guard.
   */
  dirty: boolean;
  /** The frozen default selection (System order), captured at init — used by the reset-all action. */
  defaultSelection: string[];
  initializeWorkspace: (input: InitializeInput) => void;
  setSelection: (ids: string[]) => void;
  setEvaluation: (next: Partial<WorkspaceEvaluation>) => void;
  setVendorEval: (quotationId: string, next: Partial<VendorEvalEntry>) => void;
  setRecommended: (quotationId: string | undefined) => void;
  setProcurementPurpose: (value: string) => void;
  setSignatory: (role: string, next: SignatoryOverride) => void;
  /**
   * Reset ONLY the private session edits (evaluation, procurement purpose, signatory overrides) to
   * their initial values; the quotation selection is left unchanged (§2.11A.9). Clears `dirty`.
   */
  resetEdits: () => void;
  /**
   * Build the index-based `CsBuyerEvaluation` for the given selected vendors — the presentation
   * view-model the document renders. Vendors without an entry are omitted; a recommendation whose
   * vendor is no longer selected is dropped (reconcile-on-deselect). Returns `undefined` when the
   * buyer has authored nothing yet, so the surface can fall back to the adapter seed.
   */
  toBuyerEvaluation: (vendors: CsVendor[]) => CsBuyerEvaluation | undefined;
}

const EMPTY_EVALUATION: WorkspaceEvaluation = {
  executiveSummary: "",
  byQuotation: {},
  recommendedQuotationId: undefined,
  reasons: "",
  risk: "",
  commercialAdvantage: "",
  remarks: "",
};

const ComparisonWorkspaceContext = createContext<ComparisonWorkspaceState | null>(null);

export function ComparisonWorkspaceStateProvider({
  rfqId,
  children,
}: {
  // `rfqId` scopes the provider identity (the layout keys it) — kept as a prop for clarity and to
  // make an accidental cross-RFQ reuse obvious in the tree.
  rfqId: string;
  children: ReactNode;
}) {
  void rfqId;
  const [didInitialize, setDidInitialize] = useState(false);
  const [selectedQuotationIds, setSelectedQuotationIds] = useState<string[]>([]);
  const [evaluation, setEvaluationState] = useState<WorkspaceEvaluation>(EMPTY_EVALUATION);
  const [procurementPurpose, setProcurementPurposeState] = useState("");
  const [signatoryNames, setSignatoryNames] = useState<Record<string, SignatoryOverride>>({});
  const [dirty, setDirty] = useState(false);
  // Frozen initial values captured on first init — the reset actions restore exactly these.
  const [defaultSelection, setDefaultSelection] = useState<string[]>([]);
  const [defaultPurpose, setDefaultPurpose] = useState("");
  const initRef = useRef(false);

  const initializeWorkspace = useCallback((input: InitializeInput) => {
    // Idempotent + edit-safe: runs its selection/purpose seeding EXACTLY once. A second call (e.g. a
    // cold deep-link landing on the print route first, then navigating) is a no-op and never resets
    // buyer-authored evaluation/purpose/signatory edits.
    if (initRef.current) return;
    initRef.current = true;
    const initialSelection = normalizeSelection(
      input.requestedIds,
      input.disclosedIdsInSystemOrder,
      input.defaultSelection,
    );
    setSelectedQuotationIds(initialSelection);
    setDefaultSelection(input.defaultSelection);
    setDefaultPurpose(input.defaultPurpose);
    setProcurementPurposeState((prev) => (prev ? prev : input.defaultPurpose));
    setDidInitialize(true);
  }, []);

  const setSelection = useCallback((ids: string[]) => {
    const selected = new Set(ids);
    setSelectedQuotationIds(ids);
    // Reconcile-on-deselect: drop per-vendor entries and any recommendation whose vendor left.
    setEvaluationState((prev) => {
      const byQuotation: Record<string, VendorEvalEntry> = {};
      for (const [qid, entry] of Object.entries(prev.byQuotation)) {
        if (selected.has(qid)) byQuotation[qid] = entry;
      }
      const recommendedQuotationId =
        prev.recommendedQuotationId && selected.has(prev.recommendedQuotationId)
          ? prev.recommendedQuotationId
          : undefined;
      return { ...prev, byQuotation, recommendedQuotationId };
    });
  }, []);

  // Every PRIVATE-field setter marks the session dirty (the Unsaved indicator + leave guard depend on
  // it). Selection changes deliberately do NOT — the selection is URL-backed and survives refresh.
  const setEvaluation = useCallback((next: Partial<WorkspaceEvaluation>) => {
    setEvaluationState((prev) => ({ ...prev, ...next }));
    setDirty(true);
  }, []);

  const setVendorEval = useCallback((quotationId: string, next: Partial<VendorEvalEntry>) => {
    setEvaluationState((prev) => {
      const current = prev.byQuotation[quotationId] ?? { compliance: "unset" as VendorCompliance };
      return {
        ...prev,
        byQuotation: { ...prev.byQuotation, [quotationId]: { ...current, ...next } },
      };
    });
    setDirty(true);
  }, []);

  const setRecommended = useCallback((quotationId: string | undefined) => {
    setEvaluationState((prev) => ({ ...prev, recommendedQuotationId: quotationId }));
    setDirty(true);
  }, []);

  const setProcurementPurpose = useCallback((value: string) => {
    setProcurementPurposeState(value);
    setDirty(true);
  }, []);

  const setSignatory = useCallback((role: string, next: SignatoryOverride) => {
    setSignatoryNames((prev) => ({ ...prev, [role]: { ...prev[role], ...next } }));
    setDirty(true);
  }, []);

  const resetEdits = useCallback(() => {
    // Edits only — the selection is untouched (§2.11A.9). Restores the initial session-local values.
    setEvaluationState(EMPTY_EVALUATION);
    setProcurementPurposeState(defaultPurpose);
    setSignatoryNames({});
    setDirty(false);
  }, [defaultPurpose]);

  const toBuyerEvaluation = useCallback(
    (vendors: CsVendor[]): CsBuyerEvaluation | undefined => {
      const hasVendorNotes = vendors.some((v) => {
        const entry = evaluation.byQuotation[v.quotationId];
        return entry && (entry.compliance !== "unset" || (entry.technical ?? "").trim().length > 0);
      });
      const recommendedVendorIdx = evaluation.recommendedQuotationId
        ? vendors.findIndex((v) => v.quotationId === evaluation.recommendedQuotationId)
        : -1;
      const reasonsList = evaluation.reasons
        .split("\n")
        .map((r) => r.trim())
        .filter((r) => r.length > 0);
      const authored =
        evaluation.executiveSummary.trim().length > 0 ||
        hasVendorNotes ||
        recommendedVendorIdx >= 0 ||
        reasonsList.length > 0 ||
        evaluation.risk.trim().length > 0 ||
        evaluation.commercialAdvantage.trim().length > 0 ||
        evaluation.remarks.trim().length > 0;
      if (!authored) return undefined;

      const evaluationOrder = vendors.map((v, idx) => ({
        vendorIdx: idx,
        technical: evaluation.byQuotation[v.quotationId]?.technical || undefined,
      }));

      let fully = 0;
      let partial = 0;
      let non = 0;
      let anyCompliance = false;
      for (const v of vendors) {
        const c = evaluation.byQuotation[v.quotationId]?.compliance ?? "unset";
        if (c === "fully") {
          fully += 1;
          anyCompliance = true;
        } else if (c === "partial") {
          partial += 1;
          anyCompliance = true;
        } else if (c === "non") {
          non += 1;
          anyCompliance = true;
        }
      }

      return {
        buyerAuthored: true,
        executiveSummary: evaluation.executiveSummary.trim() || undefined,
        evaluationOrder,
        technicalSummary: anyCompliance
          ? { fullyCompliant: fully, partiallyCompliant: partial, nonCompliant: non }
          : undefined,
        recommendedVendorIdx: recommendedVendorIdx >= 0 ? recommendedVendorIdx : undefined,
        reasons: reasonsList.length ? reasonsList : undefined,
        risk: evaluation.risk.trim() || undefined,
        commercialAdvantage: evaluation.commercialAdvantage.trim() || undefined,
        remarks: evaluation.remarks.trim() || undefined,
      };
    },
    [evaluation],
  );

  const value = useMemo<ComparisonWorkspaceState>(
    () => ({
      didInitialize,
      selectedQuotationIds,
      evaluation,
      procurementPurpose,
      signatoryNames,
      dirty,
      defaultSelection,
      initializeWorkspace,
      setSelection,
      setEvaluation,
      setVendorEval,
      setRecommended,
      setProcurementPurpose,
      setSignatory,
      resetEdits,
      toBuyerEvaluation,
    }),
    [
      didInitialize,
      selectedQuotationIds,
      evaluation,
      procurementPurpose,
      signatoryNames,
      dirty,
      defaultSelection,
      initializeWorkspace,
      setSelection,
      setEvaluation,
      setVendorEval,
      setRecommended,
      setProcurementPurpose,
      setSignatory,
      resetEdits,
      toBuyerEvaluation,
    ],
  );

  return (
    <ComparisonWorkspaceContext.Provider value={value}>
      {children}
    </ComparisonWorkspaceContext.Provider>
  );
}

export function useComparisonWorkspace(): ComparisonWorkspaceState {
  const ctx = useContext(ComparisonWorkspaceContext);
  if (!ctx) {
    throw new Error(
      "useComparisonWorkspace must be used within a ComparisonWorkspaceStateProvider (the (comparison) route-group layout).",
    );
  }
  return ctx;
}
