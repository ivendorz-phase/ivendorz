"use client";

// P-BUY-RFQ — Item Requirements List (Request type section). PRESENTATION-ONLY: an inline, repeatable
// item grid (Sl. No. / Item Name / Size / Qty / Unit / Action) plus a "Paste from Excel" helper that
// parses tab/comma/semicolon-delimited clipboard text into rows (4 columns: Item Name, Size, Qty, Unit;
// or 3 columns: Item Name, Qty, Unit) with unit-name normalization against `UNIT_OPTIONS`, and an
// Append/Replace choice. Rows are LOCAL UI state only — no fetch, no mutation; a client form surface
// wires these into the dev-doc capture (`content_jsonb`, alongside the existing single item/quantity/unit
// fields) at integration (Wave 4). Reuses the buyer `Select`/`Textarea` controls; native text/number
// inputs otherwise (no kit table primitive exists yet).

import * as React from "react";
import { ClipboardPaste, Plus, Trash2, AlertCircle } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { Select, Textarea } from "../form-controls";
import { UNIT_OPTIONS } from "./rfq-options";
import type { RfqItemRow } from "./rfq-form-models";

const INPUT_CLASS =
  "w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm text-iv-ink-strong shadow-iv-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

let rowSeq = 0;
function nextRowId() {
  rowSeq += 1;
  return `row-${rowSeq}`;
}

function blankRow(): RfqItemRow {
  return { id: nextRowId(), itemName: "", size: "", quantity: "", unit: "" };
}

/** Normalize a pasted unit token against `UNIT_OPTIONS` (value or label match, case-insensitive), falling
 *  back to a small set of common synonyms; returns "" (unmatched → left to the buyer via the Select). */
function normalizeUnit(raw: string): string {
  const token = raw.trim().toLowerCase();
  if (!token) return "";
  const direct = UNIT_OPTIONS.find(
    (o) => o.value.toLowerCase() === token || o.label.toLowerCase() === token,
  );
  if (direct) return direct.value;
  const synonyms: Record<string, string> = {
    pc: "pcs",
    piece: "pcs",
    pieces: "pcs",
    kgs: "kg",
    kilogram: "kg",
    kilograms: "kg",
    tons: "ton",
    tonne: "ton",
    tonnes: "ton",
    t: "ton",
    meter: "m",
    meters: "m",
    metre: "m",
    metres: "m",
    mtr: "m",
    sqft: "sqm",
    sft: "sqm",
    l: "litre",
    ltr: "litre",
    liter: "litre",
    liters: "litre",
    litres: "litre",
    sets: "set",
    lots: "lot",
  };
  return synonyms[token] ?? "";
}

/** Split one pasted line into cells — tab first (native Excel/Sheets clipboard), then comma, then
 *  semicolon (CSV-style pastes). */
function splitCells(line: string): string[] {
  if (line.includes("\t")) return line.split("\t");
  if (line.includes(",")) return line.split(",");
  if (line.includes(";")) return line.split(";");
  return [line];
}

/** Parse pasted tabular text into rows. 4+ columns = Item Name/Size/Qty/Unit; 3 columns =
 *  Item Name/Qty/Unit (no Size). Returns [] when nothing parseable. */
function parsePastedRows(text: string): RfqItemRow[] {
  const lines = text
    .split(/\r\n|\r|\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const parsed: RfqItemRow[] = [];
  for (const line of lines) {
    const cells = splitCells(line).map((c) => c.trim());
    let itemName = "";
    let size = "";
    let quantity = "";
    let unitRaw = "";

    if (cells.length >= 4) {
      [itemName, size, quantity, unitRaw] = cells;
    } else if (cells.length === 3) {
      [itemName, quantity, unitRaw] = cells;
    } else {
      itemName = cells[0] ?? "";
    }

    if (!itemName && !quantity) continue;
    parsed.push({
      id: nextRowId(),
      itemName: itemName ?? "",
      size: size ?? "",
      quantity: (quantity ?? "").replace(/[^0-9.]/g, ""),
      unit: normalizeUnit(unitRaw ?? ""),
    });
  }
  return parsed;
}

export function ItemRequirementsTable({ rows: initialRows }: { rows?: RfqItemRow[] }) {
  const [rows, setRows] = React.useState<RfqItemRow[]>(() =>
    initialRows && initialRows.length > 0 ? initialRows : [blankRow()],
  );
  const [pasteOpen, setPasteOpen] = React.useState(false);
  const [pasteValue, setPasteValue] = React.useState("");
  const [pasteError, setPasteError] = React.useState("");

  function updateRow(id: string, patch: Partial<RfqItemRow>) {
    setRows((cur) => cur.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function addRow() {
    setRows((cur) => [...cur, blankRow()]);
  }

  function removeRow(id: string) {
    setRows((cur) => (cur.length > 1 ? cur.filter((r) => r.id !== id) : cur));
  }

  function handleImportPaste(append: boolean) {
    if (!pasteValue.trim()) {
      setPasteError("Please paste some tabular data first.");
      return;
    }
    const parsed = parsePastedRows(pasteValue);
    if (parsed.length === 0) {
      setPasteError(
        "Could not parse columns. Copy 4 columns (Item Name, Size, Qty, Unit) or 3 columns (Item Name, Qty, Unit) from Excel.",
      );
      return;
    }
    setRows((cur) => (append ? [...cur, ...parsed] : parsed));
    setPasteValue("");
    setPasteError("");
    setPasteOpen(false);
  }

  return (
    <div className="sm:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-foreground">Item Requirements List</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Provide names, sizes, quantities, and standard units for each requested line.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="gap-1.5"
          onClick={() => setPasteOpen((v) => !v)}
        >
          <ClipboardPaste aria-hidden className="size-3.5" />
          Paste from Excel
        </Button>
      </div>

      {pasteOpen ? (
        <div className="mt-2 rounded-md border border-dashed border-border bg-secondary/40 p-3">
          <p className="text-xs text-muted-foreground">
            Paste a 4-column table copied from Excel/Sheets — Item Name, Size, Qty, Unit — or 3
            columns (Item Name, Qty, Unit). Columns are matched by tabs, commas, or semicolons.
          </p>
          <Textarea
            rows={4}
            value={pasteValue}
            onChange={(e) => setPasteValue(e.target.value)}
            placeholder={"MS plate 12mm\t2000x1000mm\t50\tpcs"}
            className="mt-2 font-mono text-xs"
          />
          {pasteError ? (
            <p className="mt-1.5 flex items-center gap-1 text-xs text-destructive">
              <AlertCircle aria-hidden className="size-3.5 shrink-0" />
              {pasteError}
            </p>
          ) : null}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              className="gap-1.5"
              onClick={() => handleImportPaste(true)}
              disabled={!pasteValue.trim()}
            >
              <Plus aria-hidden className="size-3.5" />
              Append to list
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => handleImportPaste(false)}
              disabled={!pasteValue.trim()}
            >
              Replace current list
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setPasteOpen(false);
                setPasteValue("");
                setPasteError("");
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : null}

      <div className="mt-3 max-h-[350px] overflow-y-auto overflow-x-auto rounded-md border border-border">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/40 text-left text-xs font-semibold text-muted-foreground">
              <th className="w-12 px-2 py-2">Sl. No.</th>
              <th className="px-2 py-2">
                Item Name<span className="ml-0.5 text-destructive">*</span>
              </th>
              <th className="px-2 py-2">Size</th>
              <th className="w-24 px-2 py-2">
                Qty<span className="ml-0.5 text-destructive">*</span>
              </th>
              <th className="w-36 px-2 py-2">Unit</th>
              <th className="w-16 px-2 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.id} className="border-b border-border last:border-0">
                <td className="px-2 py-1.5 text-muted-foreground">{i + 1}</td>
                <td className="px-2 py-1.5">
                  <input
                    type="text"
                    aria-label={`Item name (row ${i + 1})`}
                    className={INPUT_CLASS}
                    value={row.itemName}
                    onChange={(e) => updateRow(row.id, { itemName: e.target.value })}
                    placeholder="e.g. MS plate 12mm"
                  />
                </td>
                <td className="px-2 py-1.5">
                  <input
                    type="text"
                    aria-label={`Size (row ${i + 1})`}
                    className={INPUT_CLASS}
                    value={row.size}
                    onChange={(e) => updateRow(row.id, { size: e.target.value })}
                    placeholder="e.g. 2000x1000mm"
                  />
                </td>
                <td className="px-2 py-1.5">
                  <input
                    type="number"
                    min={0}
                    inputMode="decimal"
                    aria-label={`Quantity (row ${i + 1})`}
                    className={INPUT_CLASS}
                    value={row.quantity}
                    onChange={(e) => updateRow(row.id, { quantity: e.target.value })}
                    placeholder="0"
                  />
                </td>
                <td className="px-2 py-1.5">
                  <Select
                    options={UNIT_OPTIONS}
                    placeholder="Unit"
                    value={row.unit}
                    onChange={(e) => updateRow(row.id, { unit: e.target.value })}
                  />
                </td>
                <td className="px-2 py-1.5 text-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-label={`Remove row ${i + 1}`}
                    disabled={rows.length === 1}
                    onClick={() => removeRow(row.id)}
                  >
                    <Trash2 aria-hidden className="size-4 text-muted-foreground" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Button type="button" variant="secondary" size="sm" className="mt-2 gap-1.5" onClick={addRow}>
        <Plus aria-hidden className="size-3.5" />
        Add row
      </Button>
    </div>
  );
}
