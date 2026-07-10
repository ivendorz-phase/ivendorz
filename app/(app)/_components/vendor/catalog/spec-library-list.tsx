// P-VND-09 Spec Library (Listing) — reusable specification library entries
// (`marketplace.spec_library_entries`, Doc-2 §10.3 row 741: `name, summary`, optional category FK).
// Distinct from P-VND-10 Spec documents (the versioned FILES attached per entry, gated on
// `ESC-7-API/upload`) and from the per-product spec panel (S7 tab, which shows a product's linked
// spec DOCUMENTS, not this org-level library of reusable entries). Create/edit both happen through
// `SpecEntryDialog` per the screen spec's "Dialogs: edit" delta (Doc-4D PassB §D7.2:
// `create_spec_library_entry.v1` / `update_spec_library_entry.v1`) — no separate create route, unlike
// Ads. Search + pagination are wired UI, disabled in the presentation phase (no live reads yet).
// RSC-friendly (Dialog/PaginationControl are client primitives but need no client state here).
import { Plus, Search } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { Input } from "@/frontend/primitives/input";
import { Card, CardContent } from "@/frontend/primitives/card";
import { EmptyState } from "@/frontend/components/empty-state";
import { PaginationControl } from "@/frontend/components/pagination-control";
import { SpecEntryDialog } from "./spec-entry-dialog";
import type { SpecLibraryEntryView } from "./types";

export interface SpecLibraryListProps {
  entries?: SpecLibraryEntryView[];
}

export function SpecLibraryList({ entries }: SpecLibraryListProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full sm:w-64">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            placeholder="Search spec entries"
            aria-label="Search spec entries"
            className="pl-8"
            disabled
          />
        </div>
        <SpecEntryDialog
          trigger={
            <Button type="button">
              <Plus aria-hidden="true" className="size-4" /> New entry
            </Button>
          }
        />
      </div>

      {entries && entries.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {entries.map((entry) => (
                <li key={entry.id} className="flex items-center gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {entry.name ?? "Untitled entry"}
                    </p>
                    {entry.summary ? (
                      <p className="truncate text-xs text-muted-foreground">{entry.summary}</p>
                    ) : null}
                  </div>
                  <SpecEntryDialog
                    entry={entry}
                    trigger={
                      <Button type="button" variant="ghost" size="sm">
                        Edit
                      </Button>
                    }
                  />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          title="No spec entries"
          description="Add a reusable specification entry. Once created, link it to any product from the product editor."
        />
      )}

      <PaginationControl hasMore={false} disabled />
    </div>
  );
}
