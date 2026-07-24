"use client";

// My Vendor Directory — Add Vendor (spec §5; owner directives D3/D5). PRESENTATION-ONLY client view.
//
// TWO SEPARATE JOURNEYS, never conflated (D4 / MINOR-1):
//   • Journey B — Search Marketplace → "Save vendor" is the friendly label for the SINGLE
//     `ops.set_vendor_favorite.v1` action (creates/reuses the relationship + sets the favourite). No
//     "Save then Prefer" pair; no private record is created and no M2 content is copied into M4.
//   • Journey A — Add Private Manually (or Paste) → `ops.create_private_vendor.v1` creates a directory
//     record with buyer-maintained products/services. Save-eligibility (D5): valid name + ≥1 CONFIRMED
//     system category; category matching is presentation-only (no M2 id persisted in M4).
// Add is open to any member (D4). Persistence is PARKED — creating updates local working state only.

import * as React from "react";
import { Search, Users, ClipboardPaste, Star, Plus, X, Info } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { Input } from "@/frontend/primitives/input";
import { Badge } from "@/frontend/primitives/badge";
import { Card, CardContent } from "@/frontend/primitives/card";
import { EmptyState } from "@/frontend/components/empty-state";
import { cn } from "@/frontend/lib/cn";
import { CategoryMatcherDialog } from "./category-matcher-dialog";
import { categoryName, MAX_OFFERINGS, privateVendorSaveEligibility } from "./offerings";
import type {
  CreatePrivateVendorInput,
  DirectoryOffering,
  DirectoryWorkingVendor,
  MarketplaceSearchVendor,
  SaveMarketplaceInput,
} from "./working-model";

export type AddVendorMethod = "search" | "manual" | "paste";

export interface AddVendorProps {
  method: "search" | "manual";
  onSelectMethod: (method: AddVendorMethod) => void;
  marketplaceCorpus: readonly MarketplaceSearchVendor[];
  existingVendors: readonly DirectoryWorkingVendor[];
  onSaveMarketplace: (input: SaveMarketplaceInput) => void;
  onCreatePrivate: (input: CreatePrivateVendorInput) => void;
  onOpenVendor: (id: string) => void;
}

const METHODS: {
  value: AddVendorMethod;
  title: string;
  description: string;
  journey: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
}[] = [
  {
    value: "search",
    title: "Search Marketplace Vendor",
    description: "Find a vendor already on iVendorz and save it to your directory.",
    journey: "Save vendor = ⭐ Preferred",
    icon: Search,
  },
  {
    value: "manual",
    title: "Add Private Vendor Manually",
    description: "Capture an off-platform company you work with — private to your organization.",
    journey: "Create private record",
    icon: Users,
  },
  {
    value: "paste",
    title: "Paste Vendor List",
    description: "Paste rows from Excel, Google Sheets or a Word table — review, then create many.",
    journey: "Client-side parse · batch review",
    icon: ClipboardPaste,
  },
];

function MethodChooser({
  method,
  onSelectMethod,
}: {
  method: AddVendorMethod;
  onSelectMethod: (method: AddVendorMethod) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {METHODS.map((entry) => {
        const Icon = entry.icon;
        const active = method === entry.value;
        return (
          <button
            key={entry.value}
            type="button"
            onClick={() => onSelectMethod(entry.value)}
            className={cn(
              "flex flex-col gap-2 rounded-lg border bg-card p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active ? "border-iv-navy-400 shadow-iv-sm" : "border-border hover:border-iv-navy-200",
            )}
          >
            <span className="inline-flex size-9 items-center justify-center rounded-md bg-iv-navy-50 text-iv-navy-700">
              <Icon aria-hidden className="size-4.5" />
            </span>
            <span className="text-sm font-semibold text-foreground">{entry.title}</span>
            <span className="text-xs text-muted-foreground">{entry.description}</span>
            <span className="mt-auto text-2xs font-semibold uppercase tracking-wide text-iv-navy-600">
              {entry.journey}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function SearchPanel({
  marketplaceCorpus,
  existingVendors,
  onSaveMarketplace,
  onOpenVendor,
  onSelectMethod,
}: Pick<
  AddVendorProps,
  "marketplaceCorpus" | "existingVendors" | "onSaveMarketplace" | "onOpenVendor" | "onSelectMethod"
>) {
  const [query, setQuery] = React.useState("");
  const q = query.trim().toLowerCase();
  const existingSlugs = new Set(
    existingVendors.map((vendor) => vendor.linkedProfile?.slug).filter(Boolean) as string[],
  );

  const ownHits = q
    ? existingVendors.filter(
        (vendor) =>
          vendor.name.toLowerCase().includes(q) ||
          (vendor.email ?? "").toLowerCase().includes(q) ||
          (vendor.phone ?? "").toLowerCase().includes(q),
      )
    : [];
  const marketplaceHits = q
    ? marketplaceCorpus.filter(
        (vendor) =>
          !existingSlugs.has(vendor.slug) &&
          (vendor.name.toLowerCase().includes(q) || vendor.category.toLowerCase().includes(q)),
      )
    : [];

  return (
    <div className="flex flex-col gap-3">
      <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
        <Info aria-hidden className="mt-0.5 size-3.5 shrink-0" />
        One search over the marketplace and your private list. Saving a marketplace vendor is the
        single <code className="rounded bg-muted px-1">set_vendor_favorite</code> action — it
        creates or reuses the relationship container and never copies profile content into your
        records.
      </p>
      <label className="relative">
        <span className="sr-only">Search vendors</span>
        <Search
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          value={query}
          autoFocus
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by company name, e.g. “Meghna”, “Bengal”, “Titas”…"
          className="pl-9"
        />
      </label>

      {q === "" ? (
        <p className="px-1 text-sm text-muted-foreground">
          Start typing to search the marketplace and your private list together.
        </p>
      ) : ownHits.length === 0 && marketplaceHits.length === 0 ? (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
          <Badge variant="neutral" className="bg-transparent">
            No match
          </Badge>
          <span className="text-sm text-muted-foreground">
            No marketplace vendor found for “{query}”. Add it as a private vendor instead.
          </span>
          <span className="flex-1" />
          <Button type="button" size="sm" onClick={() => onSelectMethod("manual")}>
            Add private vendor
          </Button>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {ownHits.map((vendor) => (
            <li
              key={vendor.id}
              className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card px-4 py-3"
            >
              <Badge variant="neutral" className="bg-transparent">
                In your list
              </Badge>
              <div className="min-w-0">
                <p className="font-medium text-foreground">{vendor.name}</p>
                <p className="text-xs text-muted-foreground">
                  {vendor.linkedProfile?.category ?? "Private vendor"} · already in your directory
                </p>
              </div>
              <span className="flex-1" />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenVendor(vendor.id)}
              >
                Open record
              </Button>
            </li>
          ))}
          {marketplaceHits.map((vendor) => (
            <li
              key={vendor.slug}
              className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card px-4 py-3"
            >
              <Badge variant="brand">Marketplace</Badge>
              {vendor.claimState === "verified" ? <Badge variant="success">Verified</Badge> : null}
              <div className="min-w-0">
                <p className="font-medium text-foreground">{vendor.name}</p>
                <p className="text-xs text-muted-foreground">
                  {vendor.category} · {vendor.location} · not in your directory yet
                </p>
              </div>
              <span className="flex-1" />
              <Button
                type="button"
                size="sm"
                title="ops.set_vendor_favorite.v1"
                onClick={() =>
                  onSaveMarketplace({
                    slug: vendor.slug,
                    name: vendor.name,
                    category: vendor.category,
                    location: vendor.location,
                    verified: vendor.verified,
                    claimState: vendor.claimState,
                  })
                }
              >
                <Star aria-hidden />
                Save vendor
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

let offeringSeq = 0;

function ManualPanel({ onCreatePrivate }: Pick<AddVendorProps, "onCreatePrivate">) {
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [contactPerson, setContactPerson] = React.useState("");
  const [designation, setDesignation] = React.useState("");
  const [website, setWebsite] = React.useState("");
  const [city, setCity] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [offerings, setOfferings] = React.useState<DirectoryOffering[]>([]);
  const [draft, setDraft] = React.useState("");
  const [matcherFor, setMatcherFor] = React.useState<string | null>(null);

  const eligibility = privateVendorSaveEligibility(name, offerings);
  const matcherTarget = offerings.find((offering) => offering.id === matcherFor);

  function addOffering() {
    const label = draft.trim();
    if (!label || offerings.length >= MAX_OFFERINGS) return;
    const id = `off_local_${offeringSeq++}`;
    setOfferings((current) => [...current, { id, label }]);
    setDraft("");
    setMatcherFor(id); // prompt to match immediately (system suggests; buyer confirms)
  }

  function updateOffering(id: string, patch: Partial<DirectoryOffering>) {
    setOfferings((current) =>
      current.map((offering) => (offering.id === id ? { ...offering, ...patch } : offering)),
    );
  }

  function removeOffering(id: string) {
    setOfferings((current) => current.filter((offering) => offering.id !== id));
  }

  function submit() {
    if (!eligibility.ok) return;
    onCreatePrivate({
      name,
      phone,
      email,
      contactPerson,
      designation,
      website,
      city,
      notes,
      offerings,
      source: "manual",
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
        <Info aria-hidden className="mt-0.5 size-3.5 shrink-0" />
        Only name, phone and email are frozen fields; the rest ride the interim details envelope
        (R5). Products &amp; services + category matching are presentation-only — no marketplace
        category id is stored on the record.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 sm:col-span-2">
          <span className="text-sm font-medium text-foreground">
            Company name <span className="text-iv-danger-base">*</span>
          </span>
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Rupsha Gasket & Seals"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-foreground">Phone</span>
          <Input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="+880 …"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-foreground">Email</span>
          <Input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="sales@company.example"
          />
        </label>
      </div>

      {/* Products & services editor (≤10, D5) */}
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-sm font-semibold text-foreground">
            Core Products &amp; Services
          </span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-2xs font-semibold tabular-nums",
              offerings.length > MAX_OFFERINGS
                ? "bg-iv-danger-subtle text-iv-danger-muted"
                : "bg-muted text-muted-foreground",
            )}
          >
            {offerings.length} of {MAX_OFFERINGS}
          </span>
        </div>
        <div className="flex gap-2">
          <Input
            value={draft}
            disabled={offerings.length >= MAX_OFFERINGS}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addOffering();
              }
            }}
            placeholder="Add a product or service, e.g. “SS tank fabrication”"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={offerings.length >= MAX_OFFERINGS}
            onClick={addOffering}
          >
            Add
          </Button>
        </div>
        {offerings.length === 0 ? (
          <EmptyState
            title="No products or services yet"
            description="Add at least one and confirm a system category to save."
            className="py-6"
          />
        ) : (
          <ul className="flex flex-col gap-2">
            {offerings.map((offering) => {
              const category = categoryName(offering.categoryId);
              return (
                <li
                  key={offering.id}
                  className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-card px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{offering.label}</p>
                    <p className="text-xs">
                      {offering.textOnly ? (
                        <span className="text-muted-foreground">
                          Text only · no system category
                        </span>
                      ) : category ? (
                        <span className="text-iv-navy-700">✓ {category}</span>
                      ) : (
                        <span className="text-iv-warning-muted">No category confirmed yet</span>
                      )}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setMatcherFor(offering.id)}
                  >
                    {offering.categoryId ? "Change" : "Match"}
                  </Button>
                  <button
                    type="button"
                    aria-label={`Remove ${offering.label}`}
                    onClick={() => removeOffering(offering.id)}
                    className="rounded-sm p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <X aria-hidden className="size-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Progressive disclosure (D5 UX-14) */}
      <details className="rounded-md border border-border">
        <summary className="cursor-pointer px-3 py-2 text-sm font-medium text-iv-navy-700">
          Add more company information
        </summary>
        <div className="grid gap-4 border-t border-border p-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-foreground">Contact person</span>
            <Input
              value={contactPerson}
              onChange={(event) => setContactPerson(event.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-foreground">Designation</span>
            <Input value={designation} onChange={(event) => setDesignation(event.target.value)} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-foreground">Website</span>
            <Input value={website} onChange={(event) => setWebsite(event.target.value)} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-foreground">City / district</span>
            <Input value={city} onChange={(event) => setCity(event.target.value)} />
          </label>
          <label className="flex flex-col gap-1 sm:col-span-2">
            <span className="text-sm font-medium text-foreground">Internal notes</span>
            <Input value={notes} onChange={(event) => setNotes(event.target.value)} />
          </label>
        </div>
      </details>

      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
        <div className="min-w-0 flex-1 text-xs">
          {eligibility.ok ? (
            <span className="font-medium text-iv-success-muted">
              Ready to save. Contact details are optional — you can add them later.
            </span>
          ) : (
            <div>
              <span className="font-semibold text-iv-danger-muted">Can’t save yet:</span>
              <ul className="mt-1 flex flex-col gap-0.5">
                {eligibility.reasons.map((reason) => (
                  <li key={reason} className="flex items-start gap-1.5 text-iv-danger-muted">
                    <span aria-hidden>•</span>
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <Button type="button" size="sm" disabled={!eligibility.ok} onClick={submit}>
          <Plus aria-hidden />
          Save vendor
        </Button>
      </div>

      <CategoryMatcherDialog
        open={matcherFor !== null}
        onOpenChange={(open) => !open && setMatcherFor(null)}
        enteredText={matcherTarget?.label ?? ""}
        onConfirm={(categoryId) =>
          matcherFor && updateOffering(matcherFor, { categoryId, textOnly: false })
        }
        onKeepText={() =>
          matcherFor && updateOffering(matcherFor, { textOnly: true, categoryId: undefined })
        }
      />
    </div>
  );
}

export function AddVendor({
  method,
  onSelectMethod,
  marketplaceCorpus,
  existingVendors,
  onSaveMarketplace,
  onCreatePrivate,
  onOpenVendor,
}: AddVendorProps) {
  return (
    <div className="flex flex-col gap-5">
      <MethodChooser method={method} onSelectMethod={onSelectMethod} />
      <Card>
        <CardContent className="p-4">
          {method === "search" ? (
            <SearchPanel
              marketplaceCorpus={marketplaceCorpus}
              existingVendors={existingVendors}
              onSaveMarketplace={onSaveMarketplace}
              onOpenVendor={onOpenVendor}
              onSelectMethod={onSelectMethod}
            />
          ) : (
            <ManualPanel onCreatePrivate={onCreatePrivate} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
