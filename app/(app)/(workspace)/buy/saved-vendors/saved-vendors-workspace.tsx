"use client";

// My Vendor Directory — the interactive workspace (spec §4–§7; owner directives D1(a)/D3/D4/D5).
// PRESENTATION-ONLY. Seeds working state from the SERVER-composed snapshot (the frozen-read seam) and
// reproduces the approved prototype's live UX over the production data layer. Persistence is PARKED:
// star / archive / create update LOCAL working state only (reset on reload) — the frozen writes
// (`set/clear_vendor_favorite`, `archive_private_vendor`, `create_private_vendor`) wire at Wave 5.
//
// URL-DRIVEN view state (shareable): `?view=` (list), `?vendor=` (detail), `?add=` (add flow). Working
// state persists across those client navigations (the workspace stays mounted). Buyer-private
// throughout (Inv #11); D1(a) linked-only preferring + D4 authorized-only removal are enforced in the
// shared components below.

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { PageHeader } from "../../../_components/shell";
import {
  DirectoryPersonaProvider,
  PersonaToggle,
  type DirectoryPersona,
} from "../_components/vendor-directory/directory-persona";
import { DirectoryList } from "../_components/vendor-directory/directory-list";
import { VendorDetailPanel } from "../_components/vendor-directory/vendor-detail-panel";
import { AddVendor, type AddVendorMethod } from "../_components/vendor-directory/add-vendor";
import { PasteWizard } from "../_components/vendor-directory/paste-wizard";
import {
  RemovePreferredDialog,
  ArchiveDialog,
} from "../_components/vendor-directory/directory-dialogs";
import type {
  DirectoryChip,
  DirectoryView,
} from "../_components/vendor-directory/vendor-directory-view-models";
import { categoryName } from "../_components/vendor-directory/offerings";
import type { PasteRow } from "../_components/vendor-directory/paste-import";
import {
  buildMarketplaceWorkingVendor,
  buildPrivateWorkingVendor,
  canBePreferred,
  selectDirectoryRows,
  viewCounts,
  type CreatePrivateVendorInput,
  type DirectoryWorkingVendor,
  type MarketplaceSearchVendor,
  type SaveMarketplaceInput,
} from "../_components/vendor-directory/working-model";

const VIEWS: DirectoryView[] = ["all", "marketplace", "private", "preferred", "archived"];
const ADD_METHODS: AddVendorMethod[] = ["search", "manual", "paste"];

export interface SavedVendorsWorkspaceProps {
  initialVendors: DirectoryWorkingVendor[];
  marketplaceCorpus: MarketplaceSearchVendor[];
}

export function SavedVendorsWorkspace({
  initialVendors,
  marketplaceCorpus,
}: SavedVendorsWorkspaceProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [vendors, setVendors] = React.useState<DirectoryWorkingVendor[]>(initialVendors);
  const [persona, setPersona] = React.useState<DirectoryPersona>("authorized");
  const [chips, setChips] = React.useState<DirectoryChip[]>([]);
  const [removeTarget, setRemoveTarget] = React.useState<DirectoryWorkingVendor | null>(null);
  const [archiveTarget, setArchiveTarget] = React.useState<DirectoryWorkingVendor | null>(null);
  const idSeq = React.useRef(1);

  // ── URL-derived route ──
  const viewParam = searchParams.get("view");
  const view: DirectoryView = VIEWS.includes(viewParam as DirectoryView)
    ? (viewParam as DirectoryView)
    : "all";
  const vendorId = searchParams.get("vendor");
  const addParam = searchParams.get("add");
  const addMethod: AddVendorMethod | null = ADD_METHODS.includes(addParam as AddVendorMethod)
    ? (addParam as AddVendorMethod)
    : addParam !== null
      ? "search"
      : null;

  function navigate(next: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value === null) params.delete(key);
      else params.set(key, value);
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  const goToView = (nextView: DirectoryView) =>
    navigate({ view: nextView, vendor: null, add: null });
  const openVendor = (id: string) => navigate({ vendor: id, add: null });
  const goToAdd = (method: AddVendorMethod) => navigate({ add: method, vendor: null });
  const backToList = () => navigate({ vendor: null, add: null });

  function toggleChip(chip: DirectoryChip) {
    setChips((current) =>
      current.includes(chip) ? current.filter((entry) => entry !== chip) : [...current, chip],
    );
  }

  // ── mutations (parked persistence — local working state only) ──
  const nextId = () => `new_${idSeq.current++}`;

  function setPreferred(vendor: DirectoryWorkingVendor) {
    // D1(a) enforced at the mutation, not only the UI gate: ⭐ Preferred is a flag on the frozen
    // favorite/status contracts, which key on a marketplace `vendor_profile_id`. An unlinked vendor
    // can never be preferred — defense-in-depth so no caller path can set it (server re-validates at wiring).
    if (!canBePreferred(vendor)) return;
    setVendors((current) =>
      current.map((entry) => (entry.id === vendor.id ? { ...entry, isFavorite: true } : entry)),
    );
  }

  function confirmRemovePreferred(vendor: DirectoryWorkingVendor) {
    setVendors((current) =>
      current.map((entry) => (entry.id === vendor.id ? { ...entry, isFavorite: false } : entry)),
    );
    setRemoveTarget(null);
  }

  function confirmArchive(vendor: DirectoryWorkingVendor) {
    setVendors((current) =>
      current.map((entry) =>
        entry.id === vendor.id ? { ...entry, state: "archived", isFavorite: false } : entry,
      ),
    );
    setArchiveTarget(null);
  }

  function restore(vendor: DirectoryWorkingVendor) {
    setVendors((current) =>
      current.map((entry) => (entry.id === vendor.id ? { ...entry, state: "active" } : entry)),
    );
  }

  function saveMarketplace(input: SaveMarketplaceInput) {
    const id = nextId();
    setVendors((current) => [buildMarketplaceWorkingVendor(id, input), ...current]);
    openVendor(id);
  }

  function createPrivate(input: CreatePrivateVendorInput) {
    const id = nextId();
    setVendors((current) => [buildPrivateWorkingVendor(id, input), ...current]);
    openVendor(id);
  }

  function createFromPaste(rows: PasteRow[]) {
    const created: DirectoryWorkingVendor[] = rows.map((row) => {
      const id = nextId();
      if (row.linked) {
        // Resolve the real marketplace profile the buyer linked to (from the corpus) — no fabricated data.
        const profile = marketplaceCorpus.find(
          (candidate) =>
            candidate.name.toLowerCase() === (row.duplicate?.name ?? row.company).toLowerCase(),
        );
        if (profile) {
          return buildMarketplaceWorkingVendor(id, {
            slug: profile.slug,
            name: profile.name,
            category: profile.category,
            location: profile.location,
            verified: profile.verified,
            claimState: profile.claimState,
            preferred: row.preferred,
          });
        }
      }
      return buildPrivateWorkingVendor(id, {
        name: row.company,
        phone: row.phone,
        email: row.email,
        contactPerson: row.contact,
        city: row.location,
        noteText: row.notes,
        source: "excel",
        offerings: row.categoryId
          ? [
              {
                id: `${id}_o0`,
                label: row.categoryText || categoryName(row.categoryId) || "",
                categoryId: row.categoryId,
              },
            ]
          : [],
      });
    });
    setVendors((current) => [...created, ...current]);
    navigate({ view: "private", vendor: null, add: null });
  }

  const rows = selectDirectoryRows(vendors, view, chips);
  const counts = viewCounts(vendors);
  const activeVendor = vendorId ? (vendors.find((entry) => entry.id === vendorId) ?? null) : null;

  return (
    <DirectoryPersonaProvider persona={persona}>
      {/* Demo control — the D4 persona (labelled; never a real permission). */}
      <div className="mb-4 flex items-center justify-end">
        <PersonaToggle value={persona} onChange={setPersona} />
      </div>

      {addMethod !== null ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={backToList}>
              <ArrowLeft aria-hidden />
              Back to directory
            </Button>
          </div>
          {addMethod === "paste" ? (
            <>
              <PageHeader
                title="Paste multiple vendors"
                description="Copy rows from Excel, Google Sheets or a Word table and paste them below. Review and confirm — nothing is created until you do."
              />
              <PasteWizard
                corpus={{
                  existingNames: vendors.map((entry) => entry.name),
                  marketplaceNames: marketplaceCorpus.map((entry) => entry.name),
                }}
                onConfirm={createFromPaste}
                onCancel={backToList}
              />
            </>
          ) : (
            <>
              <PageHeader
                title="Add Vendor"
                description="Save a marketplace vendor to your directory, or create a private vendor your organization maintains."
              />
              <AddVendor
                method={addMethod}
                onSelectMethod={goToAdd}
                marketplaceCorpus={marketplaceCorpus}
                existingVendors={vendors}
                onSaveMarketplace={saveMarketplace}
                onCreatePrivate={createPrivate}
                onOpenVendor={openVendor}
              />
            </>
          )}
        </div>
      ) : activeVendor ? (
        <VendorDetailPanel
          vendor={activeVendor}
          onSetPreferred={setPreferred}
          onRequestRemovePreferred={setRemoveTarget}
          onRequestArchive={setArchiveTarget}
          onRestore={restore}
        />
      ) : vendorId && !activeVendor ? (
        <div className="flex flex-col gap-4">
          <PageHeader
            title="Vendor not found"
            description="This vendor is not in your directory."
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="w-fit"
            onClick={backToList}
          >
            Back to directory
          </Button>
        </div>
      ) : (
        <>
          <PageHeader
            title="My Vendor Directory"
            description="Your organization's private vendor list — marketplace-linked and off-platform vendors together. Buyer-private, never shown to vendors."
            actions={
              <Button type="button" size="sm" onClick={() => goToAdd("search")}>
                <Plus aria-hidden />
                Add Vendor
              </Button>
            }
          />
          <DirectoryList
            vendors={rows}
            view={view}
            chips={chips}
            counts={counts}
            onSelectView={goToView}
            onToggleChip={toggleChip}
            onSetPreferred={setPreferred}
            onRequestRemovePreferred={setRemoveTarget}
          />
        </>
      )}

      <RemovePreferredDialog
        vendor={removeTarget}
        onOpenChange={(open) => !open && setRemoveTarget(null)}
        onConfirm={confirmRemovePreferred}
      />
      <ArchiveDialog
        vendor={archiveTarget}
        onOpenChange={(open) => !open && setArchiveTarget(null)}
        onConfirm={confirmArchive}
      />
    </DirectoryPersonaProvider>
  );
}
