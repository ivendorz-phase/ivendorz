import "../_harness/env"; // load the ephemeral test-DB env per worker (Doc-8B §3) before Prisma connects.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "../../src/shared/db";
import { uuidv7 } from "../../src/shared/ids";
import { concurrencyEtag } from "../../src/shared/http";
import type { ensureProvisioned } from "../../src/server/auth";
import {
  handleDeactivateOwnAccount,
  handleSetUserAccountStatus,
  handleUpdateUser2faSettings,
  handleUpdateUserProfile,
} from "../../src/server/identity";
import {
  ADMIN_REASON_MAX_LENGTH,
  checkPermission,
  DISPLAY_NAME_MAX_LENGTH,
  getUser,
  SET_USER_ACCOUNT_STATUS_SLUG,
  setUserAccountStatus,
} from "../../src/modules/identity/contracts";

// W2-IDN-6.1 — the §C4 User/Account WIRED surface (Doc-5C §4.1 rows 1–4), Doc-8 band 8C:
// envelope (Doc-5A §5.6/§6.1) · error class+status (§6.2, frozen §C4 registers) · idempotency
// (natural discrimination — CAS token, terminal replay, illegal-edge replay; the §B.6 dedup
// replay-cache is the adjudicated IDN-6.5 carry, not 6.1) · prohibited fields (server-resolved
// attribution/context — no input can name an org/actor; typed surface + probes) · actor-scope
// (self vs Admin-state; staff-space NEVER via org roles — RV-0147 B8; cross-actor collapse) ·
// the 4 `display_name` realization legs (wire-accepted+bounded · `get_user` projection ·
// anonymization-set membership · column live via migration) · D7 audit atomicity (three audited
// writes + the frozen UNAUDITED profile update + the rollback direction), vs REAL PostgreSQL
// through the contracts + composition surfaces ONLY (never module internals).

// ── Deterministic fixtures (UUIDv7-shaped: version nibble 7, variant 8..b; 0xd61 = W2-IDN-6.1). ──
const ORG_A = "01920000-0000-7000-8000-000000d61a01"; // the caller's active org (audit anchor)
const ORG_B = "01920000-0000-7000-8000-000000d61a02"; // second org (departure consequences)
const ORG_C = "01920000-0000-7000-8000-000000d61a03"; // third org (pending row + sole-owner block)
const CUSTOM_ROLE = "01920000-0000-7000-8000-000000d61b01"; // a non-Owner role in ORG_A

let ownerRoleId: string;
let staffSuperAdminPermissionId: string;

/** The provisioning stub — fixtures are pre-seeded; the hook must not mint a personal org. */
const noProvision: typeof ensureProvisioned = async () => ({
  created: false,
  userId: "",
  organizationId: null,
  organizationHumanRef: null,
  ownerMembershipId: null,
});

/** Mint a fresh user (UUIDv7 id + auth linkage) with the full personal-field set. */
async function freshUser(params?: {
  status?: "active" | "suspended";
  withPersonalData?: boolean;
}): Promise<{ id: string; authUserId: string; updatedAt: Date }> {
  const id = uuidv7();
  const authUserId = uuidv7();
  const row = await prisma.user.create({
    data: {
      id,
      authUserId,
      status: params?.status ?? "active",
      ...(params?.withPersonalData === true
        ? {
            email: `u-${id.slice(-12)}@example.test`,
            phone: "+8801712345678",
            displayName: "Personal Name To Redact",
            twoFaJsonb: { enabled: false },
            preferencesJsonb: { locale: "bn-BD" },
          }
        : {}),
    },
  });
  return { id, authUserId, updatedAt: row.updatedAt };
}

/** Seed one membership at `state` (fresh UUIDv7 row id). */
async function seedMembership(params: {
  organizationId: string;
  roleId: string;
  userId: string;
  state: "invited" | "pending" | "active" | "suspended";
}): Promise<string> {
  const id = uuidv7();
  await prisma.membership.create({
    data: {
      id,
      organizationId: params.organizationId,
      userId: params.userId,
      roleId: params.roleId,
      state: params.state,
    },
  });
  return id;
}

async function userAudits(userId: string) {
  return prisma.auditRecord.findMany({
    where: { entityType: "user", entityId: userId },
    orderBy: { eventTime: "asc" },
  });
}

async function reloadUser(userId: string) {
  return prisma.user.findUniqueOrThrow({ where: { id: userId } });
}

const createdUserIds: string[] = [];
async function trackedUser(params?: Parameters<typeof freshUser>[0]) {
  const u = await freshUser(params);
  createdUserIds.push(u.id);
  return u;
}

describe("W2-IDN-6.1 §C4 user/account wired surface — 8C (real PostgreSQL)", () => {
  beforeAll(async () => {
    for (const [id, tag] of [
      [ORG_A, "a"],
      [ORG_B, "b"],
      [ORG_C, "c"],
    ] as const) {
      await prisma.organization.create({
        data: {
          id,
          humanRef: `ORG-D61-${tag}-${id.slice(-4)}`,
          name: `IDN61 Org ${tag.toUpperCase()}`,
          slug: `idn61-${tag}-${id.slice(-6)}`,
          orgStatus: "active",
        },
      });
    }
    await prisma.role.create({
      data: {
        id: CUSTOM_ROLE,
        organizationId: ORG_A,
        name: "IDN61 Officer",
        isSystemBundle: false,
      },
    });
    // The seeded Owner system-bundle role (migration seed §5.2) + the frozen staff slug (W2-IDN-2 seed).
    ownerRoleId = (
      await prisma.role.findFirstOrThrow({
        where: { name: "Owner", organizationId: null, isSystemBundle: true, deletedAt: null },
        select: { id: true },
      })
    ).id;
    staffSuperAdminPermissionId = (
      await prisma.permission.findFirstOrThrow({
        where: { slug: SET_USER_ACCOUNT_STATUS_SLUG },
        select: { id: true },
      })
    ).id;
  });

  afterAll(async () => {
    await prisma.rolePermission.deleteMany({ where: { roleId: CUSTOM_ROLE } });
    await prisma.membership.deleteMany({
      where: { organizationId: { in: [ORG_A, ORG_B, ORG_C] } },
    });
    if (createdUserIds.length > 0) {
      await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    }
    await prisma.role.deleteMany({ where: { id: CUSTOM_ROLE } });
    await prisma.organization.deleteMany({ where: { id: { in: [ORG_A, ORG_B, ORG_C] } } });
    await prisma.$disconnect();
  });

  // ════ A. `update_user_profile` — PATCH /identity/users/{id} (UNAUDITED by frozen §C4) ════

  it("PROFILE: 200 §5.6 envelope; display_name persisted + projected by get_user; row attribution server-set; ZERO audit rows (frozen `Audit: no`)", async () => {
    const u = await trackedUser();
    const res = await handleUpdateUserProfile(
      { targetUserId: u.id, displayName: "Md. Musa", updatedAt: u.updatedAt },
      {
        resolveSession: async () => ({ authUserId: u.authUserId }),
        ensureProvisioned: noProvision,
      },
    );
    expect(res.status).toBe(200);
    // Doc-5A §5.6 envelope: `result` + TOP-LEVEL `reference_id`.
    expect(res.body).toHaveProperty("result");
    expect(res.body).toHaveProperty("reference_id");
    const body = res.body as { result: { userId: string; updatedAt: Date }; reference_id: string };
    expect(body.result.userId).toBe(u.id);
    expect(typeof body.reference_id).toBe("string");

    // display_name LEG 1 (wire) + LEG 2 (`get_user` §C3 PassB:117 projection — Doc-2_Patch_v1.0.6).
    const read = await getUser(u.id);
    expect(read).toEqual(
      expect.objectContaining({
        found: true,
        user: expect.objectContaining({ displayName: "Md. Musa" }),
      }),
    );

    // Attribution is SERVER-populated (Doc-4A §9.7 — no input can name an actor): updated_by = subject.
    const row = await reloadUser(u.id);
    expect(row.updatedBy).toBe(u.id);
    expect(row.displayName).toBe("Md. Musa");

    // FROZEN discrimination: profile/preference edits are NOT a Doc-2 §9 MUST-audit action
    // (Doc-4C §C4 PassB:183 `Audit: no`) — zero `user` audit rows exist for this subject.
    expect(await userAudits(u.id)).toHaveLength(0);
  });

  it("PROFILE: display_name bound discriminates (max accepted · max+1 rejected 400 · explicit null rejected — optional ≠ nullable)", async () => {
    const u = await trackedUser();
    const session = { authUserId: u.authUserId };
    const deps = { resolveSession: async () => session, ensureProvisioned: noProvision };

    const atBound = "x".repeat(DISPLAY_NAME_MAX_LENGTH);
    const ok = await handleUpdateUserProfile(
      { targetUserId: u.id, displayName: atBound, updatedAt: u.updatedAt },
      deps,
    );
    expect(ok.status).toBe(200);
    expect((await reloadUser(u.id)).displayName).toBe(atBound);

    const over = await handleUpdateUserProfile(
      {
        targetUserId: u.id,
        displayName: "x".repeat(DISPLAY_NAME_MAX_LENGTH + 1),
        updatedAt: (await reloadUser(u.id)).updatedAt,
      },
      deps,
    );
    expect(over.status).toBe(400);
    const overBody = over.body as { error: { error_class: string; error_code: string } };
    expect(overBody.error.error_class).toBe("VALIDATION");
    expect(overBody.error.error_code).toBe("identity_user_invalid_input");

    // Explicit null ≠ absent (Doc-4A §9.2) — null semantics are undeclared, so null is rejected.
    const asNull = await handleUpdateUserProfile(
      {
        targetUserId: u.id,
        displayName: null as unknown as string,
        updatedAt: (await reloadUser(u.id)).updatedAt,
      },
      deps,
    );
    expect(asNull.status).toBe(400);
    expect((await reloadUser(u.id)).displayName).toBe(atBound); // unchanged by the rejected calls.
  });

  it("PROFILE: phone must be E.164; preferences FAIL-CLOSED 400 (no frozen key schema — ESC-IDN-PREF-KEYS, RV-0152 F1); stale If-Match → 409 + §9.5 ETag round-trip; absent If-Match → 400", async () => {
    const u = await trackedUser();
    const deps = {
      resolveSession: async () => ({ authUserId: u.authUserId }),
      ensureProvisioned: noProvision,
    };

    const badPhone = await handleUpdateUserProfile(
      { targetUserId: u.id, phone: "01712-345678", updatedAt: u.updatedAt },
      deps,
    );
    expect(badPhone.status).toBe(400);

    // FAIL-CLOSED discrimination (RV-0152 F1): the frozen `schema-validated keys only` constraint
    // (§C4 PassB:176/:179/:186) has NO registered key schema (`ESC-IDN-PREF-KEYS`) — ANY supplied
    // `preferences` (well-formed object OR not) is VALIDATION-rejected and NOTHING is written.
    // This test FAILS under the fail-open realization (an admitted arbitrary object).
    const objectPrefs = await handleUpdateUserProfile(
      { targetUserId: u.id, preferences: { locale: "bn-BD" }, updatedAt: u.updatedAt },
      deps,
    );
    expect(objectPrefs.status).toBe(400);
    const arrayPrefs = await handleUpdateUserProfile(
      { targetUserId: u.id, preferences: ["not", "an", "object"], updatedAt: u.updatedAt },
      deps,
    );
    expect(arrayPrefs.status).toBe(400);
    expect((await reloadUser(u.id)).preferencesJsonb).toBeNull(); // no wire path wrote it.

    // A preferences-free PATCH on the same row still succeeds (the fail-closed field does not
    // poison the contract's other declared fields).
    const good = await handleUpdateUserProfile(
      { targetUserId: u.id, phone: "+8801712345678", updatedAt: u.updatedAt },
      deps,
    );
    expect(good.status).toBe(200);

    // Stale optimistic token (the pre-update `updated_at`) → CONFLICT 409 (frozen code) carrying
    // the CURRENT token on the `ETag` response header (Doc-5A §9.5 Pass6:56–57 — RV-0152 F2).
    const stale = await handleUpdateUserProfile(
      { targetUserId: u.id, displayName: "Late Writer", updatedAt: u.updatedAt },
      deps,
    );
    expect(stale.status).toBe(409);
    expect((stale.body as { error: { error_code: string } }).error.error_code).toBe(
      "identity_user_update_conflict",
    );
    const currentRow = await reloadUser(u.id);
    expect(stale.headers?.ETag).toBe(concurrencyEtag(currentRow.updatedAt));

    // §9.6 re-read-retry ROUND-TRIP: the returned ETag token, replayed as If-Match (the parser
    // strips the quoted form), makes the retry succeed — the header is a USABLE current token.
    const retryToken = new Date(stale.headers!.ETag!.replace(/^"(.*)"$/, "$1"));
    const retried = await handleUpdateUserProfile(
      { targetUserId: u.id, displayName: "Late Writer", updatedAt: retryToken },
      deps,
    );
    expect(retried.status).toBe(200);

    // Absent/unparseable If-Match → the required `updated_at` SYNTAX failure → 400 (no ETag —
    // a SYNTAX failure is not a precondition mismatch).
    const noToken = await handleUpdateUserProfile(
      { targetUserId: u.id, displayName: "No Token", updatedAt: new Date(Number.NaN) },
      deps,
    );
    expect(noToken.status).toBe(400);
    expect(noToken.headers?.ETag).toBeUndefined();
  });

  it("PROFILE actor-scope: foreign `{id}` → 404 BYTE-IDENTICAL to absent-target 404 (non-disclosure); malformed id → 400; unauthenticated → 401 (no error_class)", async () => {
    const u = await trackedUser();
    const other = await trackedUser(); // a real, existing OTHER user.
    const deps = {
      resolveSession: async () => ({ authUserId: u.authUserId }),
      ensureProvisioned: noProvision,
    };

    const foreign = await handleUpdateUserProfile(
      { targetUserId: other.id, displayName: "Hijack", updatedAt: other.updatedAt },
      deps,
    );
    const absent = await handleUpdateUserProfile(
      { targetUserId: uuidv7(), displayName: "Ghost", updatedAt: new Date() },
      deps,
    );
    expect(foreign.status).toBe(404);
    expect(absent.status).toBe(404);
    // Byte-equivalence minus the per-request reference_id: identical error object.
    const foreignErr = (foreign.body as { error: unknown }).error;
    const absentErr = (absent.body as { error: unknown }).error;
    expect(foreignErr).toEqual(absentErr);
    expect((await reloadUser(other.id)).displayName).toBeNull(); // nothing written cross-user.

    const malformed = await handleUpdateUserProfile(
      { targetUserId: "not-a-uuid", displayName: "X", updatedAt: new Date() },
      deps,
    );
    expect(malformed.status).toBe(400); // SYNTAX (category 1) precedes the scope collapse.

    const unauthenticated = await handleUpdateUserProfile(
      { targetUserId: u.id, displayName: "X", updatedAt: u.updatedAt },
      { resolveSession: async () => null, ensureProvisioned: noProvision },
    );
    expect(unauthenticated.status).toBe(401);
    // DC-4 auth-boundary body: reference_id ONLY — pre-contract, no Doc-5A error_class.
    expect(unauthenticated.body).toHaveProperty("reference_id");
    expect(unauthenticated.body).not.toHaveProperty("error");
  });

  // ════ B. `update_user_2fa_settings` — POST named command (AUDITED, [ESC-IDN-AUDIT]) ════

  it("2FA: 200 — settings persisted; AUDIT atomic, USER-attributed, org = SERVER-resolved active org (prohibited-input probe: nothing on the wire named it)", async () => {
    const u = await trackedUser();
    await seedMembership({
      organizationId: ORG_A,
      roleId: CUSTOM_ROLE,
      userId: u.id,
      state: "active",
    });
    const res = await handleUpdateUser2faSettings(
      { targetUserId: u.id, twoFaEnabled: true, updatedAt: u.updatedAt },
      {
        resolveSession: async () => ({ authUserId: u.authUserId }),
        ensureProvisioned: noProvision,
        ipAddress: "203.0.113.10",
        userAgent: "vitest-8c",
      },
    );
    expect(res.status).toBe(200);
    const body = res.body as { result: { twoFaEnabled: boolean }; reference_id: string };
    expect(body.result.twoFaEnabled).toBe(true);

    expect((await reloadUser(u.id)).twoFaJsonb).toEqual({ enabled: true });

    const audits = await userAudits(u.id);
    expect(audits).toHaveLength(1);
    const audit = audits[0]!;
    expect(audit.action).toBe("user_2fa_settings_updated");
    expect(audit.actorType).toBe("user"); // NEVER System for a caller-driven write.
    expect(audit.actorId).toBe(u.id);
    // The audit org is the SERVER-resolved active org (D7 rule 8) — no request input names an org
    // (Doc-4A §9.7 prohibited inputs; the typed input surface carries no org/actor field at all).
    expect(audit.organizationId).toBe(ORG_A);
    expect(audit.newValue).toEqual({ two_fa: { enabled: true } });
  });

  it("2FA: recovery_method FAIL-CLOSED 400 (frozen enum has no registered value set — escalated, never coined); stale token → 409 + NO audit; foreign `{id}` → 404", async () => {
    const u = await trackedUser();
    await seedMembership({
      organizationId: ORG_A,
      roleId: CUSTOM_ROLE,
      userId: u.id,
      state: "active",
    });
    const deps = {
      resolveSession: async () => ({ authUserId: u.authUserId }),
      ensureProvisioned: noProvision,
    };

    const withRecovery = await handleUpdateUser2faSettings(
      { targetUserId: u.id, twoFaEnabled: true, recoveryMethod: "email", updatedAt: u.updatedAt },
      deps,
    );
    expect(withRecovery.status).toBe(400);

    const stale = await handleUpdateUser2faSettings(
      { targetUserId: u.id, twoFaEnabled: true, updatedAt: new Date("2001-01-01T00:00:00Z") },
      deps,
    );
    expect(stale.status).toBe(409);
    // §9.5 (RV-0152 F2): the stale-precondition 409 carries the CURRENT token on `ETag`.
    expect(stale.headers?.ETag).toBe(concurrencyEtag((await reloadUser(u.id)).updatedAt));

    const foreign = await handleUpdateUser2faSettings(
      { targetUserId: uuidv7(), twoFaEnabled: true, updatedAt: u.updatedAt },
      deps,
    );
    expect(foreign.status).toBe(404);

    // Idempotency/no-double-audit discrimination: every failed leg wrote NOTHING and audited NOTHING.
    expect(await userAudits(u.id)).toHaveLength(0);
    expect((await reloadUser(u.id)).twoFaJsonb).toBeNull();
  });

  it("2FA: no active membership → 404 collapse (the ADR-021 tenant audit leg is unreachable — the audited write fail-closes, never runs unaudited)", async () => {
    const u = await trackedUser(); // NO membership anywhere.
    const res = await handleUpdateUser2faSettings(
      { targetUserId: u.id, twoFaEnabled: true, updatedAt: u.updatedAt },
      {
        resolveSession: async () => ({ authUserId: u.authUserId }),
        ensureProvisioned: noProvision,
      },
    );
    expect(res.status).toBe(404);
    expect((await reloadUser(u.id)).twoFaJsonb).toBeNull();
    expect(await userAudits(u.id)).toHaveLength(0);
  });

  // ════ C. `deactivate_own_account` — POST named command (AUDITED; anonymize; Last-Owner) ════

  it("DEACTIVATE: 200 — soft_deleted + FULL anonymization set (incl. display_name); legal memberships → removed (audited); pending left; audit REDACTION-SAFE; get_user collapses", async () => {
    const u = await trackedUser({ withPersonalData: true });
    const mActive = await seedMembership({
      organizationId: ORG_A,
      roleId: CUSTOM_ROLE,
      userId: u.id,
      state: "active",
    });
    const mInvited = await seedMembership({
      organizationId: ORG_B,
      roleId: CUSTOM_ROLE,
      userId: u.id,
      state: "invited",
    });
    const mPending = await seedMembership({
      organizationId: ORG_C,
      roleId: CUSTOM_ROLE,
      userId: u.id,
      state: "pending",
    });

    const res = await handleDeactivateOwnAccount(
      { targetUserId: u.id, confirmation: true, updatedAt: u.updatedAt },
      {
        resolveSession: async () => ({ authUserId: u.authUserId }),
        ensureProvisioned: noProvision,
      },
    );
    expect(res.status).toBe(200);
    const body = res.body as { result: { userId: string; status: string } };
    expect(body.result).toEqual({ userId: u.id, status: "soft_deleted" });

    // display_name LEG 4 (anonymization-set membership) + the whole §C4 personal-field set.
    const row = await reloadUser(u.id);
    expect(row.status).toBe("soft_deleted");
    expect(row.deletedAt).not.toBeNull();
    expect(row.email).toBeNull();
    expect(row.phone).toBeNull();
    expect(row.displayName).toBeNull();
    expect(row.twoFaJsonb).toBeNull();
    expect(row.preferencesJsonb).toBeNull();
    expect(row.authUserId).toBeNull();

    // In-module membership consequences: legal `→ removed` edges only (Doc-2 §5.2).
    const states = new Map(
      (
        await prisma.membership.findMany({
          where: { id: { in: [mActive, mInvited, mPending] } },
          select: { id: true, state: true },
        })
      ).map((m) => [m.id, m.state]),
    );
    expect(states.get(mActive)).toBe("removed");
    expect(states.get(mInvited)).toBe("removed");
    expect(states.get(mPending)).toBe("pending"); // no legal edge — left fail-closed.

    // The departure audit: USER-attributed, platform-owned record (org null), REDACTION-SAFE.
    const audits = await userAudits(u.id);
    expect(audits).toHaveLength(1);
    const audit = audits[0]!;
    expect(audit.action).toBe("user_account_deactivated");
    expect(audit.actorType).toBe("user");
    expect(audit.actorId).toBe(u.id);
    expect(audit.organizationId).toBeNull();
    const serialized = JSON.stringify({ old: audit.oldValue, new: audit.newValue });
    expect(serialized).not.toContain("Personal Name To Redact"); // no personal VALUE in the ledger
    expect(serialized).not.toContain("@example.test");
    expect(serialized).not.toContain("+8801712345678");
    expect(audit.newValue).toEqual(
      expect.objectContaining({
        status: "soft_deleted",
        anonymized_fields: expect.arrayContaining(["display_name", "email", "phone"]),
      }),
    );

    // Membership-removal audits (the ENUMERATED §9 "membership remove" action), USER-attributed.
    const membershipAudits = await prisma.auditRecord.findMany({
      where: { entityType: "membership", entityId: { in: [mActive, mInvited] } },
    });
    expect(membershipAudits).toHaveLength(2);
    for (const m of membershipAudits) {
      expect(m.action).toBe("membership_removed");
      expect(m.actorType).toBe("user");
      expect(m.actorId).toBe(u.id);
    }

    // The canonical read collapses (soft-deleted ⇒ not disclosable).
    expect(await getUser(u.id)).toEqual({ found: false });
  });

  it("DEACTIVATE: sole active Owner → 422 identity_user_last_owner_block; NOTHING written, NOTHING audited (succession first)", async () => {
    const u = await trackedUser({ withPersonalData: true });
    await seedMembership({
      organizationId: ORG_C,
      roleId: ownerRoleId,
      userId: u.id,
      state: "active",
    });

    const res = await handleDeactivateOwnAccount(
      { targetUserId: u.id, confirmation: true, updatedAt: u.updatedAt },
      {
        resolveSession: async () => ({ authUserId: u.authUserId }),
        ensureProvisioned: noProvision,
      },
    );
    expect(res.status).toBe(422);
    const body = res.body as { error: { error_class: string; error_code: string } };
    expect(body.error.error_class).toBe("BUSINESS");
    expect(body.error.error_code).toBe("identity_user_last_owner_block");

    const row = await reloadUser(u.id);
    expect(row.status).toBe("active");
    expect(row.email).not.toBeNull(); // no partial anonymization.
    expect(await userAudits(u.id)).toHaveLength(0);
  });

  it("DEACTIVATE: confirmation must be explicitly true (400); TERMINAL replay → 404 with exactly ONE departure audit (idempotency discrimination)", async () => {
    const u = await trackedUser({ withPersonalData: true });
    await seedMembership({
      organizationId: ORG_A,
      roleId: CUSTOM_ROLE,
      userId: u.id,
      state: "active",
    });
    const deps = {
      resolveSession: async () => ({ authUserId: u.authUserId }),
      ensureProvisioned: noProvision,
    };

    const unconfirmed = await handleDeactivateOwnAccount(
      { targetUserId: u.id, confirmation: false, updatedAt: u.updatedAt },
      deps,
    );
    expect(unconfirmed.status).toBe(400);

    const departed = await handleDeactivateOwnAccount(
      { targetUserId: u.id, confirmation: true, updatedAt: u.updatedAt },
      deps,
    );
    expect(departed.status).toBe(200);

    // Replay: the subject is terminal (soft_deleted; auth linkage severed) — the §6.6 collapse,
    // never a second departure, never a second audit row (`soft_deleted` has NO outgoing edge).
    const replay = await handleDeactivateOwnAccount(
      { targetUserId: u.id, confirmation: true, updatedAt: u.updatedAt },
      deps,
    );
    expect(replay.status).toBe(404);
    expect(
      (await userAudits(u.id)).filter((a) => a.action === "user_account_deactivated"),
    ).toHaveLength(1);
  });

  it("DEACTIVATE stale CAS (NIT-Δ1 fold, RV-0152): a stale If-Match token on a legal departure → 409 identity_user_update_conflict CARRYING the §9.5 ETag current token; nothing written, nothing audited", async () => {
    // The one §C4 stale leg the base 6.1 suite left untested (RV-0152 delta NIT-Δ1; empirically
    // confirmed by Review-B's P3 probe staying silent here). Same shared plumbing as the other
    // three contracts — this pins the deactivate leg itself.
    const u = await trackedUser({ withPersonalData: true });
    await seedMembership({
      organizationId: ORG_A,
      roleId: CUSTOM_ROLE,
      userId: u.id,
      state: "active",
    });

    const stale = await handleDeactivateOwnAccount(
      { targetUserId: u.id, confirmation: true, updatedAt: new Date(0) },
      {
        resolveSession: async () => ({ authUserId: u.authUserId }),
        ensureProvisioned: noProvision,
      },
    );
    expect(stale.status).toBe(409);
    const body = stale.body as { error: { error_class: string; error_code: string } };
    expect(body.error.error_class).toBe("CONFLICT");
    expect(body.error.error_code).toBe("identity_user_update_conflict");
    // Doc-5A §9.5 (RV-0152 F2 / call-13): the stale-precondition 409 carries the CURRENT token on
    // `ETag` so the caller can re-read-retry (§9.6).
    expect(stale.headers?.ETag).toBe(concurrencyEtag((await reloadUser(u.id)).updatedAt));

    // No partial departure: the user is untouched (still active, personal data intact) and the
    // failed attempt appended NO audit row (validation is not a workflow — Doc-4A §11.3).
    const row = await reloadUser(u.id);
    expect(row.status).toBe("active");
    expect(row.email).not.toBeNull();
    expect(await userAudits(u.id)).toHaveLength(0);
  });

  // ════ D. `set_user_account_status` — POST named command (Admin 21.6; staff-space firewall) ════

  it("ADMIN-STATE: injected staff principal suspends + reinstates → 200/200; audits ADMIN-attributed (never System), org NULL, structured reason recorded, distinct tokens", async () => {
    const admin = await trackedUser();
    const target = await trackedUser();
    const staffDeps = {
      resolveSession: async () => ({ authUserId: admin.authUserId }),
      ensureProvisioned: noProvision,
      resolveStaffContext: async () => ({ userId: admin.id, isPlatformStaff: true as const }),
    };

    const suspended = await handleSetUserAccountStatus(
      {
        targetUserId: target.id,
        targetStatus: "suspended",
        reason: "ToS violation — spam RFQs",
        updatedAt: target.updatedAt,
      },
      staffDeps,
    );
    expect(suspended.status).toBe(200);
    expect((await reloadUser(target.id)).status).toBe("suspended");

    const reinstated = await handleSetUserAccountStatus(
      {
        targetUserId: target.id,
        targetStatus: "active",
        reason: "Appeal upheld",
        updatedAt: (await reloadUser(target.id)).updatedAt,
      },
      staffDeps,
    );
    expect(reinstated.status).toBe(200);
    expect((await reloadUser(target.id)).status).toBe("active");

    const audits = await userAudits(target.id);
    expect(audits.map((a) => a.action)).toEqual([
      "user_account_suspended",
      "user_account_reinstated",
    ]);
    for (const audit of audits) {
      expect(audit.actorType).toBe("admin"); // Admin attribution — NEVER System (caller-driven).
      expect(audit.actorId).toBe(admin.id);
      expect(audit.organizationId).toBeNull(); // no org context — platform governance (§5.6).
    }
    expect(audits[0]!.newValue).toEqual(
      expect.objectContaining({ status: "suspended", reason: "ToS violation — spam RFQs" }),
    );
  });

  it("ADMIN-STATE actor-scope: staff-space NEVER via org roles (RV-0147 B8) — forged-row caller pinned deny(staff_space_firewall) at the check_permission QUERY level + unconditional wire 403 (DC-3 fail-closed resolver)", async () => {
    const caller = await trackedUser();
    const target = await trackedUser();
    // The caller is an ACTIVE member of ORG_A on the custom role, and we FORGE the org-role
    // composition to map `staff_super_admin` onto that role — the RV-0147 B8 attack shape.
    await seedMembership({
      organizationId: ORG_A,
      roleId: CUSTOM_ROLE,
      userId: caller.id,
      state: "active",
    });
    await prisma.rolePermission.create({
      data: {
        roleId: CUSTOM_ROLE,
        permissionId: staffSuperAdminPermissionId,
        organizationId: ORG_A,
      },
    });

    try {
      // THE DIRECT DECISION-PIN (RV-0152 F-B1(b)) — the staff-space-firewall property asserted at
      // the `check_permission` QUERY level, in-slice, WHILE the forged row is live: the forged
      // caller's `staff_super_admin` resolution is deny(staff_space_firewall). THIS assertion is
      // the one that flips under a space-blind resolution (Review-B's P5 sabotage) — the wire-level
      // 403 below is deny-BY-CONSTRUCTION and deliberately does not depend on it.
      const pinned = await checkPermission({
        userId: caller.id,
        organizationId: ORG_A,
        permissionSlug: SET_USER_ACCOUNT_STATUS_SLUG,
      });
      expect(pinned).toEqual({
        decision: "deny",
        satisfiedBy: "none",
        denyReason: "staff_space_firewall",
      });

      // NO staff resolver injected ⇒ the PRODUCTION DC-3 fail-closed resolver runs; the wire deny
      // is UNCONDITIONAL 403 by construction (the composition's authorize() call is intentionally
      // decision-unused — see the route-handler header + the F-B1 record).
      const res = await handleSetUserAccountStatus(
        {
          targetUserId: target.id,
          targetStatus: "suspended",
          reason: "forged-attempt",
          updatedAt: target.updatedAt,
        },
        {
          resolveSession: async () => ({ authUserId: caller.authUserId }),
          ensureProvisioned: noProvision,
        },
      );
      expect(res.status).toBe(403);
      const body = res.body as {
        error: { error_class: string; error_code: string };
        reference_id: string;
      };
      expect(body.error.error_class).toBe("AUTHORIZATION");
      expect(body.error.error_code).toBe("identity_user_forbidden");
      expect(typeof body.reference_id).toBe("string"); // §6.1 envelope: top-level reference_id.

      // Nothing happened to the target; nothing was audited.
      expect((await reloadUser(target.id)).status).toBe("active");
      expect(await userAudits(target.id)).toHaveLength(0);

      // Self-targeting through the ADMIN endpoint is equally denied (self ≠ Admin-state).
      const selfTry = await handleSetUserAccountStatus(
        {
          targetUserId: caller.id,
          targetStatus: "suspended",
          reason: "self-admin-attempt",
          updatedAt: caller.updatedAt,
        },
        {
          resolveSession: async () => ({ authUserId: caller.authUserId }),
          ensureProvisioned: noProvision,
        },
      );
      expect(selfTry.status).toBe(403);
    } finally {
      await prisma.rolePermission.deleteMany({
        where: { roleId: CUSTOM_ROLE, permissionId: staffSuperAdminPermissionId },
      });
    }
  });

  it("ADMIN-STATE (staff path): absent target → 404; malformed id / bad target_status / empty reason → 400 (SYNTAX before AUTHZ for every caller); same-state replay → 409 + no double audit; stale token → 409", async () => {
    const admin = await trackedUser();
    const target = await trackedUser();
    const staffDeps = {
      resolveSession: async () => ({ authUserId: admin.authUserId }),
      ensureProvisioned: noProvision,
      resolveStaffContext: async () => ({ userId: admin.id, isPlatformStaff: true as const }),
    };
    const nonStaffDeps = {
      resolveSession: async () => ({ authUserId: admin.authUserId }),
      ensureProvisioned: noProvision,
    };

    const absent = await handleSetUserAccountStatus(
      { targetUserId: uuidv7(), targetStatus: "suspended", reason: "r", updatedAt: new Date() },
      staffDeps,
    );
    expect(absent.status).toBe(404);
    expect((absent.body as { error: { error_code: string } }).error.error_code).toBe(
      "identity_user_not_found",
    );

    // SYNTAX failures are 400 for EVERY caller — including a NON-staff one (category order:
    // SYNTAX before the CONTEXT/AUTHZ 403).
    const malformedNonStaff = await handleSetUserAccountStatus(
      { targetUserId: "not-a-uuid", targetStatus: "suspended", reason: "r", updatedAt: new Date() },
      nonStaffDeps,
    );
    expect(malformedNonStaff.status).toBe(400);

    const badStatus = await handleSetUserAccountStatus(
      {
        targetUserId: target.id,
        targetStatus: "soft_deleted" as never, // not in the §C4 enum(suspended|active)
        reason: "r",
        updatedAt: target.updatedAt,
      },
      staffDeps,
    );
    expect(badStatus.status).toBe(400);

    const emptyReason = await handleSetUserAccountStatus(
      {
        targetUserId: target.id,
        targetStatus: "suspended",
        reason: "   ",
        updatedAt: target.updatedAt,
      },
      staffDeps,
    );
    expect(emptyReason.status).toBe(400);

    // ADMIN_REASON_MAX_LENGTH bound discrimination (RV-0152 NIT-B3 — the call-6-sibling
    // [realization convention], face-exported): bound+1 rejected 400 …
    const overReason = await handleSetUserAccountStatus(
      {
        targetUserId: target.id,
        targetStatus: "suspended",
        reason: "x".repeat(ADMIN_REASON_MAX_LENGTH + 1),
        updatedAt: target.updatedAt,
      },
      staffDeps,
    );
    expect(overReason.status).toBe(400);
    expect(await userAudits(target.id)).toHaveLength(0); // nothing written/audited by any 400 leg.

    // … and a reason AT the bound is accepted (it is the legal suspend below). Then the SAME-state
    // replay: `suspended → suspended` is NOT a Doc-4C §C4 edge (`active ⇄ suspended` only) ⇒ the
    // frozen `identity_user_status_conflict` 409; ONE audit row.
    const atBoundReason = "x".repeat(ADMIN_REASON_MAX_LENGTH);
    const first = await handleSetUserAccountStatus(
      {
        targetUserId: target.id,
        targetStatus: "suspended",
        reason: atBoundReason,
        updatedAt: target.updatedAt,
      },
      staffDeps,
    );
    expect(first.status).toBe(200);
    expect((await userAudits(target.id))[0]!.newValue).toEqual(
      expect.objectContaining({ reason: atBoundReason }),
    );
    const replay = await handleSetUserAccountStatus(
      {
        targetUserId: target.id,
        targetStatus: "suspended",
        reason: "r2",
        updatedAt: (await reloadUser(target.id)).updatedAt,
      },
      staffDeps,
    );
    expect(replay.status).toBe(409);
    expect((replay.body as { error: { error_code: string } }).error.error_code).toBe(
      "identity_user_status_conflict",
    );
    expect(await userAudits(target.id)).toHaveLength(1);
    // F2 LEG DISCRIMINATION (RV-0152 judgment call): a machine-ILLEGAL-edge 409 is a STATE-legality
    // rejection, NOT a stale precondition — Doc-5A §9.5 (Pass6:56) attaches the ETag current-token
    // carriage to "a token mismatch (a stale precondition)" only, so NO ETag rides this leg.
    expect(replay.headers?.ETag).toBeUndefined();

    // Stale optimistic token on a LEGAL edge → 409 (CAS on status × updated_at) CARRYING the §9.5
    // ETag current token (the losing-write / stale-precondition leg — Doc-5A §9.4→§9.5; RV-0152 F2).
    const stale = await handleSetUserAccountStatus(
      {
        targetUserId: target.id,
        targetStatus: "active",
        reason: "r3",
        updatedAt: target.updatedAt,
      },
      staffDeps,
    );
    expect(stale.status).toBe(409);
    expect(stale.headers?.ETag).toBe(concurrencyEtag((await reloadUser(target.id)).updatedAt));
  });

  it("ADMIN-STATE rollback direction (D7 invariant 1): a sabotaged audit append rolls the WHOLE transaction back — no status change, no audit row", async () => {
    const admin = await trackedUser();
    const target = await trackedUser();

    await expect(
      setUserAccountStatus(
        {
          targetUserId: target.id,
          targetStatus: "suspended",
          reason: "sabotage-probe",
          updatedAt: target.updatedAt,
        },
        { adminUserId: admin.id, isPlatformStaff: true },
        {
          appendAuditRecord: async () => {
            throw new Error("audit append sabotaged (8C rollback probe)");
          },
        },
      ),
    ).rejects.toThrow("audit append sabotaged");

    // No business write without an audit row: the status write rolled back WITH the failed audit.
    expect((await reloadUser(target.id)).status).toBe("active");
    expect(await userAudits(target.id)).toHaveLength(0);
  });

  it("2FA rollback direction (D7, tenant leg): sabotaged audit append inside withActiveOrg rolls the settings write back", async () => {
    const u = await trackedUser();
    await seedMembership({
      organizationId: ORG_A,
      roleId: CUSTOM_ROLE,
      userId: u.id,
      state: "active",
    });

    // Drive the composition path but with a sabotaged audit dep at the CONTRACT level: run the
    // command inside a real active-org transaction whose audit append throws.
    const { withActiveOrg } = await import("../../src/server/context");
    const { updateUser2faSettings } = await import("../../src/modules/identity/contracts");
    await expect(
      withActiveOrg({ authUserId: u.authUserId }, (tx, context) =>
        updateUser2faSettings(
          { targetUserId: u.id, twoFaEnabled: true, updatedAt: u.updatedAt },
          { userId: context.userId, activeOrgId: context.activeOrgId },
          {
            appendAuditRecord: async () => {
              throw new Error("audit append sabotaged (2fa rollback probe)");
            },
          },
          tx,
        ),
      ),
    ).rejects.toThrow("audit append sabotaged");

    expect((await reloadUser(u.id)).twoFaJsonb).toBeNull(); // the settings write rolled back.
    expect(await userAudits(u.id)).toHaveLength(0);
  });

  it("AUDIT-FACADE composition pin (SOURCE-VERIFIED, RV-0150 F-B2 shape): every audited §C4 composition imports appendAuditRecord from @/modules/core/contracts and injects THAT binding — no shadow audit surface", () => {
    // RV-0152 NIT-B2 remedy (strengthen, not delete): the old `typeof === "function"` probe
    // discriminated nothing. This pin reads the three audited compositions' SOURCE and asserts
    // (1) the audit dependency is imported from the M0 contracts facade path — the ONLY
    // boundary-legal audit-write surface (D7 rule 4) — and (2) that binding is what gets injected
    // (`{ appendAuditRecord }`). It FAILS if a composition swaps the import to a local/shadow
    // implementation, another module's internals, or injects a different concrete. (Runtime
    // admission through the real facade is separately proven by the 2FA/deactivate/set-status
    // audit-row assertions above — this pins the WIRING.)
    const auditedCompositions = [
      "src/server/identity/update-user-2fa-settings.route-handler.ts",
      "src/server/identity/deactivate-own-account.route-handler.ts",
      "src/server/identity/set-user-account-status.route-handler.ts",
    ];
    for (const file of auditedCompositions) {
      const source = readFileSync(resolve(process.cwd(), file), "utf8");
      expect(source).toContain('import { appendAuditRecord } from "@/modules/core/contracts";');
      // NIT-Δ2 fold (RV-0152 Review-B delta): a GENUINE injection-site pin — the bare-substring
      // assertion was subsumed by the import line itself. The binding must appear AGAIN outside
      // the import statement (the `{ appendAuditRecord }` deps-position injection), so ≥2 exact
      // occurrences discriminate an import-only file from one that actually injects the binding.
      const occurrences = source.match(/\{ appendAuditRecord \}/g) ?? [];
      expect(occurrences.length, `${file} must inject the imported binding`).toBeGreaterThanOrEqual(
        2,
      );
      // No parallel audit-write surface in CODE (comment lines stripped — they legitimately cite
      // the ADR-021 policy name): the composition never touches the audit table directly.
      const codeOnly = source
        .split("\n")
        .filter((line) => !line.trimStart().startsWith("//"))
        .join("\n");
      expect(codeOnly).not.toMatch(/auditRecord\.create|audit_records/);
    }
  });
});
