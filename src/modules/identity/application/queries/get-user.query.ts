// M1 application (PRIVATE) — `identity.get_user.v1` read query (Doc-4C §C3). Orchestration only; owns
// NO state. The canonical user read — consumers MUST call this (via the contracts facade), never read
// `identity.users` directly, and never receive auth-mechanism fields (DC-4). Reads are unaudited
// (Doc-4C §C3: `Audit-Required: no`) and emit no events.
//
// DISPLAY_NAME PROJECTION COMPLETE (W2-IDN-6.1): the frozen §C3 projection (PassB:117)
// `{ user_id, status, display_name, preferences_summary }` is now realized in full — the
// `[ESC-IDN-DISPLAYNAME]` gate (RV-0148 MINOR-4) was RESOLVED by the owner's Option A ruling
// (2026-07-09): `Doc-2_Patch_v1.0.6` added the `identity.users.display_name` column to the data
// corpus and `Doc-6C_Patch_v1.0.2` realized its DDL (the W2-IDN-6.1 forward-only migration).

import { prisma, type DbExecutor } from "../../../../shared/db";
import { getUserRow } from "../../infrastructure/data/authz.repository";
import type { GetUserResult } from "../../contracts/types";

/**
 * `identity.get_user.v1` — resolve the personal-data-minimized user projection, or `found: false` when
 * the user is not resolvable / not disclosable (NOT_FOUND collapse, Doc-4C §C3).
 */
export async function getUser(userId: string, db: DbExecutor = prisma): Promise<GetUserResult> {
  const row = await getUserRow(userId, db);
  if (row === null) return { found: false };
  return {
    found: true,
    user: {
      userId: row.userId,
      status: row.status,
      displayName: row.displayName,
      preferencesSummary: row.preferencesSummary,
    },
  };
}
