# My Vendor Directory — the Saved-Vendors fold (Prototype v0.2)

**Clickable prototype · NON-AUTHORITATIVE.** Coins nothing. No production code changed — the
reserved `/buy/saved-vendors` route remains an `ImplementationPendingView` and `/buy/crm` is
untouched. This is the design artifact for the FE fold in `DELIVERY_PLAN.md` (v1.1).

```bash
npm run prototype my-vendor-directory     # → http://localhost:8080
# or, to avoid a port clash with another prototype:
npm run prototype my-vendor-directory -- --port 8092
```

## What this shows

The reserved **Saved Vendors** page had no contract behind it (`ESC-BUY-SAVED-VENDORS`). The
**2026-07-16 owner ruling folded it into ⭐ Preferred** — the already-frozen
`operations.vendor_favorites` (M4 / BC-OPS-1), a *flag* on the buyer↔vendor relationship. So Saved
Vendors is **not a new feature**: it's a view of "My Vendor Directory" (which also absorbs the
shipped Vendor CRM, P-BUY-26/27).

| Surface | Route | Notes |
|---|---|---|
| **Directory list** | `#/vendors?view=…` | 5 working views: All / Marketplace / Private / **⭐ Preferred** / Archived. Status = **filter chips**, never nav. Source badge on every row. |
| **The fold redirect** | `#/saved-vendors` | redirects to `#/vendors?view=preferred` with a toast |
| **Vendor detail** | `#/vendors/:id` | tabs: Profile (+ **offerings**) · Notes · My Rating · Status history · Documents (gated) |
| **Add Vendor** | `#/vendors/new` | **3 methods**: Search Marketplace · Add Private Manually · Paste Vendor List |
| **Paste Vendor List** | `#/vendors/new/paste` | 4-step wizard: Paste → Map → Validate & resolve → Preview & confirm |

## v0.2 — Review-A fold + owner directives (2026-07-23)

This revision applies the Review-A verdict (*APPROVE WITH PLAN PATCH*) and the owner design-chat
directives. See `DELIVERY_PLAN.md` v1.1 for the full ledger.

- **D1(a) interim (MAJOR-3).** Only a **linked** relationship carries ⭐ Preferred / buyer status —
  the frozen favorite/status contracts key on a marketplace `vendor_profile_id`. Unlinked private
  vendors show **disabled ⭐/status** with a "Link to a marketplace profile to prefer / set status"
  affordance; notes + rating stay available. Demo data corrected (no unlinked vendor is
  Preferred/Approved). The **⭐ Preferred view is linked-only** (matches Doc-4F_PassB_Part1 :477).
- **Paste Vendor List (D3 / MAJOR-2).** Clipboard paste is **not** bulk import. Parse / map /
  validate / preview are client-side presentation; on confirm each eligible row would use the frozen
  single-create `ops.create_private_vendor.v1` (`source = excel`) — **no batch/atomicity/import-job
  semantics claimed**. Dedicated batch create, file upload, Word/PDF extraction, import history and
  bulk export stay gated (`ESC-VENDIR-FIELDS` R5). Labelled **"Paste multiple vendors"**, never
  "Import". Try **Paste sample data** for happy rows, a marketplace match (Titas), a directory
  duplicate (Meghna), an invalid-email row (blocked), a missing-name row, and a repeated category
  (three "Centrifugal Pumps" → **batch apply**).
- **Unified offerings + category eligibility (D5).** One shared component renders ≤10
  products/services with provenance (`Vendor profile` / `Buyer maintained` / `Text only`) and a
  "N of 10" meter. Platform-linked offerings are **composed from the M2 profile at read time**
  (read-only, header "Products & Services · Source: Vendor profile" — no "Core" without an
  authoritative M2 core flag, MINOR-3); private offerings are buyer-maintained ("Core Products &
  Services"). Category matcher: suggestions (High / Possible / No match) that the buyer must
  **confirm** — never a silent fuzzy bind; "Keep as text only"; batch-apply; original text always
  preserved. **Save eligibility** = company name + ≥1 confirmed system category (with reasons shown
  when disabled); a contact method is optional (`Saved` vs `Operationally ready`).
  **Prototype-only:** production persists **no M2 category ID in M4** — matching + the eligibility
  rule are gated (`ESC-VENDIR-FIELDS` R5) until the Board rules the persistence shape.
- **Authority model (D4).** Any active member can **add** a vendor; **removal-like** actions
  (clear ⭐, archive, unlink) are **authorized-only** and always behind a **confirmation dialog**.
  **No hard-delete** exists anywhere — private vendors use the frozen **archive** lifecycle;
  clear-⭐ removes the vendor from the Preferred projection only and it stays in other views. Use the
  **Persona** toggle (top bar) to compare *Ordinary member* vs *Authorized member*. The role
  threshold is a **pending Doc-2 §7 additive ruling** — labels are neutral, and the FE mints no
  permission names.
- **Pending Invitation hidden (MINOR-1).** R4-gated (`ESC-VENDIR-INVITE`) with no submit contract —
  hidden from the production IA; visible only under **Review notes** for IA completeness.
- **Two journeys, never conflated (MINOR-1).** Marketplace "Save vendor" = the single
  `ops.set_vendor_favorite.v1` (creates/reuses the relationship container); private-vendor creation
  is a separate journey (`ops.create_private_vendor.v1`). No "Save then Prefer" pair.

## The ⭐ toggle = the frozen favorite (the whole point)

The star on every **linked** row (and the detail header) **is** the "save a vendor" gesture:
Save → `ops.set_vendor_favorite.v1` · Unsave → `ops.clear_vendor_favorite.v1` (idempotent flag,
Doc-4F §F4.6). Starring a marketplace vendor with no relationship yet **auto-creates the
`buyer_supplier_relationships` container** on first write (Doc-4F §F4.5). No new module, contract, or
escalation.

## Governance posture (deliberately done / not done)

- **Buyer-private, Invariant #11.** The whole surface is `organization_id = app.active_org` only.
  **Blacklisted** renders buyer-side only and is undetectable to the vendor.
- **⭐ Preferred is not a ranking** (§4B firewall). "Frequently used by this organization" in the
  category matcher is an org-private convenience — never a ranking or public-taxonomy input.
- **Content ≠ Presentation.** The directory **reads** the M2 public profile via service and never
  copies it into M4. Saving a platform vendor creates/reuses the relationship but persists no
  duplicate private record and copies no M2 content.
- **Nothing authoritative is overwritten.** Append-only status history (Inv #8); soft-delete archive;
  no hard delete.
- **Contracts bound by pointer, never coined.** Every contract name in the UI resolves in Doc-4F
  (PassA / PassB Part 1) — `create/update/archive_private_vendor`, `add_private_vendor_note`,
  `set_private_vendor_rating`, `set/clear_vendor_favorite`, `set/clear_buyer_vendor_status`,
  `confirm/dismiss_vendor_link`, `get/list_private_vendors`, `get_buyer_supplier_relationship`, and
  `marketplace.list_categories.v1` (Doc-4D). There is **no** frozen batch-import contract — the paste
  flow never claims one.

## Reviewing it

- **Review notes** toggle (top banner) — dashed cards explain the fold, contracts, and each
  governance choice; turn off for a production-like read (Pending Invitation disappears).
- **Persona** toggle — switch to *Ordinary member* and confirm removal-like controls vanish; switch
  to *Authorized member* and un-star → a confirmation dialog; confirm → the vendor leaves ⭐ Preferred
  but stays under All / its source view.
- Try: **Add Vendor → Paste Vendor List → Paste sample data → Detect columns → Validate** → resolve
  the Titas marketplace match, the Meghna duplicate, the Custom Works blocked email, batch-apply
  "Centrifugal Pumps" to 3 rows, confirm a category on ABC/XYZ → **Preview → Create**. Open a created
  vendor to see its offering + provenance. Open **Savar Steel** (unlinked private) → disabled ⭐,
  "link to set status", offerings with a confirmed category + a text-only item.

Demo data is illustrative seed per prototype convention, reusing the app's mock rfq-universe vendor
identities. Demo clock ≈ Jul 5, 2026.

## Relationship to the lifecycle plan

This is the **Phase-1 FE fold** made concrete (presentation-only). `DELIVERY_PLAN.md` v1.1 carries
the phased delivery, the Frozen-vs-Gated ledger, and decisions **D1–D5**. Not shown / later phases:
Phase-0 registry reconciliation (drafted in the plan, human-gated), Phase-2 backend (Wave 5), Phase-3
wiring, Phase-4 gated unlocks (R2–R5 + the D1/D4 escalations).
