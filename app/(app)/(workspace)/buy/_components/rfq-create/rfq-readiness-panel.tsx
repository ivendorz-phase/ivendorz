"use client";

// P-BUY-RFQ — the persistent SUBMIT-READINESS panel (owner ruling D3, 2026-07-24).
//
// Shows: blocking submission issues · incomplete required sections · non-blocking warnings · links
// to the affected section or field · overall readiness. States are **presentation only** —
// Not ready / Needs attention / Ready to submit are never persisted and are NOT RFQ lifecycle
// states (Doc-2 §5.4 owns those).
//
// It mirrors the frozen submission gate (Doc-3 §1.2) as GUIDANCE. The server re-checks and decides;
// a BUSINESS failure at `submit_rfq` maps back onto these rows at wiring (Doc-4E §E4.3 stage-8).

import { AlertTriangle, Check, CircleAlert } from "lucide-react";
import { Card } from "@/frontend/primitives/card";
import { cn } from "@/frontend/lib/cn";
import { READINESS_LABEL, type RfqCheck, type RfqReadiness } from "./rfq-readiness";

const STATE_TONE = {
  "not-ready": {
    pip: "bg-iv-danger-base",
    text: "text-iv-danger-muted dark:text-iv-danger-text",
  },
  "needs-attention": {
    pip: "bg-iv-warning-base",
    text: "text-iv-warning-muted dark:text-iv-warning-text",
  },
  ready: {
    pip: "bg-iv-success-base",
    text: "text-iv-success-muted dark:text-iv-success-text",
  },
} as const;

function CheckRow({
  check,
  tone,
  onJump,
}: {
  check: RfqCheck;
  tone: "met" | "blocked" | "warning";
  onJump: (check: RfqCheck) => void;
}) {
  const Icon = tone === "met" ? Check : tone === "blocked" ? CircleAlert : AlertTriangle;
  return (
    <li>
      <button
        type="button"
        onClick={() => onJump(check)}
        className={cn(
          "flex w-full items-start gap-2 rounded-md px-1.5 py-1 text-left text-xs leading-snug transition-colors duration-150 ease-iv-out",
          "hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          tone === "met" && "text-muted-foreground",
          tone === "blocked" && "font-medium text-foreground",
          tone === "warning" && "text-foreground/80",
        )}
      >
        <Icon
          aria-hidden
          className={cn(
            "mt-0.5 size-3.5 shrink-0",
            tone === "met" && "text-iv-success-base",
            tone === "blocked" && "text-iv-danger-base",
            tone === "warning" && "text-iv-warning-base",
          )}
        />
        <span className="min-w-0 flex-1">
          {check.label}
          {tone !== "met" ? (
            <span className="mt-0.5 block text-2xs font-semibold text-iv-brand-600">
              {check.inZoneOne ? "Change in “What do you need?” →" : "Go to section →"}
            </span>
          ) : null}
        </span>
      </button>
    </li>
  );
}

export function RfqReadinessPanel({
  readiness,
  onJump,
  className,
}: {
  readiness: RfqReadiness;
  onJump: (check: RfqCheck) => void;
  className?: string;
}) {
  const tone = STATE_TONE[readiness.state];
  const { unmetBlockers, unmetWarnings } = readiness;

  const subtitle =
    readiness.state === "not-ready"
      ? `${unmetBlockers.length} item${unmetBlockers.length === 1 ? "" : "s"} must be completed before you can submit.`
      : readiness.state === "needs-attention"
        ? `You can submit. ${unmetWarnings.length} optional item${unmetWarnings.length === 1 ? "" : "s"} would make your RFQ easier to quote.`
        : "Everything the submission gate needs is in place.";

  return (
    // Sticky and capped, with only the lists scrolling — the header and footnote stay pinned.
    <div className={cn("sticky top-4 flex max-h-[calc(100vh-8rem)]", className)}>
      <Card className="flex w-full min-h-0 flex-col overflow-hidden">
        <div className="shrink-0 border-b border-border p-4">
          <p className={cn("flex items-center gap-2 text-sm font-semibold", tone.text)}>
            <span aria-hidden className={cn("size-2 shrink-0 rounded-full", tone.pip)} />
            {READINESS_LABEL[readiness.state]}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
          <div
            className="mt-2.5 h-1 overflow-hidden rounded-full bg-border"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={readiness.totalCount}
            aria-valuenow={readiness.metCount}
            aria-label="Submission requirements met"
          >
            <span
              className="block h-full rounded-full bg-iv-brand-500 transition-[width] duration-200 ease-iv-out"
              style={{ width: `${(readiness.metCount / readiness.totalCount) * 100}%` }}
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="border-b border-border p-3">
            <p className="px-1.5 pb-1.5 text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
              Required before submission
            </p>
            <ul className="space-y-0.5">
              {readiness.submitBlockers.map((check) => (
                <CheckRow
                  key={check.id}
                  check={check}
                  tone={check.met ? "met" : "blocked"}
                  onJump={onJump}
                />
              ))}
            </ul>
          </div>

          {unmetWarnings.length > 0 ? (
            <div className="p-3">
              <p className="px-1.5 pb-1.5 text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
                Worth adding — never blocks
              </p>
              <ul className="space-y-0.5">
                {unmetWarnings.map((check) => (
                  <CheckRow key={check.id} check={check} tone="warning" onJump={onJump} />
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <p className="shrink-0 border-t border-border bg-secondary/40 p-3 text-2xs leading-relaxed text-muted-foreground">
          Mirrors the platform&rsquo;s submission checks. These are presentation states only — they
          are never saved as an RFQ status, and the platform re-checks everything when you submit.
        </p>
      </Card>
    </div>
  );
}
