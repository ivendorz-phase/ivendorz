# Doc-2 Renumber — Execution Checklist

Mechanics for executing `RULING_Doc-2_v1.0.9_Collision_Renumber_SchemeB_v1.0.md`. This is an
execution aid, not a ruling. Line numbers are from the 2026-07-23 blast-radius sweep of
`fe/account-referral-nav` and may drift — **re-grep before editing each file.**

**Target (fixed) — version axis:** v1.0.9 VBR → **v1.0.10** · v1.0.10 GrowthHub → **v1.0.11** ·
v1.0.13 VendorType → **v1.0.12**. Reserved v1.0.11/v1.0.12 retired.

**Second axis — PATCH-D2 id** (verified 2026-07-23): main's ids are `01–07, 09` (Comm Audit = D2-09;
**D2-08 is a free gap**). So: VBR keeps **D2-08** (fills main's gap) · GrowthHub **D2-09 → D2-10**
(main's D2-09 is taken) · VendorType **D2-10 → D2-11**. Final main sequence = contiguous `D2-01..11`.
D2-08 (this PR) needed **no** patch-id change; D2-09/D2-10 PRs **must** apply the id shift above.

---

## Global rules

1. **Scope:** renumber the authoritative **corpus (`generatedDocs/`) + live code** only. **Freeze
   the review trail (`governanceReviews/`) and applied migrations as provenance** — disambiguation
   note only (§ "Do NOT edit").
2. **No global find/replace on `Doc-2_Patch_v1.0.9`** — three meanings exist (see Landmines). Edit
   per file, in context.
3. **Preserve `§N` anchors** (§7/§8/§9/§10.3) — only `v1.0.x` and `PATCH-D2-0x` tokens move.
4. **Cut-time gate (per ruling §5):** before cutting the **first** forward-PR, confirm `main`'s
   Doc-2 tip is still v1.0.9. If a new Doc-2 patch landed on main, **STOP and return to owner** — do
   not slide the targets.
5. Independent (fresh, non-author) verification before each fold. Commit by explicit path; never
   `git add -A`. Never push unless asked.

---

## PR D2-08 — VBR v1.0.9 → v1.0.10

**Author on main** as `Doc-2_Patch_v1.0.10_VendorBuyerRelationship.md` (branch's `Doc-2_Patch_v1.0.9.md`
content, renumbered — main keeps its own `Doc-2_Patch_v1.0.9.md` = Comm Audit). Headers: title `v1.0.10`;
base line **`v1.0.9 → v1.0.10`** (not `v1.0.8` — on main the prior tip is v1.0.9 Comm Audit; VBR/Comm
touch disjoint content and the 45→46 slug math is unaffected, so VBR stacks cleanly); `§9 effect` line
`effective Doc-2 v1.0.10`; add a reconcile-renumber provenance note.

Renumber `Doc-2 v1.0.9` (VBR) / `PATCH-D2-08` tokens in:

- **Indexes:** `00_AUTHORITY_MAP.md` (`:55` Doc-2 row VBR clause, `:127` dedicated VBR row),
  `CORPUS_INDEX.md` (⚠ VBR is **absent** — decide whether to add a v1.0.10 row), `esc_registry.md`
  (`:69` ESC-OPS-BUYER-CRM instrument).
- **Cross-citing corpus:** `Doc-4F_BCOPS6_Additive_Patch_v1.0.md` (~21 hits), `Doc-4E_VendorInvited_Payload_Additive_Patch_v1.0.md` (`:8`),
  `Doc-6C_GrowthInvitation_Patch_v1.0.4.md` (`:18`, `:230`), `Doc-4L_GrowthFlow_Patch_v1.0.1.md` (`:100`).
- **Downstream patches that cite the VBR file as precedent:** `Doc-2_Patch_v1.0.10_GrowthHub.md`
  (`:17`, `:18` renumber-note, `:200`) and `Doc-2_Patch_v1.0.13_VendorTypePresetValues.md`
  (`:86/:90/:152/:155` cite `Doc-2_Patch_v1.0.9.md:41/:49`). NOTE: these two files are themselves
  renumbered in D2-09/D2-10 — coordinate the filename reference.
- **Live code:** `app/(app)/_components/vendor/buyer-crm/buyer-crm-view.tsx:6`.

## PR D2-09 — Growth Hub v1.0.10 → v1.0.11

**Rename** `generatedDocs/Doc-2_Patch_v1.0.10_GrowthHub.md` → `Doc-2_Patch_v1.0.11_GrowthHub.md`;
self-headers `:13` title, `:17`, `:18` (update the existing renumber-note — GrowthHub was already
renumbered v1.0.9→v1.0.10 once; now →v1.0.11), `:200`.

Renumber `Doc-2 v1.0.10` / `PATCH-D2-09` citations in the linked 10-patch set:

- **Indexes:** `00_AUTHORITY_MAP.md` (`:55` Doc-2 row GrowthHub clause, `:129` P0-set row),
  `CORPUS_INDEX.md` (`:138`).
- **Corpus set:** `Doc-3_Policy_Key_Registration_Patch_v1.14_GrowthHub.md`, `Doc-4C_GrowthInvitation_Patch_v1.0.3.md`,
  `Doc-4H_GrowthDelivery_Patch_v1.0.1.md`, `Doc-4I_GrowthReferral_Patch_v1.0.1.md`, `Doc-4J_GrowthEvent_Patch_v1.0.1.md`,
  `Doc-4L_GrowthFlow_Patch_v1.0.1.md`, `Doc-5C_GrowthInvitation_Patch_v1.0.1.md`, `Doc-6C_GrowthInvitation_Patch_v1.0.4.md` (~25 hits),
  `Doc-7E_GrowthHub_Patch_v1.0.1.md`.
- **Live code (comments):** `src/modules/identity/contracts/{types,events,services}.ts`,
  `src/modules/identity/domain/audit-actions.ts`,
  `src/modules/identity/application/commands/create-invitation.command.ts`,
  `src/modules/identity/application/queries/resolve-invitation-delivery-payload.query.ts`,
  `src/modules/core/contracts/types.ts:78`, `prisma/schema.prisma:553`,
  `tests/integration/growth-attribution-provisioning.test.ts:110`.

## PR D2-10 — VendorType v1.0.13 → v1.0.12 (+ reservations retired + Doc-4D pointer)

**Rename** `generatedDocs/Doc-2_Patch_v1.0.13_VendorTypePresetValues.md` →
`Doc-2_Patch_v1.0.12_VendorTypePresetValues.md`; self-headers `:1`, `:4` `v1.0.10 → v1.0.12`, `:26/:27`, `:69`, `:298`.

- **Retire reservations:** remove the reserved-slot / fold-obligation narrative
  (`:10-12`, `:26`, `:295-304`, `:336`) and the Authority Map / CORPUS_INDEX reservation clauses
  (`00_AUTHORITY_MAP.md:53`, `:55`; `CORPUS_INDEX.md:136`). **Re-point** every "supersedes
  v1.0.11/v1.0.12" reference to the proposal filenames
  (`governanceReviews/Doc-2_Patch_v1.0.11/12_VendorTypePresetValues_PROPOSAL.md`) with
  "(drafting iterations; never folded; hold no corpus version)".
- **Indexes:** `00_AUTHORITY_MAP.md` (`:53`, `:55`, `:61`), `CORPUS_INDEX.md` (`:136`, `:137`),
  `esc_registry.md:92`.
- **Linked Doc-4D pointer (same PR):** `Doc-4D_VendorTypePreset_Pointer_Patch_v1.0.4.md`
  `:5`, `:15`, `:22`, `:67` — "Doc-2 v1.0.13" → "Doc-2 v1.0.12". (Its own v1.0.4→v1.0.5 escalation
  tracks this; `§10.3` section pointers stay.)
- **Amendment trail:** `Architecture_VendorTypePreset_Amendment_v1.0.md` (`:65`, `:263`, `:277`),
  `Architecture_VendorTypePreset_Amendment_Verification_v1.0.md` (`:62`, `:68`).
- **Live code:** `src/modules/marketplace/contracts/types.ts:59`,
  `app/(app)/_components/vendor/company/vendor-type-presets.ts:11`.

---

## Do NOT edit (freeze as provenance — disambiguation note only)

- All `governanceReviews/…PROPOSAL.md` review-trail files (incl. `Doc-2_Patch_v1.0.11/12/13_VendorTypePresetValues_PROPOSAL.md`,
  the VBR/GrowthHub proposals, the 10-patch set proposals). Add a one-line disambiguation header to
  `Doc-2_Patch_v1.0.11_VendorTypePresetValues_PROPOSAL.md` only ("corpus v1.0.11 on main = GrowthHub /
  PATCH-D2-09; this file is a superseded D2-10 drafting iteration").
- **Applied migration** `prisma/migrations/20260719120000_identity_growth_hub/migration.sql` — its
  `Doc-2 v1.0.10` comments are the historical record of what was applied. Never edit applied history.
- `governanceReviews/G3_Amendment_ReviewA_Manifest_v1.0.md:28` — SHA/byte-count for old
  `Doc-2_Patch_v1.0.9.md`; note as superseded, do not try to re-match the hash.

## Landmines

1. **`Doc-2_Patch_v1.0.9` has three meanings:** branch VBR (renumber target) · `main`'s
   Communication/support-ticket audit (**trunk-immovable v1.0.9** — never touch) · the *old* label
   the Growth Hub proposal still uses at `GrowthHub_P0_Additive_Patch_Set_PROPOSAL_v1.0.md:70,:183`
   (refers to Growth Hub, not VBR). No blind replace.
2. Cross-branch v1.0.9 files on `wave/3-communication-growth` (support-ticket audit,
   `docs/backend/growth_hub_p2_lane_routing.md:154-156`) are a **separate** reconcile — out of scope.
3. Preserve every `§N` section anchor.

## Verification (per-PR + final)

- `git grep -nE 'Doc-2.*v1\.0\.13|Doc-2_Patch_v1\.0\.13'` → **0** hits (VendorType shifted).
- `git grep -nE 'Doc-2.*v1\.0\.9.*(BuyerRel|Vendor Buyer)|VBR.*v1\.0\.9'` → **0** hits.
- `git grep -nE 'v1\.0\.11|v1\.0\.12' generatedDocs/` → **no** Doc-2 reserved-slot language; only
  other docs' own version lines remain.
- Authority Map Doc-2 row reads a clean `… → v1.0.10 → v1.0.11 → v1.0.12` (no reserved rows).
- `main`'s `Doc-2_Patch_v1.0.9.md` (Comm audit) byte-identical; the two GrowthHub old-label lines
  still say Growth Hub; no `§N` anchor changed; applied migration unmodified.
- Fresh independent verifier signs off before each fold. CI (GitHub ubuntu `next build` +
  Playwright) is the build oracle for the code edits — not a local `tsc` proxy.
