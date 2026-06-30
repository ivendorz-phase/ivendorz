// App component: CapabilityMatrix (Doc-7B kit, App tier — owner-of-record per landing_page_spec §1.5).
//
// THE crown-jewel realization of Invariant #1 / DP7: vendor capability is FOUR INDEPENDENT boolean
// flags (can_supply / can_service / can_fabricate / can_consult), rendered as a MATRIX — never a single
// label, dropdown, or composite, and never matching/recomputed (the four flags are read straight from
// the contract). Absent flags render OFF, never hidden.
//
// Promoted into the shared kit so every surface composes ONE component: the Vendor workspace
// (read display + edit) and the Public marketplace (read display on vendor cards/microsites).
// Presentation-only · RSC-friendly (no hooks, no state):
//   • variant="list"    — detailed rows (label + description + on/off), the vendor-profile display.
//   • variant="compact" — a horizontal chip row for cards/grids (label always shown; on/off by dot
//                         fill + text, never colour alone).
//   • editable          — uncontrolled native checkboxes (the canonical on/off control [ESC-7B-SWITCH]
//                         is a pending kit addition — interim native control, no submission wiring).
import { Check, Minus } from "lucide-react";
import { cn } from "../lib/cn";

/** The four INDEPENDENT capability flags (Invariant #1 / DP7 — a matrix, never a label). */
export interface CapabilityFlags {
  can_supply: boolean;
  can_service: boolean;
  can_fabricate: boolean;
  can_consult: boolean;
}

interface FlagMeta {
  key: keyof CapabilityFlags;
  label: string;
  description: string;
  dot: string;
}

const FLAGS: FlagMeta[] = [
  {
    key: "can_supply",
    label: "Supply",
    description: "Sell or supply goods",
    dot: "bg-iv-cap-supply",
  },
  {
    key: "can_service",
    label: "Service",
    description: "Provide services",
    dot: "bg-iv-cap-service",
  },
  {
    key: "can_fabricate",
    label: "Fabricate",
    description: "Custom fabrication",
    dot: "bg-iv-cap-fabricate",
  },
  {
    key: "can_consult",
    label: "Consult",
    description: "Consulting / advisory",
    dot: "bg-iv-cap-consult",
  },
];

// VARIANT CONTRACT (N1) — three explicit presentation modes; styling is never inferred:
//   • list     (default)  — detailed read rows: dot + label + description + on/off marker.
//   • compact             — read chip row for cards/grids: dot + label; on/off by fill + sr-only text.
//   • editable (override) — uncontrolled native checkboxes for the vendor edit form; takes precedence
//                           over `variant`. Interim control until [ESC-7B-SWITCH] lands; no write wiring.
export interface CapabilityMatrixProps {
  flags?: Partial<CapabilityFlags>;
  /** Read mode — `list` (default, detailed rows) or `compact` (chip row). Ignored when `editable`. */
  variant?: "list" | "compact";
  /** `true` → editable uncontrolled checkboxes (overrides `variant`); omitted → read-only display. */
  editable?: boolean;
  /** Field-name prefix for editable inputs (presentation only — not wired to any write). */
  namePrefix?: string;
  className?: string;
}

export function CapabilityMatrix({
  flags,
  variant = "list",
  editable = false,
  namePrefix = "capability",
  className,
}: CapabilityMatrixProps) {
  // Compact, read-only chip row — for vendor cards / grids. Every flag is always shown (absent = OFF,
  // never hidden — §5 card edge-cases); on/off is conveyed by dot fill + an sr-only word, not colour alone.
  if (variant === "compact" && !editable) {
    return (
      <ul role="list" className={cn("flex flex-wrap gap-1.5", className)}>
        {FLAGS.map((flag) => {
          const on = Boolean(flags?.[flag.key]);
          return (
            <li key={flag.key}>
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 text-2xs font-medium leading-none",
                  on
                    ? "border-border text-foreground"
                    : "border-dashed border-border text-muted-foreground opacity-70",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "size-1.5 shrink-0 rounded-full",
                    on ? flag.dot : "bg-muted-foreground/40",
                  )}
                />
                {flag.label}
                <span className="sr-only">{on ? " available" : " not available"}</span>
              </span>
            </li>
          );
        })}
      </ul>
    );
  }

  // Detailed list — read display + edit. (Vendor profile S1 display / S3 edit.)
  return (
    <ul className={cn("divide-y divide-border rounded-md border border-border", className)}>
      {FLAGS.map((flag) => {
        const on = Boolean(flags?.[flag.key]);
        const id = `${namePrefix}-${flag.key}`;
        return (
          <li key={flag.key} className="flex items-center gap-3 p-3">
            <span aria-hidden="true" className={cn("size-2.5 shrink-0 rounded-full", flag.dot)} />
            <div className="min-w-0 flex-1">
              <label
                htmlFor={editable ? id : undefined}
                className="block text-sm font-medium text-foreground"
              >
                {flag.label}
              </label>
              <p className="text-xs text-muted-foreground">{flag.description}</p>
            </div>
            {editable ? (
              <input
                type="checkbox"
                id={id}
                name={id}
                defaultChecked={on}
                className="size-5 shrink-0 rounded accent-iv-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            ) : (
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-xs font-medium",
                  on ? "text-iv-success-base" : "text-muted-foreground",
                )}
              >
                {on ? (
                  <Check aria-hidden="true" className="size-4" />
                ) : (
                  <Minus aria-hidden="true" className="size-4" />
                )}
                {on ? "On" : "Off"}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
