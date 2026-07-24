// My Vendor Directory — "Paste multiple vendors" (owner directive D3). PRESENTATION-ONLY pure logic.
//
// CLIPBOARD PASTE IS NOT BULK IMPORT (D3 / Review-A MAJOR-2). Parsing, column mapping, per-row
// validation, duplicate/marketplace-match detection and preview are all CLIENT-SIDE presentation. On
// confirm, each ELIGIBLE row would create a record through the frozen single-create
// `ops.create_private_vendor.v1` with `source = "excel"` (the frozen enum value, Doc-4F §F4.1 / Doc-2
// §10.5) — one record at a time. NO atomicity, batch semantics, or import-job behaviour is claimed or
// coined. Dedicated batch create, file upload, Word/PDF extraction, import history and bulk export
// stay GATED under `ESC-VENDIR-FIELDS` (R5). Any row cap is a presentation safeguard, not a contract
// limit. Buyer-private throughout (Inv #11).

import { suggestCategory, type CategoryConfidence } from "./offerings";

/** Fields a pasted column can map to. `category` routes to the category matcher (never a silent bind, D3). */
export type PasteFieldKey =
  | "ignore"
  | "company"
  | "contact"
  | "phone"
  | "email"
  | "category"
  | "location"
  | "notes";

/** Governance class of a mapped field (drives the mapper tags, D3 column-classes). */
export type PasteFieldClass = "frozen" | "gated" | "category";

export interface PasteField {
  key: PasteFieldKey;
  label: string;
  /** Absent for `ignore`. `frozen` = a real create column; `gated` = `details_jsonb` R5; `category` = matcher. */
  fieldClass?: PasteFieldClass;
}

/**
 * The mappable target fields. Only `company`/`phone`/`email` are FROZEN create columns
 * (`ops.create_private_vendor.v1`); the rest are `details_jsonb`-interim (R5) or route to the category
 * matcher. NEVER-IMPORTABLE fields (verification, trust/performance scores, profile ownership, public
 * content) are deliberately absent — the buyer cannot assert them (D3).
 */
export const PASTE_FIELDS: readonly PasteField[] = [
  { key: "ignore", label: "— Ignore —" },
  { key: "company", label: "Company name", fieldClass: "frozen" },
  { key: "contact", label: "Contact person", fieldClass: "gated" },
  { key: "phone", label: "Phone", fieldClass: "frozen" },
  { key: "email", label: "Email", fieldClass: "frozen" },
  { key: "category", label: "Core business / category", fieldClass: "category" },
  { key: "location", label: "City / district", fieldClass: "gated" },
  { key: "notes", label: "Internal notes", fieldClass: "gated" },
];

/** A parsed table: the header/labels + the data rows (tab- or comma-separated cells). */
export interface ParsedTable {
  columns: string[];
  rows: string[][];
}

/**
 * Parse clipboard content into a table. Accepts TAB-separated (the default when copying from Excel /
 * Google Sheets / a Word table) and comma-separated text. Entirely in-browser — no file, no upload.
 */
export function parseClipboardTable(raw: string, hasHeader: boolean): ParsedTable {
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter((line) => line.trim().length > 0);
  if (lines.length === 0) return { columns: [], rows: [] };
  const delimiter = lines[0].includes("\t") ? "\t" : ",";
  const matrix = lines.map((line) => line.split(delimiter).map((cell) => cell.trim()));
  if (hasHeader) {
    return { columns: matrix[0], rows: matrix.slice(1) };
  }
  return { columns: matrix[0].map((_, index) => `Column ${index + 1}`), rows: matrix };
}

/** Suggest a field mapping per column from its header text (the buyer can override every one, D3). */
export function autoMapColumns(columns: readonly string[]): PasteFieldKey[] {
  return columns.map((header) => {
    const text = header.toLowerCase();
    if (/(compan|vendor|firm|supplier|name)/.test(text) && !/contact/.test(text)) return "company";
    if (/(contact|person|attn)/.test(text)) return "contact";
    if (/(phone|mobile|cell|tel)/.test(text)) return "phone";
    if (/mail/.test(text)) return "email";
    if (/(categ|business|trade|product|service)/.test(text)) return "category";
    if (/(city|district|location|address|area|zone)/.test(text)) return "location";
    if (/(note|remark|comment)/.test(text)) return "notes";
    return "ignore";
  });
}

/** One deterministic row state (D3 UX-4 — exactly one per row, priority-ordered). */
export type PasteRowState =
  | "ready"
  | "needs_category"
  | "possible_duplicate"
  | "missing_required"
  | "blocked"
  | "skipped";

export const PASTE_ROW_STATE_LABEL: Record<PasteRowState, string> = {
  ready: "Ready",
  needs_category: "Needs category review",
  possible_duplicate: "Possible duplicate",
  missing_required: "Missing required information",
  blocked: "Blocked",
  skipped: "Skipped",
};

/** A possible-duplicate match surfaced during validation (advisory only; the buyer decides, D3). */
export interface PasteDuplicate {
  kind: "directory" | "marketplace";
  name: string;
}

/** One pasted vendor row through mapping + validation + resolution. Mutated in the review grid (client). */
export interface PasteRow {
  id: string;
  company: string;
  contact: string;
  phone: string;
  email: string;
  categoryText: string;
  location: string;
  notes: string;
  /** Suggested category (never auto-bound). */
  categorySuggestion?: string;
  categoryConfidence: CategoryConfidence;
  /** Buyer-confirmed category id (prototype-only — never persisted in M4). */
  categoryId?: string;
  categoryConfirmed: boolean;
  categoryTextOnly: boolean;
  /** Advisory duplicate/marketplace match. */
  duplicate?: PasteDuplicate;
  /** Buyer resolved the duplicate (use existing / link / create-separate-acknowledged). */
  duplicateResolved: boolean;
  /** Buyer linked this row to a marketplace profile — only then may it be marked Preferred (D1(a)). */
  linked: boolean;
  preferred: boolean;
  skipped: boolean;
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
export const isValidEmail = (email: string): boolean => EMAIL_RE.test(email);

/**
 * Build review rows from the parsed table + column mapping, attaching category suggestions and
 * advisory duplicate/marketplace matches. `existingNames` are the buyer's own directory vendors;
 * `marketplaceNames` are unlinked marketplace vendors — both drive the "possible duplicate" advisory
 * (nothing is auto-merged, D3 UX-6). First-token matching keeps the advisory conservative.
 */
export function buildPasteRows(
  table: ParsedTable,
  mapping: readonly PasteFieldKey[],
  corpus: { existingNames: readonly string[]; marketplaceNames: readonly string[] },
): PasteRow[] {
  const existing = corpus.existingNames.map((name) => name.toLowerCase());
  const marketplace = corpus.marketplaceNames.map((name) => name.toLowerCase());

  return table.rows.map((cells, index) => {
    const values: Record<string, string> = {};
    mapping.forEach((field, columnIndex) => {
      if (field === "ignore") return;
      const key = field === "category" ? "categoryText" : field;
      values[key] = cells[columnIndex] ?? "";
    });

    const company = values.company ?? "";
    const categoryText = values.categoryText ?? "";
    const suggestion = categoryText ? suggestCategory(categoryText) : undefined;

    let duplicate: PasteDuplicate | undefined;
    const name = company.trim().toLowerCase();
    if (name.length > 0) {
      const firstToken = name.split(/\s+/)[0];
      const hitDirectory =
        firstToken.length > 3 &&
        existing.some((existingName) => existingName.startsWith(firstToken));
      const hitMarketplace =
        firstToken.length > 3 &&
        marketplace.some((marketplaceName) => marketplaceName.includes(firstToken));
      if (hitDirectory) {
        duplicate = {
          kind: "directory",
          name: corpus.existingNames.find((n) => n.toLowerCase().startsWith(firstToken)) ?? company,
        };
      } else if (hitMarketplace) {
        duplicate = {
          kind: "marketplace",
          name:
            corpus.marketplaceNames.find((n) => n.toLowerCase().includes(firstToken)) ?? company,
        };
      }
    }

    return {
      id: `paste_${index}`,
      company,
      contact: values.contact ?? "",
      phone: values.phone ?? "",
      email: values.email ?? "",
      categoryText,
      location: values.location ?? "",
      notes: values.notes ?? "",
      categorySuggestion: suggestion?.categoryId,
      categoryConfidence: suggestion?.confidence ?? "none",
      categoryConfirmed: false,
      categoryTextOnly: false,
      duplicate,
      duplicateResolved: false,
      linked: false,
      preferred: false,
      skipped: false,
    };
  });
}

/**
 * The single deterministic state of a row (D3 UX-4). Priority: skipped → missing name → invalid email
 * → unresolved duplicate → unconfirmed category → ready. A confirmed system category is required for
 * `ready` (owner directive D5 — text-only never satisfies it).
 */
export function pasteRowState(row: PasteRow): PasteRowState {
  if (row.skipped) return "skipped";
  if (!row.company.trim()) return "missing_required";
  if (row.email && !isValidEmail(row.email)) return "blocked";
  if (row.duplicate && !row.duplicateResolved) return "possible_duplicate";
  if (!row.categoryConfirmed || !row.categoryId) return "needs_category";
  return "ready";
}

/** Rows that would be created on confirm — only `ready` rows (partial-batch save, D3 UX-5). */
export function eligiblePasteRows(rows: readonly PasteRow[]): PasteRow[] {
  return rows.filter((row) => pasteRowState(row) === "ready");
}

/** Count rows by state for the preview summary (D3 UX-5). */
export function summarizePasteRows(rows: readonly PasteRow[]): Record<PasteRowState, number> {
  const counts: Record<PasteRowState, number> = {
    ready: 0,
    needs_category: 0,
    possible_duplicate: 0,
    missing_required: 0,
    blocked: 0,
    skipped: 0,
  };
  for (const row of rows) counts[pasteRowState(row)] += 1;
  return counts;
}

/**
 * Group unconfirmed rows by their entered category text so identical items can be resolved together
 * (D3 UX-2 "apply category to N matching items"). Only groups of 2+ with a confident suggestion.
 */
export function batchCategoryGroups(
  rows: readonly PasteRow[],
): { categoryId: string; rowIds: string[]; sampleText: string }[] {
  const byText = new Map<string, PasteRow[]>();
  for (const row of rows) {
    if (row.skipped || row.categoryConfirmed || !row.categoryText) continue;
    const key = row.categoryText.toLowerCase();
    const bucket = byText.get(key) ?? [];
    bucket.push(row);
    byText.set(key, bucket);
  }
  const groups: { categoryId: string; rowIds: string[]; sampleText: string }[] = [];
  for (const bucket of byText.values()) {
    if (bucket.length < 2) continue;
    const suggestion = suggestCategory(bucket[0].categoryText);
    if (!suggestion.categoryId) continue;
    groups.push({
      categoryId: suggestion.categoryId,
      rowIds: bucket.map((row) => row.id),
      sampleText: bucket[0].categoryText,
    });
  }
  return groups;
}
