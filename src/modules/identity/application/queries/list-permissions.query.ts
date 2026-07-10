// M1 application (PRIVATE) — `identity.list_permissions.v1` (Doc-4C §C7 · 21.3 Query · Actor: User /
// internal-service). THE genuinely-DUAL-ACTOR wire read of W2-IDN-6.4 (Doc-5C §2.3 inventory row 17;
// §2.5 note: "row 17 (`list_permissions`) is genuinely dual-actor on the wire — User / internal-
// service, no split leg"). Authorization (PassB:452): "Membership n/a; Slug none (reference data);
// Scope authenticated" — ANY authenticated principal, NO active-org, NO slug; the catalog is
// platform-owned reference data (Doc-6C §3.5 read-open RLS). It is the lookup consumers use to
// VALIDATE slugs — it NEVER adds/modifies one (§6.4 / PassB:459).
//
// PAGINATION — FAIL-CLOSED (handle-gated `ESC-IDN-LIST-PAGESIZE` — the list_delegation_grants
// precedent): the §C7 `page_size`/`cursor` dimension is bounded by a `[DC-5]` POLICY key that was
// NEVER REGISTERED (Doc-3 v1.9 §Notes: "No `identity.list_page_size_max`"); Doc-5A §8.5 forbids a
// literal. So the wire face rejects a supplied `page_size`/`cursor` (400, citing the handle) and this
// query returns the FULL catalog (45 slugs — 36 tenant + 9 staff, per Doc-2 §7 + v1.0.8) in the
// frozen `slug` order with `has_more: false`.
//
// Read: unaudited (§17.1 / §B.8) · `Idempotency: not-applicable` · zero events · reads NO governance
// signal (firewall default).

import { prisma, type DbExecutor } from "@/shared/db";
import { listPermissionCatalog } from "../../infrastructure/data/role.repository";
import type {
  ListPermissionsInput,
  ListPermissionsResult,
  PermissionView,
} from "../../contracts/types";

/**
 * List the platform permission catalog (Doc-4C §C7). Optional `space` filter (frozen). Runs on the
 * shared client — the catalog is platform reference data (not org-scoped; the dual-actor read needs
 * no active-org context).
 */
export async function listPermissions(
  input: ListPermissionsInput,
  db: DbExecutor = prisma,
): Promise<ListPermissionsResult> {
  const rows = await listPermissionCatalog(input.spaceFilter, db);
  const items: PermissionView[] = rows.map((r) => ({
    slug: r.slug,
    description: r.description,
    space: r.space,
  }));
  // Doc-5A §8.6: the fail-closed interim returns the full set, so `has_more` is always false and no
  // cursor is ever issued (§8.2 opacity — a client can therefore never legitimately supply one).
  return { items, pageInfo: { hasMore: false } };
}
