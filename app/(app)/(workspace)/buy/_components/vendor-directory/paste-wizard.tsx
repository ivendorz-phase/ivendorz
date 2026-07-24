"use client";

// My Vendor Directory — "Paste multiple vendors" wizard (owner directive D3). PRESENTATION-ONLY.
//
// Clipboard paste is NOT bulk import (Review-A MAJOR-2). Parse → map → validate/resolve → preview are
// all client-side; on confirm, each ELIGIBLE row would create a record via the frozen single-create
// `ops.create_private_vendor.v1` (`source = "excel"`). No batch/atomicity/import-job semantics are
// claimed. Category matching is presentation-only (no M2 id persisted, D5). Unresolved rows stay for
// correction (partial-batch save). ⭐ Preferred is offered only on a row LINKED to a marketplace
// profile (D1(a)). Persistence is PARKED — creating updates local working state.

import * as React from "react";
import { Info } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { Badge } from "@/frontend/primitives/badge";
import { Card, CardContent } from "@/frontend/primitives/card";
import { StatusChip, type StatusTone } from "@/frontend/components/status-chip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/frontend/primitives/dialog";
import { cn } from "@/frontend/lib/cn";
import { CategoryMatcherDialog } from "./category-matcher-dialog";
import { categoryName } from "./offerings";
import {
  autoMapColumns,
  batchCategoryGroups,
  buildPasteRows,
  eligiblePasteRows,
  parseClipboardTable,
  PASTE_FIELDS,
  PASTE_ROW_STATE_LABEL,
  pasteRowState,
  summarizePasteRows,
  type PasteFieldClass,
  type PasteFieldKey,
  type PasteRow,
  type PasteRowState,
} from "./paste-import";

const SAMPLE = [
  "Company Name\tContact Person\tPhone\tEmail\tCategory\tLocation\tNotes",
  "Karnaphuli Traders\tRahim Ahmed\t01711000000\tsales@karnaphuli.example\tSS tank fabrication\tDhaka\tSS tank supplier",
  "Padma Automation\tKarim Hasan\t01822000000\tinfo@padma-auto.example\tSwitchgear panels\tGazipur\tpanels & drives",
  "Zenith Pumps Co\tSohel Rana\t01733000000\tsohel@zenith.example\tCentrifugal pumps\tDhaka\tpump supplier",
  "Delta Pumps Ltd\tNadia Islam\t01744000000\tnadia@delta.example\tCentrifugal pumps\tBogura\tpump supplier",
  "Meghna Pumps\tRezaul\t01711000000\tservice@meghnapumps.example\tCentrifugal pumps\tNarayanganj\tlikely already listed",
  "Titas Fabrication Works\tJamil Uddin\t01900000000\tworkshop@titasfab.example\tFabrication\tGazipur\ton the marketplace",
  "Custom Works\tabdul\t\tbad-email-here\tGeneric machining\tSavar\tinvalid email + unclear category",
  "\tNo-Name Traders\t01555000000\tnn@x.example\tValves\tKhulna\tno company name",
].join("\n");

const FIELD_CLASS_LABEL: Record<PasteFieldClass, string> = {
  frozen: "FROZEN",
  gated: "GATED-R5",
  category: "CATEGORY",
};
const FIELD_CLASS_VARIANT: Record<PasteFieldClass, "success" | "warning" | "brand"> = {
  frozen: "success",
  gated: "warning",
  category: "brand",
};
const STATE_TONE: Record<PasteRowState, StatusTone> = {
  ready: "success",
  needs_category: "warning",
  possible_duplicate: "info",
  missing_required: "danger",
  blocked: "danger",
  skipped: "neutral",
};

const STEPS = ["Paste", "Map columns", "Validate & resolve", "Preview & confirm"];

export interface PasteWizardProps {
  corpus: { existingNames: string[]; marketplaceNames: string[] };
  onConfirm: (rows: PasteRow[]) => void;
  onCancel: () => void;
}

export function PasteWizard({ corpus, onConfirm, onCancel }: PasteWizardProps) {
  const [step, setStep] = React.useState(1);
  const [rawText, setRawText] = React.useState("");
  const [hasHeader, setHasHeader] = React.useState(true);
  const [columns, setColumns] = React.useState<string[]>([]);
  const [sampleRow, setSampleRow] = React.useState<string[]>([]);
  const [mapping, setMapping] = React.useState<PasteFieldKey[]>([]);
  const [parsedRows, setParsedRows] = React.useState<string[][]>([]);
  const [rows, setRows] = React.useState<PasteRow[]>([]);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [matcherFor, setMatcherFor] = React.useState<string | null>(null);
  const [ackFor, setAckFor] = React.useState<string | null>(null);

  function parse() {
    const table = parseClipboardTable(rawText, hasHeader);
    if (table.rows.length === 0) return;
    setColumns(table.columns);
    setParsedRows(table.rows);
    setSampleRow(table.rows[0] ?? []);
    setMapping(autoMapColumns(table.columns));
    setStep(2);
  }

  function validate() {
    if (!mapping.includes("company")) return;
    const built = buildPasteRows({ columns, rows: parsedRows }, mapping, corpus);
    setRows(built);
    const firstUnresolved = built.find((row) => !["ready", "skipped"].includes(pasteRowState(row)));
    setSelectedId(firstUnresolved?.id ?? built[0]?.id ?? null);
    setStep(3);
  }

  function updateRow(id: string, patch: Partial<PasteRow>) {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }

  const selectedRow = rows.find((row) => row.id === selectedId) ?? null;
  const matcherRow = rows.find((row) => row.id === matcherFor) ?? null;
  const batchGroups = batchCategoryGroups(rows);
  const counts = summarizePasteRows(rows);
  const eligible = eligiblePasteRows(rows);

  return (
    <div className="flex flex-col gap-5">
      <p className="flex items-start gap-1.5 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
        <Info aria-hidden className="mt-0.5 size-3.5 shrink-0" />
        Clipboard paste is not bulk import. Parsing, mapping, validation and preview are
        client-side. On confirm, each eligible row is created through the single-create{" "}
        <code className="rounded bg-card px-1">ops.create_private_vendor.v1</code> (source = excel)
        — no batch semantics. File upload, extraction, import history and bulk export stay gated
        (ESC-VENDIR-FIELDS R5).
      </p>

      {/* Step indicator */}
      <ol className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        {STEPS.map((label, index) => {
          const stepNumber = index + 1;
          const active = step === stepNumber;
          const done = step > stepNumber;
          return (
            <li key={label} className="flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex size-6 items-center justify-center rounded-full text-xs font-bold",
                  active
                    ? "bg-iv-navy-600 text-white"
                    : done
                      ? "bg-iv-success-base text-white"
                      : "bg-muted text-muted-foreground",
                )}
              >
                {stepNumber}
              </span>
              <span
                className={cn("font-medium", active ? "text-iv-navy-700" : "text-muted-foreground")}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>

      {/* Step 1 — Paste */}
      {step === 1 ? (
        <div className="flex flex-col gap-3">
          <textarea
            value={rawText}
            onChange={(event) => setRawText(event.target.value)}
            rows={8}
            aria-label="Paste vendor rows"
            placeholder="Paste rows — tab-separated (Excel / Sheets / Word) or comma-separated. Include a header row if you have one."
            className="w-full rounded-md border border-border bg-card p-3 font-mono text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" variant="outline" size="sm" onClick={() => setRawText(SAMPLE)}>
              Paste sample data
            </Button>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={hasHeader}
                onChange={(event) => setHasHeader(event.target.checked)}
              />
              First row is a header
            </label>
            <span className="flex-1" />
            <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="button" size="sm" disabled={rawText.trim() === ""} onClick={parse}>
              Detect columns
            </Button>
          </div>
        </div>
      ) : null}

      {/* Step 2 — Map columns */}
      {step === 2 ? (
        <div className="flex flex-col gap-4">
          <Card>
            <CardContent className="flex flex-col gap-3 p-4">
              <p className="text-sm text-muted-foreground">
                The parser suggests a mapping; you decide. Never-importable columns (verification,
                trust scores, profile ownership, public content) can’t be mapped — the buyer can’t
                assert them.
              </p>
              <ul className="flex flex-col divide-y divide-border">
                {columns.map((column, index) => {
                  const field = PASTE_FIELDS.find((entry) => entry.key === mapping[index]);
                  return (
                    <li
                      key={`${column}-${index}`}
                      className="grid grid-cols-1 items-center gap-2 py-2 sm:grid-cols-[1fr_auto_1fr_auto]"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{column}</p>
                        <p className="truncate font-mono text-xs text-muted-foreground">
                          {sampleRow[index] ? `e.g. ${sampleRow[index]}` : "—"}
                        </p>
                      </div>
                      <span aria-hidden className="hidden text-muted-foreground sm:inline">
                        →
                      </span>
                      <label className="flex flex-col gap-0.5">
                        <span className="sr-only">Field for column {column}</span>
                        <select
                          value={mapping[index]}
                          onChange={(event) =>
                            setMapping((current) =>
                              current.map((value, i) =>
                                i === index ? (event.target.value as PasteFieldKey) : value,
                              ),
                            )
                          }
                          className="h-9 rounded-md border border-border bg-card px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {PASTE_FIELDS.map((entry) => (
                            <option key={entry.key} value={entry.key}>
                              {entry.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <span>
                        {field?.fieldClass ? (
                          <Badge variant={FIELD_CLASS_VARIANT[field.fieldClass]}>
                            {FIELD_CLASS_LABEL[field.fieldClass]}
                          </Badge>
                        ) : null}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setStep(1)}>
              Back
            </Button>
            <span className="flex-1" />
            {!mapping.includes("company") ? (
              <span className="text-xs text-iv-danger-muted">
                Map a column to Company name first.
              </span>
            ) : null}
            <Button
              type="button"
              size="sm"
              disabled={!mapping.includes("company")}
              onClick={validate}
            >
              Validate rows
            </Button>
          </div>
        </div>
      ) : null}

      {/* Step 3 — Validate & resolve */}
      {step === 3 ? (
        <div className="flex flex-col gap-3">
          {batchGroups.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-2xs font-semibold uppercase tracking-wide text-muted-foreground">
                Batch resolve
              </span>
              {batchGroups.map((group) => (
                <Button
                  key={group.categoryId + group.rowIds.join()}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setRows((current) =>
                      current.map((row) =>
                        group.rowIds.includes(row.id)
                          ? {
                              ...row,
                              categoryId: group.categoryId,
                              categoryConfirmed: true,
                              categoryTextOnly: false,
                            }
                          : row,
                      ),
                    )
                  }
                >
                  Apply “{categoryName(group.categoryId)}” to {group.rowIds.length} items
                </Button>
              ))}
            </div>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full border-collapse text-sm">
                <caption className="sr-only">Pasted rows</caption>
                <thead>
                  <tr className="border-b border-border">
                    <th
                      scope="col"
                      className="px-3 py-2 text-left text-2xs font-semibold uppercase tracking-wide text-muted-foreground"
                    >
                      Company
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-2 text-left text-2xs font-semibold uppercase tracking-wide text-muted-foreground"
                    >
                      Category
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-2 text-left text-2xs font-semibold uppercase tracking-wide text-muted-foreground"
                    >
                      State
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-2 text-right text-2xs font-semibold uppercase tracking-wide text-muted-foreground"
                    >
                      <span className="sr-only">Resolve</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const state = pasteRowState(row);
                    const selected = row.id === selectedId;
                    return (
                      <tr
                        key={row.id}
                        className={cn(
                          "cursor-pointer border-b border-border last:border-b-0 hover:bg-accent/50",
                          selected && "bg-iv-navy-50",
                          row.skipped && "opacity-60",
                        )}
                        onClick={() => setSelectedId(row.id)}
                      >
                        <td className="px-3 py-2.5">
                          <p className="font-medium text-foreground">
                            {row.company || (
                              <span className="text-iv-danger-muted">— no name —</span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">{row.location}</p>
                        </td>
                        <td className="px-3 py-2.5">
                          {row.categoryConfirmed && row.categoryId ? (
                            <span className="text-iv-navy-700">{categoryName(row.categoryId)}</span>
                          ) : row.categoryText ? (
                            <span className="text-muted-foreground">{row.categoryText}</span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5">
                          <StatusChip
                            label={PASTE_ROW_STATE_LABEL[state]}
                            tone={STATE_TONE[state]}
                          />
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <span className="text-xs font-semibold text-iv-navy-700">Resolve</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Side panel */}
            <div className="rounded-lg border border-border bg-card p-4">
              {selectedRow ? (
                <RowResolver
                  row={selectedRow}
                  onMatch={() => setMatcherFor(selectedRow.id)}
                  onKeepText={() =>
                    updateRow(selectedRow.id, {
                      categoryTextOnly: true,
                      categoryConfirmed: false,
                      categoryId: undefined,
                    })
                  }
                  onClearEmail={() => updateRow(selectedRow.id, { email: "" })}
                  onUseExisting={() =>
                    updateRow(selectedRow.id, { duplicateResolved: true, skipped: true })
                  }
                  onLink={() =>
                    updateRow(selectedRow.id, { duplicateResolved: true, linked: true })
                  }
                  onCreateSeparate={() => setAckFor(selectedRow.id)}
                  onTogglePreferred={(preferred) => updateRow(selectedRow.id, { preferred })}
                  onToggleSkip={(skipped) => updateRow(selectedRow.id, { skipped })}
                />
              ) : (
                <p className="text-sm text-muted-foreground">Select a row to resolve it here.</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setStep(2)}>
              Back
            </Button>
            <span className="flex-1" />
            <Button type="button" size="sm" onClick={() => setStep(4)}>
              Preview
            </Button>
          </div>
        </div>
      ) : null}

      {/* Step 4 — Preview & confirm */}
      {step === 4 ? (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {(Object.keys(counts) as PasteRowState[])
              .filter((state) => counts[state] > 0 || state === "ready")
              .map((state) => (
                <div key={state} className="min-w-24 rounded-lg border border-border px-4 py-3">
                  <p className="text-xl font-bold tabular-nums text-foreground">{counts[state]}</p>
                  <p className="text-2xs text-muted-foreground">{PASTE_ROW_STATE_LABEL[state]}</p>
                </div>
              ))}
          </div>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full border-collapse text-sm">
              <caption className="sr-only">Rows to create</caption>
              <thead>
                <tr className="border-b border-border">
                  <th
                    scope="col"
                    className="px-3 py-2 text-left text-2xs font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    Company
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-2 text-left text-2xs font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    Category
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-2 text-left text-2xs font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    Source
                  </th>
                </tr>
              </thead>
              <tbody>
                {eligible.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-3 py-6 text-center text-sm text-muted-foreground">
                      No eligible rows yet — resolve categories and duplicates in the review step.
                    </td>
                  </tr>
                ) : (
                  eligible.map((row) => (
                    <tr key={row.id} className="border-b border-border last:border-b-0">
                      <td className="px-3 py-2.5 font-medium text-foreground">{row.company}</td>
                      <td className="px-3 py-2.5 text-iv-navy-700">
                        {categoryName(row.categoryId)}
                      </td>
                      <td className="px-3 py-2.5">
                        <code className="text-xs text-muted-foreground">source = excel</code>
                        {row.linked && row.preferred ? (
                          <Badge variant="amber" className="ml-2">
                            Preferred
                          </Badge>
                        ) : null}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <Info aria-hidden className="mt-0.5 size-3.5 shrink-0" />
            Only eligible rows (valid name + a confirmed system category) are created. Unresolved
            rows stay in the review grid for correction — nothing is truncated.
          </p>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setStep(3)}>
              Back to review
            </Button>
            <span className="flex-1" />
            <Button
              type="button"
              size="sm"
              disabled={eligible.length === 0}
              onClick={() => onConfirm(eligible)}
            >
              Create {eligible.length} vendor{eligible.length === 1 ? "" : "s"}
            </Button>
          </div>
        </div>
      ) : null}

      {/* Category matcher for the selected row */}
      <CategoryMatcherDialog
        open={matcherFor !== null}
        onOpenChange={(open) => !open && setMatcherFor(null)}
        enteredText={matcherRow?.categoryText || matcherRow?.company || ""}
        onConfirm={(categoryId) =>
          matcherFor &&
          updateRow(matcherFor, { categoryId, categoryConfirmed: true, categoryTextOnly: false })
        }
        onKeepText={() =>
          matcherFor &&
          updateRow(matcherFor, {
            categoryTextOnly: true,
            categoryConfirmed: false,
            categoryId: undefined,
          })
        }
      />

      {/* Create-separate acknowledgment (high-similarity) */}
      <Dialog open={ackFor !== null} onOpenChange={(open) => !open && setAckFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a separate private vendor?</DialogTitle>
            <DialogDescription>
              This row looks similar to an existing vendor. Creating a separate private record is
              allowed, but avoid accidental duplicates. Nothing is merged automatically.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" size="sm">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                if (ackFor) updateRow(ackFor, { duplicateResolved: true });
                setAckFor(null);
              }}
            >
              Yes, create separate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RowResolver({
  row,
  onMatch,
  onKeepText,
  onClearEmail,
  onUseExisting,
  onLink,
  onCreateSeparate,
  onTogglePreferred,
  onToggleSkip,
}: {
  row: PasteRow;
  onMatch: () => void;
  onKeepText: () => void;
  onClearEmail: () => void;
  onUseExisting: () => void;
  onLink: () => void;
  onCreateSeparate: () => void;
  onTogglePreferred: (preferred: boolean) => void;
  onToggleSkip: (skipped: boolean) => void;
}) {
  const state = pasteRowState(row);
  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-sm font-semibold text-foreground">
          {row.company || "(no company name)"}
        </p>
        <p className="text-xs text-muted-foreground">{PASTE_ROW_STATE_LABEL[state]}</p>
      </div>

      {state === "missing_required" ? (
        <p className="rounded-md bg-iv-danger-subtle px-3 py-2 text-xs text-iv-danger-muted">
          A company name is required to create a private vendor. Add it to the pasted cell, or skip.
        </p>
      ) : null}

      {state === "blocked" ? (
        <div className="rounded-md bg-iv-danger-subtle px-3 py-2 text-xs text-iv-danger-muted">
          Email “{row.email}” isn’t valid.{" "}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 px-1 text-xs"
            onClick={onClearEmail}
          >
            Clear email
          </Button>
          (a private vendor can be created without one).
        </div>
      ) : null}

      {row.duplicate && !row.duplicateResolved ? (
        <div className="flex flex-col gap-2">
          <p className="text-xs">
            <span className="font-semibold text-foreground">
              Possible {row.duplicate.kind === "marketplace" ? "marketplace" : "directory"} match:
            </span>{" "}
            {row.duplicate.name}
          </p>
          <div className="flex flex-wrap gap-1.5">
            <Button type="button" variant="outline" size="sm" onClick={onUseExisting}>
              Use existing
            </Button>
            {row.duplicate.kind === "marketplace" ? (
              <Button type="button" size="sm" onClick={onLink}>
                Link to platform vendor
              </Button>
            ) : null}
            <Button type="button" variant="outline" size="sm" onClick={onCreateSeparate}>
              Create separate
            </Button>
          </div>
          <p className="text-2xs text-muted-foreground">Nothing is merged automatically.</p>
        </div>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-semibold text-foreground">Category</p>
        <p className="text-2xs text-muted-foreground">Entered: “{row.categoryText || "—"}”</p>
        {row.categoryConfirmed && row.categoryId ? (
          <Badge variant="brand" className="w-fit">
            ✓ {categoryName(row.categoryId)}
          </Badge>
        ) : row.categoryTextOnly ? (
          <p className="text-2xs text-iv-warning-muted">
            Text-only does not satisfy the category requirement — confirm a system category to make
            this row eligible.
          </p>
        ) : null}
        <div className="flex flex-wrap gap-1.5">
          <Button
            type="button"
            size="sm"
            variant={row.categoryId ? "outline" : "primary"}
            onClick={onMatch}
          >
            {row.categoryId ? "Change category" : "Match a category"}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={onKeepText}>
            Keep as text only
          </Button>
        </div>
      </div>

      {row.linked ? (
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={row.preferred}
            onChange={(event) => onTogglePreferred(event.target.checked)}
          />
          Mark ⭐ Preferred (set_vendor_favorite)
        </label>
      ) : (
        <p className="text-2xs text-muted-foreground">
          ⭐ Preferred is available only after linking this row to a marketplace profile (D1(a)).
        </p>
      )}

      <label className="flex items-center gap-2 border-t border-border pt-2 text-xs text-muted-foreground">
        <input
          type="checkbox"
          checked={row.skipped}
          onChange={(event) => onToggleSkip(event.target.checked)}
        />
        Skip this row
      </label>
    </div>
  );
}
