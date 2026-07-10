import "../_harness/env"; // load the ephemeral test-DB env per worker (Doc-8B §3) before Prisma connects.
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "../../src/shared/db";
import { uuidv7 } from "../../src/shared/ids";
import { concurrencyEtag } from "../../src/shared/http";
import type { ensureProvisioned } from "../../src/server/auth";
import { handleGetWorkflowSettings, handleUpdateWorkflowSettings } from "../../src/server/identity";
import { updateWorkflowSettings } from "../../src/modules/identity/contracts";
import type {
  CheckPermissionResult,
  UpdateWorkflowSettingsInput,
} from "../../src/modules/identity/contracts";
import { appendAuditRecord } from "../../src/modules/core/contracts";

// W2-IDN-6.8 — the §C11 Organization Workflow Settings WIRED surface (Doc-5C §6.1 rows 34–35, both
// contracts), Doc-8 bands 8C + 8E:
//   8C — envelope (Doc-5A §5.6/§6.1) · error class+status (§6.2, the frozen §C11 register per contract:
//        VALIDATION 400 · AUTHORIZATION 403 · NOT_FOUND 404 · BUSINESS 422 · CONFLICT 409) · idempotency
//        (§B.6 REQUIRED-key + replay identity; the [DC-5] window resolved via the REAL
//        `identity.command_dedup_window` POLICY key through `core.config_value_query.v1`, no literal) ·
//        actor-scope (the REAL Doc-2 §7 slug `can_manage_workflow_settings` O,D — Owner/Director allow,
//        Officer deny) · optimistic concurrency (If-Match/ETag; NOT create-class — absent row 404) ·
//        deferred-field fail-close · SYNTAX (enum + jsonb shapes).
//   8E — THE GATE: the governance-signal FIREWALL (Invariant #6 / §B.7 / §C12.6) DISCRIMINATING-TESTED —
//        the audited write's field set is EXACTLY the four §C11 workflow keys (no Trust/Performance/
//        Financial-Tier/Capacity/Buyer-Vendor-Status key), the org's Trust-reflected `verification_level`
//        + sibling identity tables are untouched, and a governance-signal-shaped SMUGGLE never enters the
//        write. (The five governance signals are M5/M2/M4-owned — separate schemas, no cross-module FK,
//        not present in this M1 test DB; M1 has NO code path to write them — the structural firewall. This
//        test proves the write's accessible-schema footprint is exactly {workflow_settings, audit, dedup}.)
// All vs REAL PostgreSQL through the composition surfaces ONLY (never module internals).

// ── Deterministic fixtures (UUIDv7-shaped: version nibble 7, variant 8..b; 0xd68 = W2-IDN-6.8). ──
const COMMAND_DEDUP_STORE_KEY = "identity.command_dedup_window";

// The frozen field/signal sets (bound by pointer — Doc-6C §3.7 realized columns + CLAUDE.md §4). Defined
// locally (not imported from a domain internal) so the test asserts the frozen shape independently.
const WORKFLOW_AUDIT_KEYS = [
  "approval_chain",
  "financial_permissions",
  "notification_rules",
  "rfq_approval_mode",
] as const;
const GOVERNANCE_SIGNAL_KEYS = [
  "trust_score",
  "performance_score",
  "financial_tier",
  "capacity_profile",
  "buyer_vendor_status",
] as const;

let ownerRoleId: string;
let directorRoleId: string;
let officerRoleId: string;

const createdUserIds: string[] = [];
const createdOrgIds: string[] = [];

/** The provisioning stub — fixtures are pre-seeded; the hook must not mint a personal org. */
const noProvision: typeof ensureProvisioned = async () => ({
  created: false,
  userId: "",
  organizationId: null,
  organizationHumanRef: null,
  ownerMembershipId: null,
});

const asSession = (authUserId: string) => async () => ({ authUserId });

const wireJson = (b: unknown): unknown => JSON.parse(JSON.stringify(b));
const key = () => `iv-k-${uuidv7()}`;

const deps = (auth: string, k: string | null | undefined) => ({
  resolveSession: asSession(auth),
  ensureProvisioned: noProvision,
  idempotencyKey: k,
});
const readDeps = (auth: string) => ({
  resolveSession: asSession(auth),
  ensureProvisioned: noProvision,
});

/** Mint a fresh user. */
async function freshUser() {
  const id = uuidv7();
  const authUserId = uuidv7();
  await prisma.user.create({ data: { id, authUserId, status: "active" } });
  createdUserIds.push(id);
  return { id, authUserId };
}

/** Mint a fresh org (direct seed — NOT via the wire) with the given members. `withSettings` seeds the
 *  active-org workflow_settings singleton (provisioning of the first row is OUT OF §C11 scope — no
 *  create_workflow_settings contract exists; the update is a pure CAS-update, absent row → 404). */
async function freshOrg(params: {
  tag?: string;
  withSettings?: boolean;
  members?: Array<{ userId: string; roleId: string }>;
}) {
  const id = uuidv7();
  const humanRef = `ORG-D68-${id.slice(-8)}`;
  await prisma.organization.create({
    data: {
      id,
      humanRef,
      name: `IDN68 ${params.tag ?? "Org"}`,
      slug: humanRef.toLowerCase(),
      orgStatus: "active",
      verificationLevel: "unverified",
    },
  });
  createdOrgIds.push(id);
  for (const m of params.members ?? []) {
    await prisma.membership.create({
      data: {
        id: uuidv7(),
        organizationId: id,
        userId: m.userId,
        roleId: m.roleId,
        state: "active",
        joinedAt: new Date(),
      },
    });
  }
  let settingsUpdatedAt: Date | null = null;
  if (params.withSettings === true) {
    const row = await prisma.organizationWorkflowSettings.create({
      data: { id: uuidv7(), organizationId: id, rfqApprovalMode: "none" },
    });
    settingsUpdatedAt = row.updatedAt;
  }
  return { id, settingsUpdatedAt };
}

async function reloadSettings(orgId: string) {
  return prisma.organizationWorkflowSettings.findFirstOrThrow({ where: { organizationId: orgId } });
}
async function reloadOrg(orgId: string) {
  return prisma.organization.findUniqueOrThrow({ where: { id: orgId } });
}
async function settingsAudits(orgId: string) {
  return prisma.auditRecord.findMany({
    where: { entityType: "organization_workflow_settings", entityId: orgId },
    orderBy: { eventTime: "asc" },
  });
}

describe("W2-IDN-6.8 §C11 workflow-settings wired surface — 8C + 8E (real PostgreSQL)", () => {
  beforeAll(async () => {
    for (const [name, setter] of [
      ["Owner", (id: string) => (ownerRoleId = id)],
      ["Director", (id: string) => (directorRoleId = id)],
      ["Officer", (id: string) => (officerRoleId = id)],
    ] as const) {
      setter(
        (
          await prisma.role.findFirstOrThrow({
            where: { name, organizationId: null, isSystemBundle: true, deletedAt: null },
            select: { id: true },
          })
        ).id,
      );
    }
    // TEST-SCOPED `[DC-5]` window seed for the REAL `identity.command_dedup_window` POLICY key (UNSEEDED
    // until W2-IDN-7 — the IDN-4/6.2 precedent). The §B.6 replay reads THIS via `core.config_value_
    // query.v1`; there is NO literal fallback (proven by the replay working only when it is seeded).
    await prisma.systemConfiguration.deleteMany({ where: { key: COMMAND_DEDUP_STORE_KEY } });
    await prisma.systemConfiguration.create({
      data: {
        id: uuidv7(),
        key: COMMAND_DEDUP_STORE_KEY,
        valueJsonb: "24h",
        valueType: "duration",
      },
    });
  });

  afterAll(async () => {
    await prisma.commandDedup.deleteMany({ where: { actorUserId: { in: createdUserIds } } });
    await prisma.systemConfiguration.deleteMany({ where: { key: COMMAND_DEDUP_STORE_KEY } });
    await prisma.organizationWorkflowSettings.deleteMany({
      where: { organizationId: { in: createdOrgIds } },
    });
    await prisma.membership.deleteMany({ where: { organizationId: { in: createdOrgIds } } });
    await prisma.organization.deleteMany({ where: { id: { in: createdOrgIds } } });
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    await prisma.$disconnect();
  });

  // ════ A. get_workflow_settings — GET /identity/organization_workflow_settings ════

  it("GET: present → 200 + the six-key workflow_settings object (four realized + two deferred null) + the ETag current token; absent settings row → 404; unauthenticated → 401", async () => {
    const owner = await freshUser();
    const org = await freshOrg({
      tag: "GetPresent",
      withSettings: true,
      members: [{ userId: owner.id, roleId: ownerRoleId }],
    });
    // Give the seeded row some realized jsonb so the projection is exercised.
    await prisma.organizationWorkflowSettings.updateMany({
      where: { organizationId: org.id },
      data: {
        rfqApprovalMode: "single",
        approvalChainJsonb: [{ step: 1, requires: "can_approve_rfq" }],
        financialPermissionsJsonb: { award_approval_threshold_bdt: 500000 },
        notificationRulesJsonb: { on_award: ["owner"] },
      },
    });
    const row = await reloadSettings(org.id);

    const present = await handleGetWorkflowSettings(readDeps(owner.authUserId));
    expect(present.status).toBe(200);
    const body = present.body as unknown as { result: Record<string, unknown> };
    expect(body.result).toEqual({
      organizationId: org.id,
      rfqApprovalMode: "single",
      approvalChain: [{ step: 1, requires: "can_approve_rfq" }],
      financialPermissions: { award_approval_threshold_bdt: 500000 },
      notificationRules: { on_award: ["owner"] },
      defaultRoutingMode: null, // DEFERRED — no Doc-6C §3.7 column; the frozen six-key shape, null value.
      buyerCourtesyOptions: null, // DEFERRED — no Doc-6C §3.7 column.
    });
    // ETag carries the current `updated_at` (the client's next If-Match token — Doc-5C §6.4 / §9.5).
    expect(present.headers?.ETag).toBe(concurrencyEtag(row.updatedAt));

    // Absent settings row → 404 (owning-org read with no singleton row; the §6.3 collapse).
    const noRow = await freshUser();
    const orgNoRow = await freshOrg({
      tag: "GetAbsent",
      members: [{ userId: noRow.id, roleId: ownerRoleId }],
    });
    void orgNoRow;
    const absent = await handleGetWorkflowSettings(readDeps(noRow.authUserId));
    expect(absent.status).toBe(404);

    // Unauthenticated → the DC-4 auth-boundary 401 (no Doc-5A error_class).
    const anon = await handleGetWorkflowSettings({
      resolveSession: async () => null,
      ensureProvisioned: noProvision,
    });
    expect(anon.status).toBe(401);
  });

  // ════ B. update_workflow_settings — PATCH (8C) ════

  it("PATCH: Owner AND Director allowed (200; four fields persisted; audit workflow_settings_changed with old/new); Officer → 403; absent row → 404 (not create-class); stale If-Match → 409 + ETag; deferred fields → 400; empty patch → 400; bad enum → 400; bad jsonb shape → 400; missing If-Match → 400; absent Idempotency-Key → 400", async () => {
    const owner = await freshUser();
    const director = await freshUser();
    const officer = await freshUser();
    const org = await freshOrg({
      tag: "Patch",
      withSettings: true,
      members: [
        { userId: owner.id, roleId: ownerRoleId },
        { userId: director.id, roleId: directorRoleId },
        { userId: officer.id, roleId: officerRoleId },
      ],
    });
    const token0 = org.settingsUpdatedAt!;

    // Owner leg — set all four realizable fields.
    const first = await handleUpdateWorkflowSettings(
      {
        rfqApprovalMode: "multi_step",
        approvalChain: [{ step: 1, requires: "can_approve_rfq" }],
        financialPermissions: { award_approval_threshold_bdt: 1000000 },
        notificationRules: { on_award: ["owner", "director"] },
        updatedAt: token0,
      },
      deps(owner.authUserId, key()),
    );
    expect(first.status).toBe(200);
    const token1 = new Date(
      (first.body as unknown as { result: { updatedAt: string } }).result.updatedAt,
    );
    const afterOwner = await reloadSettings(org.id);
    expect(afterOwner.rfqApprovalMode).toBe("multi_step");
    expect(afterOwner.approvalChainJsonb).toEqual([{ step: 1, requires: "can_approve_rfq" }]);
    expect(afterOwner.financialPermissionsJsonb).toEqual({ award_approval_threshold_bdt: 1000000 });

    // Director leg (the real O,D slug) — a partial patch (one field), prior fields unchanged.
    const second = await handleUpdateWorkflowSettings(
      { rfqApprovalMode: "single", updatedAt: token1 },
      deps(director.authUserId, key()),
    );
    expect(second.status).toBe(200);
    const afterDirector = await reloadSettings(org.id);
    expect(afterDirector.rfqApprovalMode).toBe("single");
    expect(afterDirector.approvalChainJsonb).toEqual([{ step: 1, requires: "can_approve_rfq" }]); // unchanged

    // Audit: two workflow_settings_changed rows, USER-attributed, org-anchored, old/new diff.
    const audits = await settingsAudits(org.id);
    expect(audits).toHaveLength(2);
    expect(new Set(audits.map((a) => a.action))).toEqual(new Set(["workflow_settings_changed"]));
    for (const a of audits) {
      expect(a.actorType).toBe("user");
      expect(a.entityType).toBe("organization_workflow_settings");
      expect(a.entityId).toBe(org.id);
    }
    const ownerAudit = audits.find((a) => a.actorId === owner.id)!;
    expect((ownerAudit.oldValue as { rfq_approval_mode: string }).rfq_approval_mode).toBe("none");
    expect((ownerAudit.newValue as { rfq_approval_mode: string }).rfq_approval_mode).toBe(
      "multi_step",
    );

    // Officer → 403 (the real slug is O,D only; Officer is unmapped in the seed).
    const forbidden = await handleUpdateWorkflowSettings(
      { rfqApprovalMode: "none", updatedAt: (await reloadSettings(org.id)).updatedAt },
      deps(officer.authUserId, key()),
    );
    expect(forbidden.status).toBe(403);
    expect((forbidden.body as { error: { error_code: string } }).error.error_code).toBe(
      "identity_workflow_forbidden",
    );

    // Absent settings row (an org with NO row) → 404 (NOT create-class — Doc-5C §6.2).
    const orphan = await freshUser();
    await freshOrg({ tag: "NoRow", members: [{ userId: orphan.id, roleId: ownerRoleId }] });
    const noRow = await handleUpdateWorkflowSettings(
      { rfqApprovalMode: "single", updatedAt: new Date() },
      deps(orphan.authUserId, key()),
    );
    expect(noRow.status).toBe(404);
    expect((noRow.body as { error: { error_code: string } }).error.error_code).toBe(
      "identity_workflow_not_found",
    );

    // Stale If-Match → the frozen CONFLICT + the §9.5 ETag current token.
    const current = await reloadSettings(org.id);
    const stale = await handleUpdateWorkflowSettings(
      { rfqApprovalMode: "none", updatedAt: new Date(0) },
      deps(owner.authUserId, key()),
    );
    expect(stale.status).toBe(409);
    expect((stale.body as { error: { error_code: string } }).error.error_code).toBe(
      "identity_workflow_conflict",
    );
    expect(stale.headers?.ETag).toBe(concurrencyEtag(current.updatedAt));

    // Deferred fields FAIL CLOSED → 400 — BOTH §C11:718-declared deferred fields pinned (RV-0159 B-1;
    // the twin-unpinned class of RV-0157 MINOR-B1). Each assertion is NON-VACUOUS: dropping its operand
    // from the policy's `defaultRoutingModeSupplied || buyerCourtesyOptionsSupplied` reject would let a
    // frozen-declared field WRITE (200) instead of reject (400) → the `toBe(400)` REDs.
    const deferred = await handleUpdateWorkflowSettings(
      {
        rfqApprovalMode: "none",
        deferredFields: { defaultRoutingModeSupplied: true },
        updatedAt: current.updatedAt,
      },
      deps(owner.authUserId, key()),
    );
    expect(deferred.status).toBe(400);
    expect((deferred.body as { error: { error_code: string } }).error.error_code).toBe(
      "identity_workflow_invalid_input",
    );
    expect((deferred.body as { error: { message: string } }).error.message).toMatch(/deferred/);
    // The `buyer_courtesy_options` twin (probe-2 proved its operand was silently droppable → B-1).
    const deferredCourtesy = await handleUpdateWorkflowSettings(
      {
        rfqApprovalMode: "none",
        deferredFields: { buyerCourtesyOptionsSupplied: true },
        updatedAt: current.updatedAt,
      },
      deps(owner.authUserId, key()),
    );
    expect(deferredCourtesy.status).toBe(400);
    expect((deferredCourtesy.body as { error: { error_code: string } }).error.error_code).toBe(
      "identity_workflow_invalid_input",
    );
    expect((deferredCourtesy.body as { error: { message: string } }).error.message).toMatch(
      /deferred/,
    );

    // Empty patch (no realizable field) → 400.
    const empty = await handleUpdateWorkflowSettings(
      { updatedAt: current.updatedAt },
      deps(owner.authUserId, key()),
    );
    expect(empty.status).toBe(400);

    // Bad enum → 400.
    const badEnum = await handleUpdateWorkflowSettings(
      { rfqApprovalMode: "sometimes" as unknown as string, updatedAt: current.updatedAt },
      deps(owner.authUserId, key()),
    );
    expect(badEnum.status).toBe(400);

    // Bad jsonb shape (approval_chain not an array; financial_permissions not an object) → 400.
    const badChain = await handleUpdateWorkflowSettings(
      { approvalChain: "not-an-array", updatedAt: current.updatedAt },
      deps(owner.authUserId, key()),
    );
    expect(badChain.status).toBe(400);
    const badPerms = await handleUpdateWorkflowSettings(
      { financialPermissions: [1, 2, 3], updatedAt: current.updatedAt },
      deps(owner.authUserId, key()),
    );
    expect(badPerms.status).toBe(400);

    // Missing If-Match (invalid updated_at) → 400.
    const noToken = await handleUpdateWorkflowSettings(
      { rfqApprovalMode: "none", updatedAt: new Date(Number.NaN) },
      deps(owner.authUserId, key()),
    );
    expect(noToken.status).toBe(400);
    expect((noToken.body as { error: { message: string } }).error.message).toMatch(/If-Match/);

    // Absent Idempotency-Key → 400 (Doc-5C §4.3 mandatory).
    const noKey = await handleUpdateWorkflowSettings(
      { rfqApprovalMode: "none", updatedAt: current.updatedAt },
      deps(owner.authUserId, null),
    );
    expect(noKey.status).toBe(400);
    expect((noKey.body as { error: { message: string } }).error.message).toMatch(/Idempotency-Key/);
  });

  it("PATCH §B.6 replay: same key + caller → the STORED 200 (same reference_id, byte-equal body), ONE settings mutation, ONE audit row — the [DC-5] window resolved via the REAL identity.command_dedup_window POLICY key (core.config_value_query.v1), no literal", async () => {
    const owner = await freshUser();
    const org = await freshOrg({
      tag: "Replay",
      withSettings: true,
      members: [{ userId: owner.id, roleId: ownerRoleId }],
    });
    const k = key();
    const first = await handleUpdateWorkflowSettings(
      { rfqApprovalMode: "single", updatedAt: org.settingsUpdatedAt! },
      deps(owner.authUserId, k),
    );
    expect(first.status).toBe(200);
    const tokenAfterFirst = (await reloadSettings(org.id)).updatedAt;

    // Same key + caller → the STORED 200 (same reference_id, byte-equal body) — NO second mutation
    // (the token did NOT advance again), NO second audit row (the §14.3 joint rule).
    const replay = await handleUpdateWorkflowSettings(
      { rfqApprovalMode: "multi_step", updatedAt: tokenAfterFirst }, // different body — ignored on replay
      deps(owner.authUserId, k),
    );
    expect(replay.status).toBe(200);
    expect(wireJson(replay.body)).toEqual(wireJson(first.body));
    const afterReplay = await reloadSettings(org.id);
    expect(afterReplay.rfqApprovalMode).toBe("single"); // NOT multi_step — no re-execution.
    expect(afterReplay.updatedAt.getTime()).toBe(tokenAfterFirst.getTime()); // token unchanged.
    expect(await settingsAudits(org.id)).toHaveLength(1);
  });

  // ════ C. THE FIREWALL (8E) — the governance-signal gate, DISCRIMINATING ════

  it("FIREWALL (Invariant #6 / §B.7 / §C12.6): update_workflow_settings writes NO governance signal — the audited write's field set is EXACTLY the four §C11 workflow keys (no Trust/Performance/Financial-Tier/Capacity/Buyer-Vendor-Status key), verification_level + sibling identity tables are untouched, and a governance-signal-shaped SMUGGLE never enters the write", async () => {
    const owner = await freshUser();
    const org = await freshOrg({
      tag: "Firewall",
      withSettings: true,
      members: [{ userId: owner.id, roleId: ownerRoleId }],
    });

    // Snapshot the firewall-adjacent invariants BEFORE the write.
    const orgBefore = await reloadOrg(org.id);
    const membershipsBefore = await prisma.membership.count({ where: { organizationId: org.id } });
    const rolesBefore = await prisma.role.count({ where: { organizationId: org.id } });
    const buyerProfilesBefore = await prisma.buyerProfile.count({
      where: { organizationId: org.id },
    });

    // A real update touching every realizable field (incl. a financial threshold + notification rule).
    const res = await handleUpdateWorkflowSettings(
      {
        rfqApprovalMode: "multi_step",
        approvalChain: [{ step: 1, requires: "can_approve_rfq" }],
        financialPermissions: { award_approval_threshold_bdt: 2500000 },
        notificationRules: { on_award: ["owner"] },
        updatedAt: org.settingsUpdatedAt!,
      },
      deps(owner.authUserId, key()),
    );
    expect(res.status).toBe(200);

    // DISCRIMINATOR 1 — the audited write's field set is EXACTLY the four workflow keys. This REDs the
    // instant ANY governance-signal key (or any extra field) enters the audited write.
    const audits = await settingsAudits(org.id);
    expect(audits).toHaveLength(1);
    const changed = audits[0]!;
    expect(changed.action).toBe("workflow_settings_changed");
    expect(changed.entityType).toBe("organization_workflow_settings");
    expect(Object.keys(changed.newValue as object).sort()).toEqual([...WORKFLOW_AUDIT_KEYS]);
    expect(Object.keys(changed.oldValue as object).sort()).toEqual([...WORKFLOW_AUDIT_KEYS]);
    for (const signal of GOVERNANCE_SIGNAL_KEYS) {
      expect(Object.keys(changed.newValue as object)).not.toContain(signal);
      expect(Object.keys(changed.oldValue as object)).not.toContain(signal);
    }

    // DISCRIMINATOR 2 — the write touched ONLY workflow_settings: the org's Trust-reflected
    // `verification_level` is UNCHANGED (the firewall-adjacent field the update must never write), and
    // no sibling identity table changed. REDs on any cross-field / cross-table write.
    const orgAfter = await reloadOrg(org.id);
    expect(orgAfter.verificationLevel).toBe(orgBefore.verificationLevel);
    expect(await prisma.membership.count({ where: { organizationId: org.id } })).toBe(
      membershipsBefore,
    );
    expect(await prisma.role.count({ where: { organizationId: org.id } })).toBe(rolesBefore);
    expect(await prisma.buyerProfile.count({ where: { organizationId: org.id } })).toBe(
      buyerProfilesBefore,
    );

    // DISCRIMINATOR 3 — the SMUGGLE (negative control): a body carrying every governance-signal-shaped
    // field alongside a real one. The update SUCCEEDS (unknown fields ignored, not errored) and the new
    // audited write's field set is STILL exactly the four workflow keys — the smuggled signal fields
    // NEVER entered the write. REDs if the command ever widened its field set to a smuggled signal.
    const token = (await reloadSettings(org.id)).updatedAt;
    const smuggled = {
      rfqApprovalMode: "single",
      updatedAt: token,
      trust_score: 99,
      performance_score: 99,
      financial_tier: "A",
      capacity_profile: { unlimited: true },
      buyer_vendor_status: "approved",
    } as unknown as UpdateWorkflowSettingsInput;
    const smuggle = await handleUpdateWorkflowSettings(smuggled, deps(owner.authUserId, key()));
    expect(smuggle.status).toBe(200);

    const auditsAfterSmuggle = await settingsAudits(org.id);
    expect(auditsAfterSmuggle).toHaveLength(2);
    const smuggleAudit = auditsAfterSmuggle[1]!;
    expect(Object.keys(smuggleAudit.newValue as object).sort()).toEqual([...WORKFLOW_AUDIT_KEYS]);
    for (const signal of GOVERNANCE_SIGNAL_KEYS) {
      expect(Object.keys(smuggleAudit.newValue as object)).not.toContain(signal);
    }
    // The persisted row carries ONLY the four columns' values — the smuggled signals reached NO column.
    const rowAfterSmuggle = await reloadSettings(org.id);
    expect(rowAfterSmuggle.rfqApprovalMode).toBe("single"); // the ONE real field applied.
    const persisted = JSON.stringify({
      approvalChainJsonb: rowAfterSmuggle.approvalChainJsonb,
      financialPermissionsJsonb: rowAfterSmuggle.financialPermissionsJsonb,
      notificationRulesJsonb: rowAfterSmuggle.notificationRulesJsonb,
    });
    // The jsonb columns still hold the prior legitimate values — the smuggled signal VALUES are absent.
    expect(persisted).not.toContain("unlimited");
    expect(persisted).not.toContain("approved");

    // DISCRIMINATOR 4 (T6-OBS-2 — the NESTED-jsonb passthrough is contained): governance-signal NAMES
    // nested INSIDE legitimately-writable jsonb fields (`financial_permissions` / `notification_rules`)
    // are the client's OWN org-config data — NOT the M5/M2/M4-owned platform signals (no signal consumer
    // reads this table). They persist VERBATIM as inert values, the audit's TOP-LEVEL field set stays
    // EXACTLY the four workflow keys (no signal key promoted to the audited write), and the org's
    // Trust-reflected `verification_level` is UNCHANGED. REDs if the command ever flattened a nested key
    // into the audited top-level or routed it to a signal (Team-6 P1 probe, pinned).
    const tokenNested = (await reloadSettings(org.id)).updatedAt;
    const nested = await handleUpdateWorkflowSettings(
      {
        financialPermissions: {
          financial_tier: "A",
          trust_score: 99,
          award_approval_threshold_bdt: 3000000,
        },
        notificationRules: { performance_score: 99, on_award: ["owner"] },
        updatedAt: tokenNested,
      },
      deps(owner.authUserId, key()),
    );
    expect(nested.status).toBe(200);
    const auditsNested = await settingsAudits(org.id);
    const nestedAudit = auditsNested[auditsNested.length - 1]!;
    expect(Object.keys(nestedAudit.newValue as object).sort()).toEqual([...WORKFLOW_AUDIT_KEYS]);
    for (const signal of GOVERNANCE_SIGNAL_KEYS) {
      expect(Object.keys(nestedAudit.newValue as object)).not.toContain(signal);
    }
    // The nested signal-NAMED values are stored VERBATIM in the jsonb columns (inert org-config).
    const rowNested = await reloadSettings(org.id);
    expect(rowNested.financialPermissionsJsonb).toEqual({
      financial_tier: "A",
      trust_score: 99,
      award_approval_threshold_bdt: 3000000,
    });
    expect(rowNested.notificationRulesJsonb).toEqual({
      performance_score: 99,
      on_award: ["owner"],
    });
    // The org's Trust-reflected `verification_level` is UNCHANGED (the firewall-adjacent field).
    expect((await reloadOrg(org.id)).verificationLevel).toBe(orgBefore.verificationLevel);
  });

  // ════ D. Delegation-ineligibility (OBS-B — the §C11:716 `satisfiedBy!=='membership'` guard) ════

  it("AUTHZ delegation-ineligibility (§C11:716): a delegation-satisfied check_permission allow is REJECTED (403 identity_workflow_forbidden) — the command requires satisfiedBy==='membership'; DB-free (the reject is upstream of the write)", async () => {
    const owner = await freshUser();
    // Inject a `check_permission` that ALLOWS but via DELEGATION (not membership). The command's AUTHZ
    // leg (step 2, upstream of any write) must reject it fail-closed — Delegation is NOT eligible for
    // workflow-settings management (§C11 PassB:716; the invite_member precedent). NON-VACUOUS: dropping
    // the `satisfiedBy!=='membership'` operand would let this proceed to the write (404/200), not 403.
    const outcome = await updateWorkflowSettings(
      { rfqApprovalMode: "single", updatedAt: new Date() },
      { userId: owner.id, activeOrgId: uuidv7() },
      {
        appendAuditRecord,
        authorize: async (): Promise<CheckPermissionResult> => ({
          decision: "allow",
          satisfiedBy: "delegation",
        }),
      },
    );
    expect(outcome.ok).toBe(false);
    if (outcome.ok) return;
    expect(outcome.error.errorClass).toBe("AUTHORIZATION");
    expect(outcome.error.errorCode).toBe("identity_workflow_forbidden");
  });
});
