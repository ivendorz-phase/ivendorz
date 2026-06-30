"use client";

// Platform shell — Quick Create (IA §4.9). A `+ Create` menu of role-scoped actions. PRESENTATION ONLY:
// each item maps to a WIRED command (e.g. New RFQ → `create_rfq` Doc-5E §4; Add Product → `create_product`
// BC-MKT-3; Invite Team Member → `invite_member` Doc-5C §C6) supplied per workspace and gated by
// permission/entitlement (IA §4.1; Invariant #10) — that wiring is DEFERRED. Never bypasses a governed
// flow (e.g. it never offers "invite a vendor to an RFQ" — engine-generated, R6). Reuses the kit DropdownMenu.
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/frontend/primitives/dropdown-menu";
import { NAV_ICONS } from "./icons";
import type { QuickCreateItem } from "./types";

export function QuickCreate({ items }: { items: QuickCreateItem[] }) {
  if (items.length === 0) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus />
          <span className="hidden sm:inline">Create</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Create</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.map((item) => {
          const Icon = item.icon ? NAV_ICONS[item.icon] : null;
          if (item.href && !item.disabled) {
            return (
              <DropdownMenuItem key={item.label} asChild>
                <Link href={item.href}>
                  {Icon ? <Icon aria-hidden="true" /> : null} {item.label}
                </Link>
              </DropdownMenuItem>
            );
          }
          return (
            <DropdownMenuItem key={item.label} disabled>
              {Icon ? <Icon aria-hidden="true" /> : null} {item.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
