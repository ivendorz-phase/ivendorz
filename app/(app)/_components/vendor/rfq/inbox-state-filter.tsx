// S2 Invitation Inbox — own-quotation-state filter chips (URL-driven; navigation, not state).
//
// The vendor sidebar's "Make Offer" / "Saved Offers" entries deep-link the inbox at
// `/sell/rfqs?state=draft` / `?state=submitted`; this row makes that URL state visible and
// clearable. The URL is the single source of truth: each chip is a plain Link that sets (or clears)
// the allowlisted `?state=` param — no client state, no hooks (RSC-friendly), the documents hub's
// ViewChips idiom. The filter reads the vendor's OWN quotation state only
// (`InboxItemView.quotation_state`, frozen Doc-4M tokens — own-record fact, ND-2/ND-3); it never
// filters on a competitor or matching signal.
import Link from "next/link";
import { Button } from "@/frontend/primitives/button";
import type { QuotationState } from "./types";

/** Allowlisted `?state=` values — a frozen Doc-4M `QuotationState` SUBSET (nothing coined). Anything
 *  else in the URL ⇒ All (the documents-hub URL-param convention). */
export const INBOX_STATE_FILTERS = [
  "draft",
  "submitted",
] as const satisfies readonly QuotationState[];

export type InboxStateFilterKey = (typeof INBOX_STATE_FILTERS)[number];

/** Resolve a raw `?state=` search-param value against the allowlist (anything else ⇒ undefined). */
export function parseInboxStateFilter(value: string | undefined): InboxStateFilterKey | undefined {
  return INBOX_STATE_FILTERS.includes(value as InboxStateFilterKey)
    ? (value as InboxStateFilterKey)
    : undefined;
}

/** Human labels for the filter chips — display copy only; the state TOKEN stays the frozen value. */
export const INBOX_STATE_FILTER_LABELS: Record<InboxStateFilterKey, string> = {
  draft: "Draft offers",
  submitted: "Submitted offers",
};

export interface InboxStateFilterProps {
  active?: InboxStateFilterKey;
  /** Temporary A7-neutral mount prefix (see workspace layout); dropped post-A7. */
  basePath?: string;
}

export function InboxStateFilter({ active, basePath = "/sell" }: InboxStateFilterProps) {
  const chips = [
    { key: "all" as const, label: "All invitations", href: `${basePath}/rfqs` },
    ...INBOX_STATE_FILTERS.map((key) => ({
      key,
      label: INBOX_STATE_FILTER_LABELS[key],
      href: `${basePath}/rfqs?state=${key}`,
    })),
  ];
  return (
    <nav
      aria-label="Filter invitations by your offer state"
      className="flex flex-wrap items-center gap-2"
    >
      {chips.map((chip) => {
        const isActive = chip.key === "all" ? !active : active === chip.key;
        return (
          <Button
            key={chip.key}
            asChild
            size="sm"
            variant={isActive ? "secondary" : "ghost"}
            aria-current={isActive ? "page" : undefined}
          >
            <Link href={chip.href}>{chip.label}</Link>
          </Button>
        );
      })}
    </nav>
  );
}
