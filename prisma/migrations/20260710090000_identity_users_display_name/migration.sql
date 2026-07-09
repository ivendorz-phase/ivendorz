-- Doc-6C_Patch_v1.0.2 — `identity.users.display_name` DDL realization (W2-IDN-6.1).
-- Realizes `Doc-2_Patch_v1.0.6` (PATCH-D2-05, linked pair folded together; owner Option A ruling
-- 2026-07-09, `ESC-IDN-DISPLAYNAME` → RESOLVED).
--
-- FORWARD-ONLY (Invariant 8 / Doc-6A §11): a NEW migration — never an edit to the shipped
-- `identity_init` / `identity_authz` migrations. Exactly the patch DDL, nothing more:
--   • Nullable, NO default — absence is the legitimate initial state (the wire field is
--     `optional`, Doc-4C §C4 PassB:174).
--   • RLS: UNCHANGED — the column rides the existing `identity.users` row policies
--     (`users_self_read` / `users_self_update`); no new policy, no policy edit.
--   • No index, constraint, enum, state, or seed change.
--
-- Semantics (Doc-2_Patch_v1.0.6 §2): the user's optional, user-chosen PRESENTATION name.
-- Personal data — joins the Doc-4C §C4 `deactivate_own_account` anonymization set (realized in
-- this same WP). Never an identifier: no uniqueness, no auth linkage, no participation in any
-- resolution/matching/governance path (Content ≠ Presentation, Golden Rule 4).

ALTER TABLE "identity"."users" ADD COLUMN "display_name" text;
