// Capability matrix (S1 display / S3 edit) — THE crown jewel for Invariant 1 / DP7.
//
// Capability is FOUR INDEPENDENT boolean flags (can_supply / can_service / can_fabricate /
// can_consult), rendered as a matrix — NEVER a single label or a dropdown, and never a composite.
// The vendor-type preset (S3) only SEEDS these flags; matching reads the four flags directly.
// Presentation-only: `editable` renders uncontrolled native checkboxes (the canonical on/off control
// [ESC-7B-SWITCH] is a pending kit addition — interim native control, no submission wiring); the
// read view shows on/off with icon + text (status never by colour alone). RSC-friendly.
import { Check, Minus } from "lucide-react";
import { cn } from "@/frontend/lib/cn";
import type { CapabilityFlags } from "./types";

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

export interface CapabilityMatrixProps {
  flags?: Partial<CapabilityFlags>;
  /** Render editable (uncontrolled) checkboxes vs a read-only on/off display. */
  editable?: boolean;
  /** Field-name prefix for editable inputs (presentation only — not wired to any write). */
  namePrefix?: string;
  className?: string;
}

export function CapabilityMatrix({
  flags,
  editable = false,
  namePrefix = "capability",
  className,
}: CapabilityMatrixProps) {
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
