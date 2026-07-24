"use client";

// My Vendor Directory — the D4 AUTHORITY-MODEL persona (owner directive, BINDING). PRESENTATION-ONLY.
//
// Owner ruling: any active org member may ADD a vendor; REMOVAL-LIKE actions (remove from Preferred,
// archive, unlink) are for a higher-authority member only; no hard delete exists anywhere. Today the
// SAME frozen slug `can_manage_private_vendors` (Doc-2 §7 — granted to O,D,M,F) governs both add and
// those actions, so the asymmetry is NOT expressible under frozen permissions — it needs a Doc-2 §7
// ADDITIVE ruling (a distinct removal/lifecycle slug or an org-role threshold). Until that ruling this
// persona is a PRESENTATION DEMO of the intended model: it gates the VISIBILITY of removal-like
// affordances only, mints NO permission name, and maps to NO specific org role (labels are neutral).
// The real gate re-validates server-side at wiring (Inv #7). This is never enforcement.

import * as React from "react";
import { cn } from "@/frontend/lib/cn";

export type DirectoryPersona = "member" | "authorized";

const PersonaContext = React.createContext<DirectoryPersona>("authorized");

/** True when the current persona may perform removal-like actions (remove ⭐ / archive / unlink). */
export function usePersonaCanRemove(): boolean {
  return React.useContext(PersonaContext) === "authorized";
}

export function DirectoryPersonaProvider({
  persona,
  children,
}: {
  persona: DirectoryPersona;
  children: React.ReactNode;
}) {
  return <PersonaContext.Provider value={persona}>{children}</PersonaContext.Provider>;
}

const OPTIONS: { value: DirectoryPersona; label: string }[] = [
  { value: "member", label: "Ordinary member" },
  { value: "authorized", label: "Authorized member" },
];

/**
 * Segmented persona control (demo only). Neutral labels — the real role threshold is a pending Doc-2
 * §7 additive ruling and is never mapped to a specific org role here.
 */
export function PersonaToggle({
  value,
  onChange,
  className,
}: {
  value: DirectoryPersona;
  onChange: (persona: DirectoryPersona) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div
        role="group"
        aria-label="Demo persona (authority model)"
        className="inline-flex items-center gap-0.5 rounded-md border border-border bg-muted p-0.5"
      >
        {OPTIONS.map((option) => {
          const active = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(option.value)}
              className={cn(
                "rounded-sm px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active
                  ? "bg-card text-foreground shadow-iv-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      <p className="text-2xs text-muted-foreground">
        Demo only — the role threshold for removal-like actions is a pending Doc-2 §7 ruling.
      </p>
    </div>
  );
}
