// Import the env loader FIRST: its top-level side-effect populates `DATABASE_URL`/`DIRECT_URL` from the
// dotfiles before the shared Prisma client (below) is evaluated and first connects (Vitest per-file
// workers do not inherit globalSetup's env mutations).
import "./env";
import { execSync } from "node:child_process";
import { PrismaClient } from "../../generated-contracts-registry/prisma";
import { prisma } from "../../src/shared/db";

// Ephemeral test-DB bootstrap + the DB-role-switch RLS backstop (Doc-8B §3/§5). TS-native; never a
// live external service (R12).
//
// Wave-1 activation: the realized `core` (Doc-6B) + `identity` (Doc-6C) tables/RLS now exist, so the
// Band-C / `CHK-8-024` RLS gate (Doc-8D §5) has a real oracle. The §5 DB-role-switch backstop is the
// crux: the local/CI connection runs as `postgres` (SUPERUSER + table owner) which BYPASSES RLS — a
// CHK-8-024 assertion on that connection would be VACUOUS (it would "pass" with RLS doing nothing).
// The assertions MUST run as a dedicated NON-privileged role that does not bypass RLS.

export function hasTestDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

// Apply migrations to the configured test DB (forward-only; Doc-6A §11). Requires DATABASE_URL
// (+ DIRECT_URL) in env (loaded by ./env in global-setup). Now a real apply: `core` + `identity`.
export async function applyMigrations(): Promise<void> {
  execSync("npx prisma migrate deploy", { stdio: "inherit" });
}

// Isolation strategy (Doc-8B §3): transaction-rollback by default; the RLS role-switch path is the
// declared schema-reset / commit-boundary opt-out (Pass-1 §3) — `SET LOCAL ROLE` + a per-tx GUC need a
// committed seed the restricted-role transaction can read, so RLS suites seed (elevated, committed) and
// clean up explicitly rather than relying on the rollback-everything default.
export const ISOLATION_STRATEGY = "transaction-rollback" as const;

// ─────────────────────────────────────────────────────────────────────────────
// DB-role-switch RLS backstop (Doc-8B §5) — the app-BYPASSED path the CHK-8-024 gate asserts through.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The dedicated NON-privileged tenant DB role for RLS assertions. NOLOGIN (entered via `SET LOCAL ROLE`
 * inside the superuser session), NOBYPASSRLS, and NOT a table owner — so RLS policies actually apply to
 * it (a superuser / `rolbypassrls` / table-owner role would silently bypass and false-pass the gate).
 * Granted exactly the privileges each RLS gate needs to prove fail-closed behavior at the DB level —
 * never a blanket grant: `SELECT`/`INSERT` on `identity.organizations`/`buyer_profiles`; full
 * `SELECT`/`INSERT`/`UPDATE`/`DELETE` on the 4 `identity_authz` tables (W2-IDN-1 — UPDATE/DELETE
 * privilege is required even where no RLS policy exists, so a missing-policy gate observes the
 * genuine 0-rows-affected fail-closed rather than a `permission denied for table` false-pass); and
 * `SELECT`/`INSERT` on `core.audit_records` (+ its default partition, ESC-W2-AUDIT-RLS §7 = R-b /
 * ADR-021). See `ensureRestrictedRlsRole` below for the authoritative grant set (Doc-8B §5).
 */
export const RESTRICTED_RLS_ROLE = "ivendorz_test_rls" as const;

/** The three server-set GUCs every `identity` RLS policy reads (Doc-6C §2.1 / §6.2a). */
export interface RlsGucs {
  /** `app.active_org` — the tenant anchor. Omit to assert the fail-closed (no-context) path. */
  activeOrg?: string;
  /** `app.user_id` — the resolved principal (platform-owned self-scope). */
  userId?: string;
  /** `app.is_platform_staff` — the staff backstop leg. Omit ⇒ unset ⇒ FALSE (never client-inferred). */
  isPlatformStaff?: boolean;
}

/**
 * Provision the restricted RLS role idempotently and grant it the minimal privileges the CHK-8-024 gate
 * needs on `identity` (Doc-8B §5). Run once in global-setup as the elevated (superuser) connection — the
 * ONLY elevated use is provisioning/seeding; assertions run as the restricted role.
 *
 * The role is created `NOBYPASSRLS` and is never made an owner: RLS therefore enforces against it. Grants
 * are `USAGE` on the `identity` schema + `SELECT`/`INSERT` on the two original tenant tables
 * (`organizations`, `buyer_profiles`), plus (W2-IDN-1) full `SELECT`/`INSERT`/`UPDATE`/`DELETE` on the 4
 * `identity_authz` tables (`permissions`/`role_permissions`/`organization_workflow_settings`/
 * `delegation_grants`). The full-CRUD grant on those 4 tables is deliberate, not a least-privilege
 * regression: proving a table has NO RLS UPDATE policy (e.g. `role_permissions`) requires the restricted
 * role to actually HOLD the `UPDATE` privilege — otherwise an attempted UPDATE fails on a missing grant
 * (`permission denied for table`) rather than the RLS gate's genuine fail-closed 0-rows-affected, and the
 * test would false-pass for the wrong reason. The role stays non-owner/`NOBYPASSRLS` throughout, so RLS
 * still enforces against every grant regardless of statement type.
 */
export async function ensureRestrictedRlsRole(): Promise<void> {
  // CREATE ROLE is not transactional-safe to repeat; guard with a catalog check. NOBYPASSRLS + NOLOGIN.
  await prisma.$executeRawUnsafe(`DO $$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = '${RESTRICTED_RLS_ROLE}') THEN
      CREATE ROLE ${RESTRICTED_RLS_ROLE} NOLOGIN NOBYPASSRLS NOSUPERUSER;
    END IF;
  END $$;`);
  await prisma.$executeRawUnsafe(`GRANT USAGE ON SCHEMA identity TO ${RESTRICTED_RLS_ROLE}`);
  await prisma.$executeRawUnsafe(
    `GRANT SELECT, INSERT ON identity.organizations, identity.buyer_profiles TO ${RESTRICTED_RLS_ROLE}`,
  );
  // W2-IDN-1 — the 4 identity_authz tables (Doc-6C §3.5/§3.6/§3.7/§3.9). Full CRUD grants so the
  // CHK-8-024 gate can prove EACH policy's behavior at the DB level (incl. `role_permissions`'
  // deliberate absence-of-UPDATE-policy — proving fail-closed-0-rows requires the UPDATE grant, not
  // a bare permission-denied) rather than being short-circuited by a missing table privilege.
  await prisma.$executeRawUnsafe(
    `GRANT SELECT, INSERT, UPDATE, DELETE ON identity.permissions, identity.role_permissions, identity.organization_workflow_settings, identity.delegation_grants TO ${RESTRICTED_RLS_ROLE}`,
  );
  // core.audit_records (Doc-6B) — the audit-append RLS conformance gate (ESC-W2-AUDIT-RLS §7 = R-b /
  // ADR-021). SELECT + INSERT so the gate proves the RLS POLICY (staff-only read fail-closes to 0 rows;
  // the context-bound `WITH CHECK` admits/rejects the INSERT) rather than a missing grant. Grant on the
  // partitioned parent AND the DEFAULT partition (RLS is per-partition; grants likewise applied to both).
  await prisma.$executeRawUnsafe(`GRANT USAGE ON SCHEMA core TO ${RESTRICTED_RLS_ROLE}`);
  await prisma.$executeRawUnsafe(
    `GRANT SELECT, INSERT ON core.audit_records, core.audit_records_default TO ${RESTRICTED_RLS_ROLE}`,
  );
  // W3-MKT-1 — the M2 public-projection RLS conformance gate (`vendor_profiles` tri-actor public-read
  // leg + the fully-public `vendor_slug_history`). SELECT-only: this pilot slice is read-only, no
  // write-path RLS to prove here (unlike the identity_authz full-CRUD grant, which exists to prove a
  // MISSING write policy's fail-closed 0-rows — no analogous claim is made for marketplace yet).
  await prisma.$executeRawUnsafe(`GRANT USAGE ON SCHEMA marketplace TO ${RESTRICTED_RLS_ROLE}`);
  await prisma.$executeRawUnsafe(
    `GRANT SELECT ON marketplace.vendor_profiles, marketplace.vendor_slug_history, marketplace.categories, marketplace.category_assignments TO ${RESTRICTED_RLS_ROLE}`,
  // W3-COMM-1 — the M6 support-ticket RLS conformance gate (`support_tickets_party` org+staff;
  // `ticket_messages_party` via-parent + append-only). Full CRUD on `support_tickets` (proving the party
  // policy's WITH CHECK admits/rejects + tenant-isolated reads); SELECT/INSERT/UPDATE/DELETE on
  // `ticket_messages` so the immutability-trigger + party checks are reached (not a bare permission-denied).
  // The role stays non-owner/NOBYPASSRLS, so RLS enforces against every grant.
  await prisma.$executeRawUnsafe(`GRANT USAGE ON SCHEMA communication TO ${RESTRICTED_RLS_ROLE}`);
  await prisma.$executeRawUnsafe(
    `GRANT SELECT, INSERT, UPDATE, DELETE ON communication.support_tickets, communication.ticket_messages TO ${RESTRICTED_RLS_ROLE}`,
  );
  // W3-COMM-1 (MIN-4) — the `communication.command_dedup` replay store holds full wire response bodies
  // (incl. subject / Location); prove `command_dedup_actor` blocks a cross-actor SELECT at the DB level.
  // SELECT/INSERT so a WITH-CHECK/USING probe reaches the policy (not a bare permission-denied).
  await prisma.$executeRawUnsafe(
    `GRANT SELECT, INSERT ON communication.command_dedup TO ${RESTRICTED_RLS_ROLE}`,
  );
}

/**
 * A minimal transaction surface the restricted-role callback runs raw read/write queries against. The
 * harness uses raw SQL here deliberately: this is the Doc-8B §5 RLS seam (act as a tenant DB role, app
 * layer bypassed), NOT a cross-module table access — it is how the gate proves the DB-level backstop
 * enforces. `$executeRawUnsafe` (W2-IDN-1) lets a caller assert an exact affected-row COUNT for
 * INSERT/UPDATE/DELETE probes — e.g. proving a missing RLS policy for a command yields 0 affected rows
 * (fail-closed) rather than a thrown error, distinct from a WITH CHECK rejection (which throws).
 */
export interface RestrictedRoleTx {
  $queryRawUnsafe<T = unknown>(query: string, ...values: unknown[]): Promise<T>;
  $executeRawUnsafe(query: string, ...values: unknown[]): Promise<number>;
}

const BASE_DB_URL = (): string => {
  const url = process.env.DATABASE_URL;
  if (url === undefined)
    throw new Error("[harness] DATABASE_URL not set — RLS backstop unavailable.");
  return url;
};

/** Append a query param to a connection URL (handles the existing-`?` case). */
function withParam(url: string, param: string): string {
  return url + (url.includes("?") ? "&" : "?") + param;
}

/** Private sentinel thrown to force a restricted-role transaction to roll back without surfacing as a real
 *  failure (so an admitted INSERT probe never persists; see `asRestrictedRole`). */
class TxRollback extends Error {}

/**
 * Run `fn` as the restricted NON-privileged RLS role inside ONE transaction, with the supplied GUCs set
 * TRANSACTION-LOCAL (`set_config(.,.,true)` — the production `withActiveOrgContext` pattern; discarded at
 * rollback, never session-global). The transaction is always rolled back — the callback only reads.
 *
 * Crucially, each call uses a FRESH dedicated `connection_limit=1` client. Postgres `set_config` on an
 * undeclared custom GUC like `app.active_org` leaves a session-level empty-string placeholder on a pooled
 * connection that a later transaction would observe as `''` (not NULL), corrupting the no-GUC fail-closed
 * meta-check. A fresh single-use connection guarantees a pristine placeholder, so an OMITTED `activeOrg`
 * resolves to NULL ⇒ every tenant RLS predicate is false ⇒ 0 rows (genuine fail-closed). The client is
 * disconnected in `finally`.
 *
 * @param gucs the RLS GUCs to pin (omit `activeOrg` to assert the no-context fail-closed path).
 * @param fn   the restricted-role work — a read, OR an INSERT probe that is rolled back (never persisted);
 *             receives the RLS-scoped transaction. The transaction ALWAYS rolls back.
 */
export async function asRestrictedRole<T>(
  gucs: RlsGucs,
  fn: (tx: RestrictedRoleTx) => Promise<T>,
): Promise<T> {
  const client = new PrismaClient({
    datasources: { db: { url: withParam(BASE_DB_URL(), "connection_limit=1") } },
  });
  // Force the transaction to ALWAYS roll back (the documented contract above): a callback may READ, or may
  // ADMIT an INSERT to prove an RLS WITH CHECK passes — but it must NEVER PERSIST. Append-only tables (e.g.
  // core.audit_records) cannot be cleaned up by DELETE, so a committed probe row would break re-runs with a
  // PK/unique collision. We capture the callback result, throw a private sentinel to force the rollback,
  // swallow that sentinel, and re-surface the captured value. A REAL error raised by the callback's own
  // statement (e.g. an RLS WITH CHECK rejection) is NOT the sentinel and propagates to the caller.
  let captured: T | undefined;
  try {
    await client.$transaction(async (tx) => {
      // Enter the NON-privileged role; from here RLS enforces (no bypass).
      await tx.$executeRawUnsafe(`SET LOCAL ROLE ${RESTRICTED_RLS_ROLE}`);
      // Pin only the GUCs explicitly supplied (transaction-local). An omitted GUC stays unset → NULL →
      // fail-closed. Values are UUIDs/booleans, bound as parameters (never string-interpolated).
      if (gucs.activeOrg !== undefined) {
        await tx.$queryRawUnsafe(`SELECT set_config('app.active_org', $1, true)`, gucs.activeOrg);
      }
      if (gucs.userId !== undefined) {
        await tx.$queryRawUnsafe(`SELECT set_config('app.user_id', $1, true)`, gucs.userId);
      }
      if (gucs.isPlatformStaff !== undefined) {
        await tx.$queryRawUnsafe(
          `SELECT set_config('app.is_platform_staff', $1, true)`,
          gucs.isPlatformStaff ? "true" : "false",
        );
      }
      captured = await fn(tx);
      throw new TxRollback(); // force rollback — never persist a probe (read OR admitted write).
    });
  } catch (e) {
    if (!(e instanceof TxRollback)) throw e; // a real failure (e.g. an RLS rejection) propagates.
  } finally {
    await client.$disconnect();
  }
  return captured as T;
}

/**
 * Meta-assertion helper: as the restricted role with NO `app.active_org` GUC set, how many rows of
 * `identity.buyer_profiles` are visible? A correctly-enforced RLS policy fails closed ⇒ 0. If this returns
 * > 0, RLS is NOT active on this connection (e.g. a bypassing role) and the whole CHK-8-024 gate is
 * INVALID — the test must fail loudly rather than false-pass. Uses a fresh connection (pristine NULL GUC).
 */
export async function countBuyerProfilesNoContext(): Promise<number> {
  return asRestrictedRole({}, async (tx) => {
    const rows = await tx.$queryRawUnsafe<Array<{ n: number }>>(
      `SELECT count(*)::int AS n FROM identity.buyer_profiles`,
    );
    return rows[0]?.n ?? -1;
  });
}
