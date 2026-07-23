# GOVERNANCE DEPENDENCY — FE-BUY-11 authorization asymmetry

- **Status:** OPEN — **blocks Wave-5 production wiring** of My Vendor Directory
  (`/buy/saved-vendors`). Does **not** block the presentation milestone, which is COMPLETE.
- **Raised:** 2026-07-23, during the Phase-B wiring audit.
- **Owner of resolution:** Doc-2 governance process (human / Architecture Board). **Not** a
  frontend or implementation decision.
- **Raise ≠ Accept (CLAUDE.md §13):** this is a finding, not a mandate. Nothing here was acted on.

## The mismatch

1. **The approved UI distinguishes ordinary and authorized members.** The owner-ruled authority
   model for the directory is: any active organization member may **add** a vendor (create a private
   vendor, or mark a marketplace vendor ⭐ Preferred); **no ordinary member** may remove from
   Preferred, archive a private vendor, or unlink a vendor relationship; and **no user** may
   hard-delete a vendor through the directory.

2. **The frozen `can_manage_private_vendors` grant currently includes Owner, Director, Manager, and
   Officer.** Evidence — `prisma/migrations/20260709130000_identity_catalog_seed/migration.sql`:
   - `:46` seeds the slug: `can_manage_private_vendors` — *"Private vendor CRM — records, notes,
     ratings, favorites (Doc-2 §7)"* (tenant scope).
   - `:104` grants it to **Owner, Director, Manager, Officer** — all four org roles.

   The same seed shows the frozen model *does* express role asymmetry elsewhere:
   - `:47` seeds `can_manage_vendor_status`; `:105` grants it to **Owner, Director, Manager** only —
     Officer is excluded. This is useful precedent that a role threshold is expressible, but it is
     precedent only — it rules nothing for this case.

3. **The existing permission model therefore cannot express the approved archive, unlink, and
   remove-Preferred asymmetry.** One slug governs create, edit, archive, notes, ratings, favourite
   set **and** favourite clear (Doc-4F BC-OPS-1 §F4.1–F4.7), and it is held by every org role. There
   is no frozen slug, role threshold, or delegation shape that separates "may add" from "may remove"
   for private-vendor lifecycle actions. Enforcing the approved model today would require coining a
   permission or altering a role grant.

4. **This must be resolved through the Doc-2 governance process before Wave-5 production wiring.**
   The plausible shapes — a distinct removal/lifecycle slug, or an org-role threshold on the removal
   commands — are both **Doc-2 §7 additive** changes requiring human/Board approval. Selecting
   between them is the Board's call. A carried additive-slug lane already exists for the operations
   read case (`[ESC-OPS-SLUG]`, Doc-4F PassB Part 1) and may or may not be the right vehicle; that,
   too, is a governance decision, not an implementation one.

## What the frontend does in the meantime (and why it is not enforcement)

The delivered surface renders the approved authority model as **presentation only**: a labelled demo
persona control switches between "Ordinary member" and "Authorized member" and gates the
**visibility** of removal-like affordances. It:

- mints **no** permission name and maps to **no** specific org role (labels are deliberately neutral);
- is annotated in-product and in code as pending this ruling;
- claims **no** enforcement — all mutations are local client working state, and there is no server to
  enforce against (see the M4 runtime dependency in `WORK-PACKAGE.md`).

Authorization was deliberately **not** wired around these client-state mutations: a permission check
in the browser around local state is shadow authorization, not application-layer enforcement, and
would misrepresent the security posture. Real enforcement belongs in the M4 application command
(the established pattern: `checkPermission` inside the command, ordered
SYNTAX → CONTEXT → AUTHZ → SCOPE → BUSINESS → WRITE).

## Explicitly NOT done in this task

- No new permission slug coined.
- No role grant altered, added, or removed.
- No seed or migration touched.
- No shadow/client-side authorization introduced.
- No Doc-2 or other frozen-corpus document modified.

## Resolution checklist (for the Board, before Wave-5 wiring)

- [ ] Rule whether the removal/lifecycle asymmetry is adopted as product policy at all.
- [ ] If adopted, choose the mechanism: distinct lifecycle slug vs. org-role threshold on the
      removal commands.
- [ ] Issue the Doc-2 §7 additive patch (human approval; never a skill decision — CLAUDE.md §8).
- [ ] Re-seed / migrate the permission catalogue accordingly (M1).
- [ ] Only then wire enforcement in the M4 application commands and drop the demo persona control.
