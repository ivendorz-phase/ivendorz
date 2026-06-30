"use client";

// Platform shell — org-switcher (Doc-7C SR3/§4.8 · IA §4.8). PRESENTATION ONLY: renders the active org +
// switchable list from props. The switch MECHANISM is Doc-7C-owned and non-trivial — selecting an org
// calls `switch_active_organization` (Doc-5C §C8), then the shell re-resolves `get_active_context`,
// re-derives the navigable surface set, and re-renders, server-re-validated before any tenant surface
// renders. That wiring is DEFERRED; here the items are presentation only. Reuses the frozen kit DropdownMenu.
import { Building2, Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/frontend/primitives/dropdown-menu";
import type { ShellOrg } from "./types";

export function OrgSwitcher({
  activeOrg,
  organizations,
}: {
  activeOrg: ShellOrg;
  organizations: ShellOrg[];
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="max-w-[220px] gap-2">
          <Building2 className="size-4 shrink-0" aria-hidden="true" />
          <span className="truncate font-medium">{activeOrg.name}</span>
          <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Organizations</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {organizations.map((org) => {
          const active = org.id === activeOrg.id;
          return (
            <DropdownMenuItem key={org.id} aria-current={active ? "true" : undefined}>
              <Building2 className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span className="truncate">{org.name}</span>
              {active ? <Check className="ml-auto size-4 shrink-0" aria-hidden="true" /> : null}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
