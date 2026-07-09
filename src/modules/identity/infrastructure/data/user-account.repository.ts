// M1 infrastructure (PRIVATE) — the `identity.users` write repository for the §C4 wired user
// commands (W2-IDN-6.1; Doc-2 §10.2 / Doc-6C §3.1 + Doc-6C_Patch_v1.0.2 `display_name`). M1
// reading/writing its OWN schema (allowed); other modules reach this only via the M1 contracts
// facade, never by importing infrastructure.
//
// D7 pattern (REFERENCE_Audited_Write_Pattern_v1.0 rules 2–3): this repository OWNS the SQL and
// knows NOTHING of audit policy — it returns DATA (the old/new field sets + the new `updated_at`)
// so the COMMAND chooses the audit action and the M0 facade performs the append. App-layer checks
// are PRIMARY: every statement carries its OWN explicit anchor (`id = :userId`, live rows only) —
// it does NOT rely on RLS for correctness; the `users_self_update` policy (self OR staff leg,
// Doc-6C §6.2a) is the row backstop.
//
// CONCURRENCY: every mutation is a WRITE-TIME compare-and-set on `updated_at` (the Doc-4C §C4
// optimistic token) — a stale token matches zero rows and the command surfaces CONFLICT. The
// IDN-5 `transitionMembershipState` CAS precedent.

import { prisma, Prisma, type DbExecutor } from "../../../../shared/db";
import type { UserStatus } from "../../domain/state-machines/user.state-machine";

/** A live `identity.users` row loaded for a §C4 mutation (personal-data fields NEVER returned —
 *  only what the commands need: identity, lifecycle, the concurrency token, current 2FA settings). */
export interface UserAccountRow {
  userId: string;
  status: UserStatus;
  updatedAt: Date;
  /** The current `two_fa_jsonb` settings (opaque; settings only — never a secret, DC-4). */
  twoFaSettings: unknown;
  /** The current `display_name` (needed for the profile-update old/new diff — not audited today,
   *  but returned uniformly with the row). */
  displayName: string | null;
}

/** Load the LIVE user row for a §C4 mutation. `null` ⇒ absent / soft-deleted / not disclosable. */
export async function loadUserAccountRow(
  userId: string,
  db: DbExecutor = prisma,
): Promise<UserAccountRow | null> {
  const row = await db.user.findFirst({
    where: { id: userId, deletedAt: null },
    select: { id: true, status: true, updatedAt: true, twoFaJsonb: true, displayName: true },
  });
  if (row === null) return null;
  return {
    userId: row.id,
    status: row.status as UserStatus,
    updatedAt: row.updatedAt,
    twoFaSettings: row.twoFaJsonb,
    displayName: row.displayName,
  };
}

/** The profile fields `update_user_profile` may write (Doc-4C §C4 PassB:174). `undefined` = leave
 *  unchanged (Doc-4A §9.2 update-command absence semantics). */
export interface UserProfilePatch {
  displayName?: string;
  phone?: string;
  preferences?: unknown;
}

/**
 * Apply the `update_user_profile` partial write under a CAS on `updated_at`. Returns the new
 * `updated_at` on success; `"conflict"` when the token is stale (zero rows matched); `"not_found"`
 * when no live row exists. Only the three declared §C4 fields are writable — no protected /
 * auth-managed field can pass through this surface (DC-4; Doc-4A §9.7).
 */
export async function updateUserProfileFields(
  params: { userId: string; expectedUpdatedAt: Date; patch: UserProfilePatch },
  db: DbExecutor = prisma,
): Promise<{ outcome: "updated"; updatedAt: Date } | { outcome: "conflict" | "not_found" }> {
  const exists = await db.user.findFirst({
    where: { id: params.userId, deletedAt: null },
    select: { id: true },
  });
  if (exists === null) return { outcome: "not_found" };

  const data: Record<string, unknown> = { updatedBy: params.userId };
  if (params.patch.displayName !== undefined) data.displayName = params.patch.displayName;
  if (params.patch.phone !== undefined) data.phone = params.patch.phone;
  if (params.patch.preferences !== undefined) data.preferencesJsonb = params.patch.preferences;

  const written = await db.user.updateMany({
    where: { id: params.userId, deletedAt: null, updatedAt: params.expectedUpdatedAt },
    data,
  });
  if (written.count !== 1) return { outcome: "conflict" };

  const after = await db.user.findFirst({
    where: { id: params.userId },
    select: { updatedAt: true },
  });
  // The row was just CAS-written in this same executor; absence is unreachable, but fail closed.
  if (after === null) return { outcome: "conflict" };
  return { outcome: "updated", updatedAt: after.updatedAt };
}

/**
 * Apply the `update_user_2fa_settings` settings write (the `two_fa_jsonb` SETTINGS column — never a
 * secret/challenge, DC-4) under a CAS on `updated_at`. Returns old/new settings for the command's
 * audit diff (settings values only — no secret exists in this column by construction).
 */
export async function updateUser2faSettings(
  params: { userId: string; expectedUpdatedAt: Date; twoFaSettings: unknown },
  db: DbExecutor = prisma,
): Promise<
  | { outcome: "updated"; updatedAt: Date; oldSettings: unknown; newSettings: unknown }
  | { outcome: "conflict" | "not_found" }
> {
  const current = await db.user.findFirst({
    where: { id: params.userId, deletedAt: null },
    select: { twoFaJsonb: true },
  });
  if (current === null) return { outcome: "not_found" };

  const written = await db.user.updateMany({
    where: { id: params.userId, deletedAt: null, updatedAt: params.expectedUpdatedAt },
    data: {
      // Prisma Json write: the settings object is IDs/values only (Doc-6A §12), owned upstream.
      twoFaJsonb: params.twoFaSettings as Prisma.InputJsonValue,
      updatedBy: params.userId,
    },
  });
  if (written.count !== 1) return { outcome: "conflict" };

  const after = await db.user.findFirst({
    where: { id: params.userId },
    select: { updatedAt: true, twoFaJsonb: true },
  });
  if (after === null) return { outcome: "conflict" };
  return {
    outcome: "updated",
    updatedAt: after.updatedAt,
    oldSettings: current.twoFaJsonb,
    newSettings: after.twoFaJsonb,
  };
}

/**
 * The `deactivate_own_account` PERSONAL-FIELD ANONYMIZATION SET (Doc-4C §C4 State Effects +
 * `Doc-2_Patch_v1.0.6` §2: `display_name` "anonymized with the rest of the user's personal fields
 * on account deactivation"). The `identity.users` personal fields per Doc-2 §10.2 / Doc-6C §3.1:
 *   email · phone · display_name (Patch v1.0.6) · two_fa_jsonb (2FA settings) ·
 *   preferences_jsonb (personal settings) · auth_user_id (the person's auth-account linkage, DC-4
 *   — severed on departure; the partial-unique live index already excludes the departed row).
 * Exported so the audit payload and the 8C tests bind the SAME canonical set (field NAMES only —
 * the audit never records the personal VALUES; recording them would defeat the redaction).
 */
export const USER_ANONYMIZATION_FIELDS = [
  "email",
  "phone",
  "display_name",
  "two_fa_jsonb",
  "preferences_jsonb",
  "auth_user_id",
] as const;

/**
 * Apply the departure write (Doc-4C §C4 / Architecture §5.7 / §14.3 compliance-redaction): status →
 * `soft_deleted`, soft-delete tuple set, and EVERY personal field in `USER_ANONYMIZATION_FIELDS`
 * nulled — one CAS-guarded UPDATE (irreversible; `soft_deleted` is terminal, no user-restore
 * contract exists). Returns the prior status for the command's machine assertion + audit.
 */
export async function anonymizeAndSoftDeleteUser(
  params: { userId: string; expectedUpdatedAt: Date; deleteReason: string },
  db: DbExecutor = prisma,
): Promise<
  | { outcome: "deactivated"; previousStatus: UserStatus; updatedAt: Date }
  | { outcome: "conflict" | "not_found" }
> {
  const current = await db.user.findFirst({
    where: { id: params.userId, deletedAt: null },
    select: { status: true },
  });
  if (current === null) return { outcome: "not_found" };

  const written = await db.user.updateMany({
    where: { id: params.userId, deletedAt: null, updatedAt: params.expectedUpdatedAt },
    data: {
      status: "soft_deleted",
      // The anonymization set — personal fields nulled (USER_ANONYMIZATION_FIELDS, kept in step).
      // Json columns take the SQL NULL (`Prisma.DbNull`) — the value is REMOVED, not a JSON null.
      email: null,
      phone: null,
      displayName: null,
      twoFaJsonb: Prisma.DbNull,
      preferencesJsonb: Prisma.DbNull,
      authUserId: null,
      // The Doc-2 §0.2 soft-delete tuple (anonymize-on-departure — Doc-6C §3.1).
      deletedAt: new Date(),
      deletedBy: params.userId,
      deleteReason: params.deleteReason,
      updatedBy: params.userId,
    },
  });
  if (written.count !== 1) return { outcome: "conflict" };

  const after = await db.user.findFirst({
    where: { id: params.userId },
    select: { updatedAt: true },
  });
  if (after === null) return { outcome: "conflict" };
  return {
    outcome: "deactivated",
    previousStatus: current.status as UserStatus,
    updatedAt: after.updatedAt,
  };
}

/**
 * Apply the Admin `set_user_account_status` transition `from → to` under a WRITE-TIME compare-and-set
 * on BOTH the source status AND `updated_at` (the command has already asserted the edge on the user
 * state machine — this only writes the legal edge; a concurrent move matches zero rows).
 */
export async function setUserStatus(
  params: {
    userId: string;
    from: UserStatus;
    to: UserStatus;
    expectedUpdatedAt: Date;
    actorUserId: string | null;
  },
  db: DbExecutor = prisma,
): Promise<{ outcome: "updated"; updatedAt: Date } | { outcome: "conflict" }> {
  const written = await db.user.updateMany({
    where: {
      id: params.userId,
      status: params.from,
      deletedAt: null,
      updatedAt: params.expectedUpdatedAt,
    },
    data: { status: params.to, updatedBy: params.actorUserId },
  });
  if (written.count !== 1) return { outcome: "conflict" };

  const after = await db.user.findFirst({
    where: { id: params.userId },
    select: { updatedAt: true },
  });
  if (after === null) return { outcome: "conflict" };
  return { outcome: "updated", updatedAt: after.updatedAt };
}

/** A live membership row of the departing user (the §C4 "in-module membership consequences" input). */
export interface DepartingMembershipRow {
  membershipId: string;
  organizationId: string;
  state: string;
}

/**
 * List the departing user's LIVE membership rows (all orgs). The deactivate command uses these for
 * (a) the per-org Last-Owner-Protection loop (§5.5 — via `resolveOwnerRemovalFacts` in the SAME
 * locking transaction) and (b) the in-module membership consequences (legal `→ removed` edges).
 */
export async function listLiveMembershipsForUser(
  userId: string,
  db: DbExecutor = prisma,
): Promise<DepartingMembershipRow[]> {
  const rows = await db.membership.findMany({
    where: { userId, deletedAt: null },
    select: { id: true, organizationId: true, state: true },
    orderBy: { id: "asc" },
  });
  return rows.map((r) => ({
    membershipId: r.id,
    organizationId: r.organizationId,
    state: r.state,
  }));
}
