// M1 application (PRIVATE) — `identity.get_user.v1` read query (Doc-4C §C3). Orchestration only; owns
// NO state. The canonical user read — consumers MUST call this (via the contracts facade), never read
// `identity.users` directly, and never receive auth-mechanism fields (DC-4). Reads are unaudited
// (Doc-4C §C3: `Audit-Required: no`) and emit no events.
//
// DISPLAY_NAME OMISSION (RV-0148 MINOR-4): the frozen §C3 projection (PassB line 117) lists
// `display_name`, but no realized column carries it — Doc-2 §10.2 and Doc-6C `identity.users` both lack
// it, so there is nothing to project (honest omission, not a coined column). This intra-corpus
// divergence is registered as `[ESC-IDN-DISPLAYNAME]` (`esc_registry.md`), which GATES W2-IDN-6.1
// (the `update_user_profile` wire that carries `display_name` as a request field). Resolution is
// Board-owned (realize the column, or editorially drop the field from §C3/§C4) — never resolved here.

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
    user: { userId: row.userId, status: row.status, preferencesSummary: row.preferencesSummary },
  };
}
