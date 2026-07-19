"use client";

// Sidebar workspace identity header (owner-directed, 2026-07-18). A PASSIVE visual identifier of the
// active workspace pinned above the first nav section — NOT a switcher: it is not clickable, has no
// toggle/dropdown, and switching stays in the top-right Workspace Switcher. Icon + title come from the
// workspace registry, so it updates automatically when the active workspace changes and both variants
// share identical styling/dimensions (only the icon + label differ).
//
// COLLAPSE: on the 64px icon rail the sidebar wrapper carries `data-collapsed="true"` and marks itself
// a `group`; the title hides and the icon centres via `group-data-[collapsed=true]:*` — no collapsed
// state needs threading in.
import { useWorkspace } from "./workspace-context";

export function WorkspaceSidebarHeader() {
  const { config } = useWorkspace();
  const Icon = config.icon;
  return (
    <div
      // Not a link/button — a static identity strip.
      className="flex items-center gap-2.5 border-b border-iv-nav-border px-3 py-3 group-data-[collapsed=true]:justify-center group-data-[collapsed=true]:px-0"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-iv-brand-50 text-iv-brand-600">
        <Icon aria-hidden className="size-[18px]" />
      </span>
      <span className="min-w-0 group-data-[collapsed=true]:hidden">
        <span className="block truncate text-sm font-semibold leading-tight text-foreground">
          {config.workspaceLabel}
        </span>
        <span className="block truncate text-xs leading-tight text-muted-foreground">
          {config.subtitle}
        </span>
      </span>
    </div>
  );
}
