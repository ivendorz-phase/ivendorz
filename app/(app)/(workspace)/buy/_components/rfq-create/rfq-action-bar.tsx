"use client";

// P-BUY-RFQ — the sticky ACTION BAR and the draft-safety contract (owner ruling D2, 2026-07-24).
//
//   Autosave: PROHIBITED.  Explicit Save draft: REQUIRED.
//   Dirty indicator: REQUIRED.  Leave guard: REQUIRED.  Discard: REQUIRED.
//
// WHY autosave is prohibited (not a preference): `rfq.update_rfq.v1` (Doc-4E §E4.2) APPENDS
// `version_no + 1` and takes a mandatory `revision_reason`. Autosaving ordinary keystrokes would
// mint a version chain and an audit record per keystroke window, degrading the RFQ's evidence
// history (Doc-2 §5.4 immutability, Inv #8). One explicit Save = one `update_rfq`.
//
// The governed revision-reason interaction for an explicit save is determined at BACKEND WIRING
// (Phase 4). Until then this surface SIMULATES save and must never imply server persistence — the
// copy says so, and no draft is written to `localStorage` (D2 prohibition: browser state is not a
// substitute for the organization-owned draft, GI-02).

import * as React from "react";
import { Info, Save } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { cn } from "@/frontend/lib/cn";

export type SaveState = "idle" | "saving" | "saved" | "error";

export function RfqActionBar({
  dirty,
  saveState,
  lastSavedLabel,
  readyToSubmit,
  onSave,
  onDiscard,
  onReview,
}: {
  dirty: boolean;
  saveState: SaveState;
  lastSavedLabel?: string;
  readyToSubmit: boolean;
  onSave: () => void;
  onDiscard: () => void;
  onReview: () => void;
}) {
  const statusLine = dirty
    ? "Unsaved changes"
    : lastSavedLabel
      ? "All changes saved"
      : "No changes yet";

  const detailLine =
    saveState === "error"
      ? "Couldn’t save — your changes are still here. Try again."
      : lastSavedLabel
        ? `Last saved ${lastSavedLabel}`
        : "Draft not saved yet";

  return (
    <div className="sticky bottom-0 z-20 -mx-4 mt-auto flex flex-wrap items-center gap-3 border-t border-border bg-background/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
      <div className="min-w-0 text-xs">
        <p className="flex items-center gap-1.5 font-medium text-muted-foreground">
          {dirty ? (
            <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-iv-warning-base" />
          ) : null}
          {statusLine}
        </p>
        <p
          className={cn(
            "text-2xs text-muted-foreground",
            saveState === "error" && "font-semibold text-destructive",
          )}
          role={saveState === "error" ? "alert" : undefined}
        >
          {detailLine}
        </p>
      </div>

      {/* The no-autosave disclosure is REQUIRED by D2, so it shortens on narrow widths — it never
          disappears, and the bar must stay one row or it covers the last section. */}
      <p className="flex items-center gap-1.5 text-2xs text-muted-foreground">
        <Info aria-hidden className="size-3.5 shrink-0" />
        <span className="hidden 2xl:inline">
          There is no autosave — your draft is saved only when you choose <b>Save draft</b>.
        </span>
        <span className="2xl:hidden">
          No autosave — use <b>Save draft</b>.
        </span>
      </p>

      <div className="ml-auto flex items-center gap-2">
        <Button type="button" variant="ghost" onClick={onDiscard} disabled={!dirty}>
          Discard changes
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="gap-1.5"
          onClick={onSave}
          disabled={saveState === "saving"}
        >
          <Save aria-hidden className="size-4" />
          {saveState === "saving" ? "Saving…" : "Save draft"}
        </Button>
        <Button type="button" onClick={onReview}>
          {readyToSubmit ? "Review & submit" : "Review request"}
        </Button>
      </div>
    </div>
  );
}
