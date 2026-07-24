<!--
Doc-type:  Governance companion — reconcile decision record (NON-authoritative under the frozen corpus).
Directive: Records two owner rulings (H4, H5) for the FE branch→main reconcile. Coins nothing;
           binds to the frozen corpus and existing code by pointer. On any conflict with a frozen
           doc: Flag-and-Halt (CLAUDE.md §11) — never resolve locally.
-->

# DECISION RECORD — Reconcile H4 (dashboard lens topology) + H5 (vendor-type preset DTO) · v1.0

| Field | Value |
|---|---|
| **Document type** | Reconcile decision record · non-authoritative under the frozen corpus |
| **Owner ruling date** | 2026-07-24 |
| **Scope** | The FE branch→`main` reconcile program (`fe/account-referral-nav` → `main`); resolves the two open decisions H4 and H5 recorded in the reconcile lineage/hazards analysis. |
| **Companion to** | `governanceReviews/Doc-2_Renumber_Execution_Checklist.md` · the D2-08/09/10 forward-PRs (#10–#13, landed on `main`). |
| **Status** | **RULED — H4 = KEEP · H5 = DROP** (owner, 2026-07-24). |
| **Rule** | Written for a **stateless successor**: a fresh FE-reconcile agent that has the repo + this record and nothing else. Anything not written here or committed does not exist. This record does **not** authorize the FE build itself — it rules the two decisions; execution is a separate, gated FE slice. |

**Depends on / conforms upward to (CLAUDE.md §7):** Master Architecture v1.0 FINAL (+ AMD-MA-VTP-1) · Doc-2
(current v1.0.12) · Invariants #1 and #2 (CLAUDE.md §5) · the frozen contract layer for M2/marketplace.

> **Purpose.** Two decisions surfaced during the reconcile lineage analysis as hazards: the `/dashboard`
> lens topology that `main` had abandoned (H4), and an obsolete vendor-type "preset" data-transfer object
> (H5). The owner has ruled both. This record states each ruling, its rationale, the **exact** code targets
> (verified read-only against `main` / the FE branch), and the acceptance test — so the FE slice can be
> executed by a stateless successor without re-deciding anything.

---

## H4 — KEEP the `/dashboard` lens topology

### Ruling
**KEEP.** Re-introduce the `/dashboard` **lens-entry** onto `main`. The Selling/Buying distinction is a
**navigation lens** (a filtered default view derived from the active org's participation flags), **never a
toggle and never an authorization gate**. `main` abandoned the lens-entry route; the reconcile must restore it.

### Rationale
- Consistent with **Invariant #2** (two role dimensions; Buying/Selling are **grouped, not merged** — "never a
  toggle"). The lens is a *navigation default*, not a permission boundary.
- The `(workspace)` lens **machinery already exists on `main`** — only the entry route that resolves the default
  lens is missing. Restoring it completes an already-present design rather than introducing new architecture.

### Exact targets (verified read-only)
**Already on `main` — do NOT re-add; preserve as-is:**
- `app/(app)/(workspace)/layout.tsx` — the one shell mounted once for both `/buy/*` and `/sell/*`.
- `app/(app)/_components/hybrid/hybrid-shell-vm.ts` — co-mount VM ("grouped-not-merged (Invariant #2) — never a
  toggle"); `resolveMountedNavGroups` maps participation → lenses.
- `app/(app)/_components/shell/hybrid-nav.ts` — `composeNav` concatenates Buying/Selling/Trust segments; allows
  `Buying › Dashboard` and `Selling › Dashboard` as distinct leaves.
- Per-lens dashboards: `app/(app)/(workspace)/sell/dashboard/…` and `…/buy/dashboard/…`.

**Missing from `main` — re-introduce from `fe/account-referral-nav`:**
- `app/(app)/dashboard/page.tsx` — the lens-entry route: resolves the default co-mounted lens **server-side** and
  redirects; the Buy-vs-Sell decision is a **navigation default from the active org's participation flags — never
  an authorization gate**.
- `src/server/identity/active-org-lens.ts` (exports `resolveWorkspaceEntryPath`) + its re-export in
  `src/server/identity/index.ts` (both absent from `main`; confirmed via `git grep`).

### Acceptance
- `/dashboard` on `main` resolves the default lens **server-side** from the active org's participation flags and
  redirects to `/buy/dashboard` or `/sell/dashboard` accordingly.
- No authorization gating is introduced on the lens (a user's lens default never widens/narrows permissions).
- Hybrid participants retain both `Buying › Dashboard` and `Selling › Dashboard` leaves (Invariant #2).

---

## H5 — DROP the obsolete vendor-type preset DTO (carrier only)

### Ruling
**DROP the DTO / label carrier.** Remove `vendor_type_preset` as a **transported / persisted / displayed
authoritative field**. This is obsolete on **Invariant #1** grounds: vendor capability is a **4-flag matrix**
(`can_supply` / `can_service` / `can_fabricate` / `can_consult`), **not a label**.

**IMPORTANT boundary (do not over-remove):** dropping the **carrier** is not the same as deleting the seeding UX.
A local onboarding/editor **preset selector may remain** — but only as an **ephemeral seeding control** that writes
the four capability flags and does **not** become part of any returned or persisted profile DTO.

### Rationale
- **Invariant #1**: capability is the matrix, never a label. A preset transported/persisted/displayed as vendor
  truth re-introduces the label the invariant forbids.
- The **contract layer is already clean and precedent-setting**: `src/modules/marketplace/contracts/types.ts:48-51`
  records that `vendorTypePreset` was **dropped from the public DTO (2026-07-11, DTO-conformance fix)** explicitly
  for "tension with Invariant #1's 'capability = matrix, never a label'"; the test guard
  `tests/integration/get-public-vendor-profile-slice.test.ts:219` asserts the key is **absent**. H5 extends that
  same, already-ratified posture to the remaining presentation-layer carrier.
- The **six-member `vendor_type_preset` value domain** (AMD-MA-VTP-1 / Doc-2 v1.0.12) is **not** removed — it
  remains a valid **seeding catalog**. H5 removes the DTO/label *transport*, never the amendment or an approved
  seeding convenience.

### Exact targets (verified read-only)
**On `main` — the carrier to remove (it lives on `main`, not only the FE branch):**
- `app/(app)/_components/vendor/company/types.ts:42` — field `vendor_type_preset?: string` on
  `interface VendorProfileView`.
- Consumers: `app/(app)/_components/vendor/company/capabilities-capacity-form.tsx:33-35` (edit `<input
  name="vendor_type_preset">`) and `app/(app)/_components/vendor/company/profile-overview.tsx:57`
  (`{ label: "Vendor type", value: profile?.vendor_type_preset }` display row).

**On `fe/account-referral-nav` only — a fuller dedicated DTO the reconcile must also drop:**
- `app/(app)/_components/vendor/company/vendor-type-presets.ts` — `interface VendorTypePreset`,
  `VENDOR_TYPE_PRESETS` catalog, `vendorTypePresetLabel()`; exported via
  `app/(app)/_components/vendor/company/index.ts:31-32`; consumed at `profile-overview.tsx:58`.

### Acceptance
- **No public, application, or presentation view model transports `vendor_type_preset` as authoritative vendor
  data.** Capability presentation and persistence use the four capability flags.
- A local preset selector **may remain only** as an ephemeral seeding control that writes those flags and does
  **not** become part of the returned or persisted profile DTO. After seeding, the capability matrix is
  authoritative; changing flags need not preserve or recompute a preset identity.
- Existing guards stay green: `contracts/types.ts:48-51` unchanged; `get-public-vendor-profile-slice.test.ts:219`
  still asserts absence.

---

## Guardrails (both decisions)
- This record **rules** H4/H5; it does **not** authorize the FE build. Execution is a separate, gated FE
  reconcile slice.
- Reference-never-restate: all targets are bound by pointer; nothing frozen is copied or coined.
- On any conflict with a frozen doc during execution: **Flag-and-Halt** (CLAUDE.md §11) — cite both sources,
  escalate; never resolve locally.
- The six-member `vendor_type_preset` value domain (Doc-2 v1.0.12 / AMD-MA-VTP-1) is untouched by H5.
