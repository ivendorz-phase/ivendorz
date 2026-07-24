"use client";

// My Vendor Directory — category matcher (owner directive D5). PRESENTATION-ONLY client dialog.
//
// The system SUGGESTS; the buyer CONFIRMS — never a silent fuzzy bind (D5 UX-1). "Keep as text only"
// preserves the buyer's wording without claiming a system category (D5 UX-10). The taxonomy is the M2
// read (`marketplace.list_categories.v1`, Doc-4D §D7); "frequently used" is an org-private convenience
// (never a ranking, §4B). NO M2 category id is persisted in M4 (D5 boundary) — this dialog drives
// PRESENTATION + save-eligibility only.

import * as React from "react";
import { Search } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { Input } from "@/frontend/primitives/input";
import { Badge } from "@/frontend/primitives/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/frontend/primitives/dialog";
import { cn } from "@/frontend/lib/cn";
import {
  CATEGORY_CONFIDENCE_LABEL,
  categoryChildren,
  categoryName,
  ORG_FREQUENT_CATEGORY_IDS,
  rootCategories,
  suggestCategory,
  type CategoryConfidence,
} from "./offerings";

export interface CategoryMatcherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The buyer's entered offering text (preserved either way). */
  enteredText: string;
  onConfirm: (categoryId: string) => void;
  onKeepText: () => void;
}

const CONFIDENCE_VARIANT: Record<CategoryConfidence, "success" | "warning" | "neutral"> = {
  high: "success",
  possible: "warning",
  none: "neutral",
};

export function CategoryMatcherDialog({
  open,
  onOpenChange,
  enteredText,
  onConfirm,
  onKeepText,
}: CategoryMatcherDialogProps) {
  const [query, setQuery] = React.useState("");
  const suggestion = React.useMemo(() => suggestCategory(enteredText), [enteredText]);

  // Reset the search when the dialog re-opens for a new offering.
  React.useEffect(() => {
    if (open) setQuery("");
  }, [open, enteredText]);

  const q = query.trim().toLowerCase();
  const tree = React.useMemo(() => {
    const rows: { id: string; name: string; isChild: boolean }[] = [];
    for (const root of rootCategories()) {
      const children = categoryChildren(root.id);
      const rootMatch =
        !q ||
        root.name.toLowerCase().includes(q) ||
        children.some((child) => child.name.toLowerCase().includes(q));
      if (!rootMatch) continue;
      rows.push({ id: root.id, name: root.name, isChild: false });
      for (const child of children) {
        if (!q || child.name.toLowerCase().includes(q) || root.name.toLowerCase().includes(q)) {
          rows.push({ id: child.id, name: child.name, isChild: true });
        }
      }
    }
    return rows;
  }, [q]);

  function confirm(categoryId: string) {
    onConfirm(categoryId);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Match to a system category</DialogTitle>
          <DialogDescription>
            Entered text (preserved either way):{" "}
            <span className="font-medium text-foreground">“{enteredText}”</span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          {suggestion.categoryId ? (
            <div className="flex flex-wrap items-center gap-2 rounded-md border border-iv-navy-100 bg-iv-navy-50 px-3 py-2">
              <Badge variant={CONFIDENCE_VARIANT[suggestion.confidence]}>
                {CATEGORY_CONFIDENCE_LABEL[suggestion.confidence]}
              </Badge>
              <span className="font-medium text-foreground">
                {categoryName(suggestion.categoryId)}
              </span>
              <span className="flex-1" />
              <Button type="button" size="sm" onClick={() => confirm(suggestion.categoryId!)}>
                Confirm this category
              </Button>
            </div>
          ) : (
            <p className="rounded-md border border-dashed border-border px-3 py-2 text-sm text-muted-foreground">
              No confident match — search below or keep the text as-is.
            </p>
          )}

          <div>
            <p className="mb-1 text-2xs font-semibold uppercase tracking-wide text-muted-foreground">
              Frequently used by your organization
              <span className="ml-1 font-normal normal-case tracking-normal">
                · convenience only, never a ranking
              </span>
            </p>
            <div className="flex flex-wrap gap-1.5">
              {ORG_FREQUENT_CATEGORY_IDS.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => confirm(id)}
                  className="rounded-full border border-iv-navy-100 bg-iv-navy-50 px-2.5 py-1 text-xs font-medium text-iv-navy-700 transition-colors hover:bg-iv-navy-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {categoryName(id)}
                </button>
              ))}
            </div>
          </div>

          <label className="relative">
            <span className="sr-only">Search categories</span>
            <Search
              aria-hidden
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search active categories, or browse parent → child…"
              className="pl-9"
            />
          </label>

          <ul className="max-h-56 overflow-y-auto rounded-md border border-border">
            {tree.length === 0 ? (
              <li className="px-3 py-3 text-sm text-muted-foreground">
                No active category matches “{query}”. You can keep this as text only.
              </li>
            ) : (
              tree.map((node) => (
                <li
                  key={node.id}
                  className="flex items-center gap-2 border-b border-border px-3 py-1.5 last:border-b-0"
                >
                  <span
                    className={cn(
                      "text-sm",
                      node.isChild ? "pl-4 text-muted-foreground" : "font-medium text-foreground",
                    )}
                  >
                    {node.name}
                  </span>
                  <span className="flex-1" />
                  <Button type="button" variant="ghost" size="sm" onClick={() => confirm(node.id)}>
                    Use
                  </Button>
                </li>
              ))
            )}
          </ul>

          <p className="text-xs text-muted-foreground">
            The system suggests; you confirm. Matching binds no cross-module reference and stores no
            marketplace category id on the private record.
          </p>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              onKeepText();
              onOpenChange(false);
            }}
          >
            Keep as text only
          </Button>
          <DialogClose asChild>
            <Button type="button" variant="outline" size="sm">
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
