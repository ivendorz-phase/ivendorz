// S5 Categories — vendor PROPOSES categories; Admin APPROVES out-of-wire (M2/Admin-governed). Status
// is proposed / active / removed; there is no vendor approval affordance and no rejection-reason
// inference. Matching-relevant content (DP5 banner). Limits (≤10 total, ≤5 primary) are service-
// enforced — shown as guidance only, never enforced here. Presentation-only: the proposal picker uses
// interim native checkboxes ([ESC-7B-SELECT] pending); no submission wiring.
import { Button } from "@/frontend/primitives/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/primitives/card";
import { CategoryAssignmentList } from "./category-assignment-list";
import { MatchingContextBanner } from "./matching-context-banner";
import { PresentationFormNote } from "../shared";
import type { CategoryAssignmentView, CategoryOption } from "./types";

export interface CategoriesPanelProps {
  assignments?: CategoryAssignmentView[];
  available?: CategoryOption[];
}

export function CategoriesPanel({ assignments, available }: CategoriesPanelProps) {
  return (
    <div className="space-y-6">
      <MatchingContextBanner>
        Categories determine which RFQs you can be matched to. An admin approves each proposal.
      </MatchingContextBanner>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your categories</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryAssignmentList assignments={assignments} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Propose categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Select categories to propose. You can hold up to 10 categories (max 5 primary); an admin
            reviews each proposal before it becomes active.
          </p>

          {available && available.length > 0 ? (
            <ul className="divide-y divide-border rounded-md border border-border">
              {available.map((category) => (
                <li key={category.category_id} className="flex items-start gap-3 p-3">
                  <input
                    type="checkbox"
                    id={`cat-${category.category_id}`}
                    name="propose_category"
                    value={category.category_id}
                    className="mt-0.5 size-5 shrink-0 rounded accent-iv-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  <label htmlFor={`cat-${category.category_id}`} className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-foreground">
                      {category.name}
                    </span>
                    {category.description ? (
                      <span className="block text-xs text-muted-foreground">
                        {category.description}
                      </span>
                    ) : null}
                  </label>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-md border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground">
              The category list loads here once connected.
            </p>
          )}

          <div className="flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
            <PresentationFormNote />
            <Button type="button" disabled>
              Propose selected
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
