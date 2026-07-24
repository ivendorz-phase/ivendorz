// My Vendor Directory (Buyer sidebar IA · BX-04 "Saved Vendors") — the Saved-Vendors fold made real.
// A Next.js SERVER COMPONENT (App Router composition only — REPOSITORY_STRUCTURE §8): no business logic.
//
// SAVED VENDORS = ⭐ PREFERRED (owner ruling 2026-07-16): the reserved `/buy/saved-vendors` route had
// no contract; it is folded into the already-frozen `operations.vendor_favorites` (M4 / BC-OPS-1) — a
// flag on the buyer↔vendor relationship. This surface unifies that with the shipped Vendor CRM
// (P-BUY-26/27) into "My Vendor Directory" — marketplace-linked + off-platform private vendors together.
//
// PRESENTATION-ONLY (this milestone): `buildDirectorySnapshot()` composes the three frozen reads a
// linked record spans — `ops.list_private_vendors.v1` + `ops.get_private_vendor.v1` +
// `ops.get_buyer_supplier_relationship.v1` (Doc-4F §F4.9) plus the M2 public profile — from fixtures
// (parked; the real reads wire at M4 Wave 5). The browser sets no `Iv-Active-Organization` and calls
// no Doc-5 contract. All writes (favourite / status / archive / create) are PARKED.
//
// GOVERNANCE (load-bearing): buyer-private (Inv #11 — nothing vendor-facing, blacklist undetectable);
// D1(a) ⭐/status linked-only; D3 clipboard paste ≠ bulk import (single-create only, no batch);
// D4 add-is-open / removal-authorized-only / no hard delete; D5 category matching presentation-only
// (no M2 category id persisted in M4). No contract / event / schema / permission is coined here.

import { Suspense } from "react";
import { SavedVendorsWorkspace } from "./saved-vendors-workspace";
import {
  buildDirectorySnapshot,
  buildMarketplaceSearchCorpus,
} from "../_components/vendor-directory/working-model";

export const metadata = {
  title: "My Vendor Directory",
};

export default function SavedVendorsPage() {
  // The frozen-read seam (parked → fixtures today). At wiring, these become the server-resolved reads.
  const initialVendors = buildDirectorySnapshot();
  const marketplaceCorpus = buildMarketplaceSearchCorpus();

  return (
    <Suspense fallback={null}>
      <SavedVendorsWorkspace
        initialVendors={initialVendors}
        marketplaceCorpus={marketplaceCorpus}
      />
    </Suspense>
  );
}
