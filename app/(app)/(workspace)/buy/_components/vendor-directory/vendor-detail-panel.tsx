"use client";

// My Vendor Directory — vendor detail (spec §7). PRESENTATION-ONLY client view.
//
// Composes the two frozen aggregates (Private Vendor Record + Buyer–Supplier Relationship) + the D5
// offerings + the linked M2 profile. Load-bearing governance:
//   • D1(a): ⭐ Preferred + buyer status exist ONLY for a LINKED record; an unlinked vendor shows the
//     "link to prefer / set status" affordance (notes + rating stay available).
//   • D4: Archive/Unlink are removal-like → authorized member only; Add-note/Add-rating/Edit are open.
//     NO hard-delete control exists. Persistence is PARKED (disabled or dialog-confirmed local state):
//     status → `can_manage_vendor_status`; notes/ratings/favourite/link → `can_manage_private_vendors`
//     (distinct slugs, never collapsed, Doc-2 §7).
//   • Products & Services: marketplace offerings are READ from the M2 profile (never copied); private
//     offerings are buyer-maintained. Buyer-private throughout (Inv #11); blacklist undetectable.

import * as React from "react";
import { Info, Link2, Pencil, Archive, RotateCcw, StickyNote, Star } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/primitives/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/frontend/primitives/tabs";
import { EmptyState } from "@/frontend/components/empty-state";
import { StatusChip } from "@/frontend/components/status-chip";
import { PageHeader, Breadcrumbs } from "../../../../_components/shell";
import { DescriptionList, type DescriptionItem } from "../description-list";
import { buyerVendorStatusDisplay, privateVendorLinkStatusDisplay } from "../state-display";
import type { PrivateVendorSource } from "../view-models";
import { OriginBadge } from "./origin-badge";
import { PreferredStar } from "./preferred-star";
import { ProductsServices } from "./products-services";
import { StarRatingInput } from "./star-rating-input";
import { usePersonaCanRemove } from "./directory-persona";
import { canBePreferred, type DirectoryWorkingVendor } from "./working-model";

const SOURCE_LABEL: Record<PrivateVendorSource, string> = {
  manual: "Added manually",
  email_list: "Email list",
  excel: "Pasted / imported",
};

function formatDate(iso: string): string {
  const parsed = new Date(iso);
  return Number.isNaN(parsed.getTime())
    ? iso
    : parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export interface VendorDetailPanelProps {
  vendor: DirectoryWorkingVendor;
  onSetPreferred: (vendor: DirectoryWorkingVendor) => void;
  onRequestRemovePreferred: (vendor: DirectoryWorkingVendor) => void;
  onRequestArchive: (vendor: DirectoryWorkingVendor) => void;
  onRestore: (vendor: DirectoryWorkingVendor) => void;
}

function MyRatingTab({ vendor }: { vendor: DirectoryWorkingVendor }) {
  // Presentation-only: the value round-trips through local state; nothing persists (parked
  // `ops.set_private_vendor_rating.v1`). Seeds from the record's existing rating.
  const [score, setScore] = React.useState(vendor.ratings[0]?.score ?? 0);
  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle className="text-sm font-semibold">My rating</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 p-4 pt-0">
        <div className="flex items-center gap-3">
          <StarRatingInput value={score} onChange={setScore} />
          <span className="text-sm text-muted-foreground">
            {score ? `${score} / 5` : "Not rated"}
          </span>
        </div>
        {vendor.ratings[0]?.comment ? (
          <p className="text-sm text-muted-foreground">“{vendor.ratings[0].comment}”</p>
        ) : null}
        <div className="flex items-center gap-2">
          <Button type="button" variant="secondary" size="sm" disabled>
            Save rating
          </Button>
          <span className="text-xs text-muted-foreground">
            Buyer-private · one rating per record · never shown to the vendor. Saving connects in
            the integration phase.
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export function VendorDetailPanel({
  vendor,
  onSetPreferred,
  onRequestRemovePreferred,
  onRequestArchive,
  onRestore,
}: VendorDetailPanelProps) {
  const canRemove = usePersonaCanRemove();
  const classifiable = canBePreferred(vendor);
  const link = privateVendorLinkStatusDisplay(vendor.linkStatus);
  const status = buyerVendorStatusDisplay(vendor.currentStatus);

  const contactItems: DescriptionItem[] = [
    { label: "Contact person", value: vendor.details?.contactPerson ?? "—" },
    { label: "Designation", value: vendor.details?.designation ?? "—" },
    { label: "Phone", value: vendor.phone ?? "—" },
    { label: "Email", value: vendor.email ?? "—" },
    { label: "WhatsApp", value: vendor.details?.whatsapp ?? "—" },
    { label: "Website", value: vendor.details?.website ?? "—" },
    {
      label: "Location",
      value: [vendor.details?.city, vendor.details?.district].filter(Boolean).join(" · ") || "—",
    },
    { label: "Source", value: SOURCE_LABEL[vendor.source] },
    { label: "Link status", value: <StatusChip label={link.label} tone={link.tone} /> },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumbs
        items={[
          { label: "My Vendor Directory", href: "/buy/saved-vendors" },
          { label: vendor.name },
        ]}
      />

      <PageHeader
        title={vendor.name}
        meta={
          <>
            <OriginBadge origin={vendor.origin} />
            {vendor.linkedProfile?.claimState === "verified" ? (
              <StatusChip label="Verified" tone="success" />
            ) : null}
            {classifiable ? (
              <StatusChip label={status.label} tone={status.tone} />
            ) : (
              <span className="text-xs text-muted-foreground">Status: link to set</span>
            )}
            {vendor.state === "archived" ? (
              <span className="text-xs text-muted-foreground">Archived</span>
            ) : null}
          </>
        }
        actions={
          <div className="flex items-center gap-2">
            <PreferredStar
              vendor={vendor}
              size="md"
              onSetPreferred={onSetPreferred}
              onRequestRemovePreferred={onRequestRemovePreferred}
            />
            <Button type="button" variant="outline" size="sm" disabled>
              <Pencil aria-hidden />
              Edit
            </Button>
            {/* D4: removal-like actions are authorized-only; no hard delete anywhere. */}
            {canRemove && vendor.state === "active" ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onRequestArchive(vendor)}
              >
                <Archive aria-hidden />
                Archive
              </Button>
            ) : null}
            {canRemove && vendor.state === "archived" ? (
              <Button type="button" variant="outline" size="sm" onClick={() => onRestore(vendor)}>
                <RotateCcw aria-hidden />
                Restore
              </Button>
            ) : null}
          </div>
        }
      />

      {/* Suggested-link panel (spec §7) — nothing links automatically; the buyer confirms. */}
      {vendor.linkStatus === "suggested" && vendor.suggestedProfile ? (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-iv-navy-100 bg-iv-navy-50 px-4 py-3">
          <Link2 aria-hidden className="size-5 text-iv-navy-600" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-iv-navy-800">
              This vendor may have joined iVendorz
            </p>
            <p className="text-xs text-muted-foreground">
              A marketplace profile looks like a match. Review &amp; link — nothing links
              automatically, and the suggestion is never shown to the vendor.
            </p>
          </div>
          <Button type="button" variant="secondary" size="sm" disabled>
            Review &amp; link
          </Button>
          {canRemove ? (
            <Button type="button" variant="ghost" size="sm" disabled>
              Dismiss
            </Button>
          ) : null}
        </div>
      ) : null}

      <Tabs defaultValue="profile">
        <TabsList className="flex-wrap">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="rating">My Rating</TabsTrigger>
          <TabsTrigger value="status">Status history</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="flex flex-col gap-4">
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-semibold">Contact</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <DescriptionList items={contactItems} />
              <p className="mt-3 flex items-start gap-1.5 text-xs text-muted-foreground">
                <Info aria-hidden className="mt-0.5 size-3.5 shrink-0" />
                Extended fields are held in the interim details envelope (gated, ESC-VENDIR-FIELDS
                R5).
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <ProductsServices
                offerings={vendor.offerings}
                source={vendor.offeringSource}
                profileSlug={vendor.linkedProfile?.slug}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 p-4">
              <CardTitle className="text-sm font-semibold">Notes</CardTitle>
              <Button type="button" variant="secondary" size="sm" disabled>
                Add note
              </Button>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              {vendor.notes.length > 0 ? (
                <ul className="flex flex-col divide-y divide-border">
                  {vendor.notes.map((note) => (
                    <li
                      key={note.id}
                      className="flex items-start gap-2 py-2 text-sm text-foreground"
                    >
                      <StickyNote
                        aria-hidden
                        className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                      />
                      <span>{note.note}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState title="No notes yet" className="py-8" />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rating">
          <MyRatingTab vendor={vendor} />
        </TabsContent>

        <TabsContent value="status">
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-semibold">Status history</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 p-4 pt-0">
              {!classifiable ? (
                <EmptyState
                  icon={<Link2 aria-hidden />}
                  title="Buyer status needs a marketplace link"
                  description="Approved / Conditional / Blacklisted key on a marketplace profile — an unlinked private vendor can't hold a status yet. Link it to a marketplace profile to prefer or set status. Notes and rating stay available."
                  className="py-8"
                />
              ) : vendor.statusHistory.length > 0 ? (
                <>
                  <ol className="flex flex-col divide-y divide-border">
                    {vendor.statusHistory
                      .slice()
                      .reverse()
                      .map((entry) => {
                        const display = buyerVendorStatusDisplay(entry.status);
                        return (
                          <li key={entry.id} className="flex items-center gap-3 py-2 text-sm">
                            <span className="w-28 shrink-0 text-xs text-muted-foreground">
                              {formatDate(entry.at)}
                            </span>
                            <StatusChip label={display.label} tone={display.tone} />
                          </li>
                        );
                      })}
                  </ol>
                  <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                    <Info aria-hidden className="mt-0.5 size-3.5 shrink-0" />
                    Append-only — history is never overwritten (Inv #8). Buyer-private; the vendor
                    never sees it and a blacklist is undetectable.
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No status set. Set Approved / Conditional / Blacklisted from this record — each
                  change appends a history row.
                </p>
              )}
              {classifiable ? (
                <div className="flex flex-wrap items-center gap-2">
                  <Button type="button" variant="secondary" size="sm" disabled>
                    Set status
                  </Button>
                  {vendor.currentStatus !== "none" ? (
                    <Button type="button" variant="ghost" size="sm" disabled>
                      Clear status
                    </Button>
                  ) : null}
                  <span className="text-xs text-muted-foreground">
                    Managing status connects in the integration phase.
                  </span>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Star aria-hidden className="size-3.5 shrink-0" />
        Your directory — favourites, status, notes and ratings — is private to your organization and
        is never shown to vendors.
      </p>
    </div>
  );
}
