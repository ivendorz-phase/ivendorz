"use client";

// P-BUY-RFQ (P-BUY-07) Phase 2 — READINESS PANEL (D3). Persistent right column. Shows the blocking
// submission issues, the non-blocking warnings, and an overall state — each row links to its field
// (scroll + focus). The three states (Not ready / Needs attention / Ready to submit) are PRESENTATION
// ONLY — never persisted as RFQ lifecycle states (Doc-2 §5.4 owns those). Sticky and capped to
// `calc(100vh-88px)`; header + footnote pinned, only the lists scroll. PRESENTATION-ONLY.

import { Check, CircleAlert, TriangleAlert } from "lucide-react";
import { cn } from "@/frontend/lib/cn";
import type { ReadinessItem, ReadinessSnapshot, RfqReadinessState } from "./rfq-draft-validation";

const STATE_META: Record<RfqReadinessState, { label: string; pip: string; text: string }> = {
  "not-ready": { label: "Not ready", pip: "bg-iv-danger-base", text: "text-iv-danger-base" },
  "needs-attention": {
    label: "Needs attention",
    pip: "bg-iv-warning-base",
    text: "text-iv-warning-muted",
  },
  ready: { label: "Ready to submit", pip: "bg-iv-success-base", text: "text-iv-success-base" },
};

function stateSub(snapshot: ReadinessSnapshot): string {
  const unmetB = snapshot.blockers.filter((b) => !b.met).length;
  const unmetW = snapshot.warnings.filter((w) => !w.met).length;
  if (unmetB > 0) {
    return `${unmetB} item${unmetB > 1 ? "s" : ""} must be completed before you can submit.`;
  }
  if (unmetW > 0) {
    return `You can submit. ${unmetW} optional item${unmetW > 1 ? "s" : ""} would make your RFQ easier to quote.`;
  }
  return "Everything the submission gate needs is in place.";
}

function Row({
  item,
  kind,
  onJump,
}: {
  item: ReadinessItem;
  kind: "met" | "blocked" | "warn";
  onJump: (item: ReadinessItem) => void;
}) {
  const Icon = kind === "met" ? Check : kind === "blocked" ? CircleAlert : TriangleAlert;
  return (
    <button
      type="button"
      onClick={() => onJump(item)}
      className={cn(
        "flex w-full items-start gap-2 rounded-md px-1.5 py-1.5 text-left text-xs leading-snug transition-colors hover:bg-accent",
        kind === "met" && "text-muted-foreground",
        kind === "blocked" && "font-medium text-foreground",
        kind === "warn" && "text-foreground/80",
      )}
    >
      <Icon
        aria-hidden
        className={cn(
          "mt-0.5 size-3.5 shrink-0",
          kind === "met" && "text-iv-success-base",
          kind === "blocked" && "text-iv-danger-base",
          kind === "warn" && "text-iv-warning-base",
        )}
      />
      <span className="min-w-0">
        {item.label}
        {kind !== "met" && item.hint ? (
          <span className="mt-0.5 block text-2xs font-semibold text-iv-brand-600">
            {item.hint} →
          </span>
        ) : null}
      </span>
    </button>
  );
}

export function ReadinessPanel({
  snapshot,
  onJump,
}: {
  snapshot: ReadinessSnapshot;
  onJump: (item: ReadinessItem) => void;
}) {
  const meta = STATE_META[snapshot.state];
  const unmetWarnings = snapshot.warnings.filter((w) => !w.met);
  const progress =
    snapshot.totalBlockers === 0
      ? 100
      : Math.round((snapshot.metBlockers / snapshot.totalBlockers) * 100);

  return (
    <aside
      aria-label="Submission readiness"
      className="sticky top-3.5 flex max-h-[calc(100vh-88px)] flex-col overflow-hidden rounded-lg border border-border bg-card shadow-iv-sm"
    >
      {/* pinned header */}
      <div className="shrink-0 border-b border-border p-3.5">
        <div className={cn("flex items-center gap-2 text-sm font-bold", meta.text)}>
          <span aria-hidden className={cn("size-2.5 shrink-0 rounded-full", meta.pip)} />
          <span>{meta.label}</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{stateSub(snapshot)}</p>
        <div
          className="mt-2.5 h-1 overflow-hidden rounded-full bg-border"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Required fields complete"
        >
          <div
            className="h-full bg-iv-brand-500 transition-[width] duration-200 ease-iv-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* scrolling lists */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="border-b border-border p-3.5">
          <p className="mb-1.5 text-2xs font-bold uppercase tracking-wide text-muted-foreground/80">
            Required before submission
          </p>
          <div className="flex flex-col">
            {snapshot.blockers.map((b) => (
              <Row key={b.id} item={b} kind={b.met ? "met" : "blocked"} onJump={onJump} />
            ))}
          </div>
        </div>
        {unmetWarnings.length > 0 ? (
          <div className="p-3.5">
            <p className="mb-1.5 text-2xs font-bold uppercase tracking-wide text-muted-foreground/80">
              Worth adding — never blocks
            </p>
            <div className="flex flex-col">
              {unmetWarnings.map((w) => (
                <Row key={w.id} item={w} kind="warn" onJump={onJump} />
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {/* pinned footnote */}
      <div className="shrink-0 bg-secondary/40 p-3.5 text-2xs leading-snug text-muted-foreground">
        Mirrors the frozen submission set (Doc-3 §1.2). These are presentation states only —{" "}
        <b className="font-semibold">Not ready · Needs attention · Ready to submit</b> are never
        persisted as RFQ lifecycle states.
      </div>
    </aside>
  );
}
