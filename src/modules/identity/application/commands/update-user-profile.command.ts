// M1 application (PRIVATE) — `identity.update_user_profile.v1` (Doc-4C §C4 PassB:169–186;
// Doc-5C §4.1 row 1: `PATCH /identity/users/{id}` · 200). W2-IDN-6.1.
//
// ORCHESTRATION ONLY (owns no state): validate → write (repository) on the caller-supplied executor.
// Self-scope: the target user IS the server-resolved session subject (`ctx.userId`); the path `{id}`
// is checked against it UPSTREAM (the composition edge) — this command never accepts a foreign target
// (§C4 AI note: "self-only — never accept a target `user_id` ≠ session user").
//
// AUDIT: **NONE — frozen.** Doc-4C §C4 (PassB:183): "Audit (§B.8): no — profile/preference edits are
// operational, not a Doc-2 §9 MUST-audit action (§17.1)". §C12.3's `[ESC-IDN-AUDIT]` coverage list
// likewise omits user-profile change. Appending an audit row here would require INVENTING an audit
// action (the [ESC-IDN-AUDIT] halt condition) — so this is deliberately the sub-domain's one
// UNAUDITED write. (The playbook's "all commands audited" header is a paraphrase; the frozen
// per-contract Audit field governs.) Events: none ([DC-1]).
//
// DISPLAY_NAME (Doc-2_Patch_v1.0.6 / Doc-6C_Patch_v1.0.2 — ESC-IDN-DISPLAYNAME resolved): the
// `display_name : string : optional : bounded` wire field lands here. The frozen constraint token is
// `bounded` with no named corpus bound and no registered POLICY key, so the bound value is a
// [realization convention] per Doc-5C §0.4 (a transport-level detail on which Doc-4A/Doc-5A are
// silent) — fixed below as a named constant, never a magic literal. Contradicts nothing upstream;
// a future additive may register a POLICY key and supersede it.

import { prisma, type DbExecutor } from "../../../../shared/db";
import {
  updateUserProfileFields,
  type UserProfilePatch,
} from "../../infrastructure/data/user-account.repository";
import type { UpdateUserProfileInput, UpdateUserProfileOutcome } from "../../contracts/types";

/** The server-resolved request context (from the composition edge — never client input). */
export interface UpdateUserProfileContext {
  /** The acting (= target) `identity.users` id — the session subject (Invariant #5). */
  userId: string;
}

// Doc-4C §C4 error register (frozen `identity_user_*` codes; bound by pointer, never coined).
const INVALID_INPUT_CODE = "identity_user_invalid_input";
const UPDATE_CONFLICT_CODE = "identity_user_update_conflict";
// The non-disclosure collapse code (Doc-5A §6.6 safe default). The §C4 update-profile register
// itself authors no NOT_FOUND row; the code is the FROZEN §C4 user-domain register code (authored
// on `get_user` / `set_user_account_status`) — reused, never coined.
const NOT_FOUND_CODE = "identity_user_not_found";

/**
 * `display_name` bound — [realization convention] realizing the frozen `bounded` token
 * (Doc-4C §C4 PassB:174; Doc-2_Patch_v1.0.6 §2 "wire bound per the Doc-4A validation conventions,
 * realized at W2-IDN-6.1"). 120 characters: a presentation-only name (never an identifier).
 */
export const DISPLAY_NAME_MAX_LENGTH = 120;

/** E.164 (`phone : string : optional : E.164` — §C4): `+` then 2–15 digits, first non-zero (ITU). */
const E164_PATTERN = /^\+[1-9]\d{1,14}$/;

/** RFC-4122 UUID shape for the path `{id}` (Doc-5A §5.4 — a malformed segment is SYNTAX, cat 1). */
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** SYNTAX validation (Doc-4A §11.2 category 1; §C4 field constraints). Returns the failure message
 *  or `null`. `optional` ≠ `nullable` (Doc-4A §9.2): an explicit null is REJECTED — absence is the
 *  only "leave unchanged" form; null semantics are undeclared in the frozen contract. */
function validateInput(input: UpdateUserProfileInput): string | null {
  if (typeof input.targetUserId !== "string" || !UUID_PATTERN.test(input.targetUserId)) {
    return "id must be a UUID.";
  }
  if (input.displayName !== undefined) {
    if (typeof input.displayName !== "string") {
      return "display_name must be a string.";
    }
    if (
      input.displayName.trim().length === 0 ||
      input.displayName.length > DISPLAY_NAME_MAX_LENGTH
    ) {
      return `display_name must be 1..${DISPLAY_NAME_MAX_LENGTH} characters.`;
    }
  }
  if (input.phone !== undefined) {
    if (typeof input.phone !== "string" || !E164_PATTERN.test(input.phone)) {
      return "phone must be an E.164 number (e.g. +8801XXXXXXXXX).";
    }
  }
  if (input.preferences !== undefined) {
    // `preferences : object` (§C4) — a plain JSON object; arrays/scalars/null are not the declared
    // shape. Keys ride opaque (`preferences_jsonb`, Doc-2 §10.2 — shape owned upstream; no frozen
    // preference-key catalog exists to allowlist, carried in the Completion Report).
    if (
      typeof input.preferences !== "object" ||
      input.preferences === null ||
      Array.isArray(input.preferences)
    ) {
      return "preferences must be an object.";
    }
  }
  if (!(input.updatedAt instanceof Date) || Number.isNaN(input.updatedAt.getTime())) {
    return "updated_at is required (If-Match) and must be a timestamp.";
  }
  return null;
}

/**
 * Update the session subject's profile/preferences (Doc-4C §C4). Partial: an omitted field is left
 * unchanged. Optimistic on `updated_at`. UNAUDITED by frozen declaration (see header).
 *
 * @param input the (already type-mapped) §C4 fields.
 * @param ctx   the server-resolved context (`userId` = the session subject; never client input).
 * @param db    the executor carrying the server-set self context (`app.user_id`) — the
 *              `users_self_update` RLS backstop leg.
 */
export async function updateUserProfileCommand(
  input: UpdateUserProfileInput,
  ctx: UpdateUserProfileContext,
  db: DbExecutor = prisma,
): Promise<UpdateUserProfileOutcome> {
  // (1) SYNTAX (Doc-4A §11.2 order — first failing category decides).
  const invalid = validateInput(input);
  if (invalid !== null) {
    return {
      ok: false,
      error: { errorClass: "VALIDATION", errorCode: INVALID_INPUT_CODE, message: invalid },
    };
  }

  // (2) CONTEXT/SCOPE — self-only (Doc-4C §C4: "never accept a target `user_id` ≠ session user").
  //     A foreign `{id}` collapses to the §6.6 non-disclosure NOT_FOUND — indistinguishable from a
  //     genuinely absent target (another user's existence is never the caller's to know).
  if (input.targetUserId !== ctx.userId) {
    return {
      ok: false,
      error: { errorClass: "NOT_FOUND", errorCode: NOT_FOUND_CODE, message: "Not found." },
    };
  }

  // (3) BUSINESS — "no protected/auth-managed field mutated here" (DC-4) holds by construction:
  //     only the three declared fields exist on the patch surface (Doc-4A §9.7 prohibited inputs
  //     cannot reach the repository).
  const patch: UserProfilePatch = {};
  if (input.displayName !== undefined) patch.displayName = input.displayName;
  if (input.phone !== undefined) patch.phone = input.phone;
  if (input.preferences !== undefined) patch.preferences = input.preferences;

  // (4) WRITE — CAS on `updated_at`; the repository owns the SQL (self-anchored; RLS backstop).
  const write = await updateUserProfileFields(
    { userId: ctx.userId, expectedUpdatedAt: input.updatedAt, patch },
    db,
  );
  if (write.outcome !== "updated") {
    if (write.outcome === "not_found") {
      // The session subject's live row is gone (departed mid-session) — non-disclosure collapse.
      return {
        ok: false,
        error: { errorClass: "NOT_FOUND", errorCode: NOT_FOUND_CODE, message: "Not found." },
      };
    }
    return {
      ok: false,
      error: {
        errorClass: "CONFLICT",
        errorCode: UPDATE_CONFLICT_CODE,
        message: "The user record was modified concurrently; reload and retry.",
      },
    };
  }

  return { ok: true, result: { userId: ctx.userId, updatedAt: write.updatedAt } };
}
