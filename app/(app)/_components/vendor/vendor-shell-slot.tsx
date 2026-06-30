"use client";

// Placeholders for APP-SHELL-OWNED slots that the Vendor Workspace composes but does NOT own.
// Per Doc-7C SR3/SR6 + Doc-7G GR12 (composition firewall) and CHK-7-005, the Vendor Workspace
// MUST consume the shell-provided org switcher, notification center and user menu via a slot and
// NEVER re-implement them (M6 owns notification delivery; Doc-7C owns the switcher + session).
// During the presentation phase these render as inert, clearly-labelled placeholders; real slot
// content is injected in the integration phase. This is the "temporary presentation placeholder
// where a Board-/owner-decision affects rendering" required by the Team-3 charter.
import type { LucideIcon } from "lucide-react";
import { cn } from "@/frontend/lib/cn";
import { Button } from "@/frontend/primitives/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/frontend/primitives/tooltip";

export interface ShellSlotPlaceholderProps {
  icon: LucideIcon;
  /** Accessible name + tooltip text, e.g. "Notifications". */
  label: string;
  className?: string;
}

/** Inert icon-button placeholder for a shell-owned header affordance. Requires a TooltipProvider. */
export function ShellSlotPlaceholder({ icon: Icon, label, className }: ShellSlotPlaceholderProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`${label} (provided by the app shell)`}
          aria-disabled="true"
          data-shell-slot="placeholder"
          className={className}
        >
          <Icon aria-hidden="true" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label} — provided by the app shell</TooltipContent>
    </Tooltip>
  );
}

/**
 * Bn/En locale control placeholder (companion §2.7 canonical placements: Settings + shell
 * user-menu + mobile drawer). Locale ownership is the app shell's ([ESC-7C-LOCALE], pending);
 * this carries NO behaviour during the presentation phase.
 */
export function LocaleTogglePlaceholder({ className }: { className?: string }) {
  return (
    <div
      role="group"
      aria-label="Language: English / Bangla (provided by the app shell)"
      data-shell-slot="locale"
      className={cn(
        "inline-flex items-center rounded-md border border-border p-0.5 text-xs",
        className,
      )}
    >
      <span className="rounded-sm bg-accent px-2 py-1 font-medium text-accent-foreground">EN</span>
      <span className="px-2 py-1 text-muted-foreground">বাং</span>
    </div>
  );
}
