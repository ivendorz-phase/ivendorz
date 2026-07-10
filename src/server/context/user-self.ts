// App-layer SELF-USER context (REPOSITORY_STRUCTURE §5 `src/server/context`) — W2-IDN-6.1.
//
// The §C4 self ops (`update_user_profile` · `update_user_2fa_settings` · `deactivate_own_account`)
// act on the PLATFORM-OWNED `identity.users` record with NO active-org authorization requirement
// (Doc-5C §4.5: "self ops (profile/2FA/deactivate) act on the platform-owned `users` record (no org
// context)"). Their context is the SERVER-RESOLVED session subject only:
//
//   • `resolveSelfUser` — resolve the `identity.users` id from the Supabase session's
//     `auth_user_id` (live row only; fail-closed `null`). Same documented app-edge seam as
//     `resolveActiveOrg` ([ESC-W1-CONTEXT-RESOLVE] — the tenant-directory read at the composition
//     edge, not a cross-module access).
//   • `withUserSelfContext` — ONE transaction with `app.user_id` pinned TRANSACTION-LOCAL (the
//     `users_self_read`/`users_self_update` RLS self leg, Doc-6C §6.2a) and `app.is_platform_staff`
//     pinned FALSE. NO `app.active_org` — deliberately: the self surface carries no org context, so
//     no tenant-anchored RLS predicate can pass on this executor (least context).
//
// The audited self writes do NOT use this wrapper: `update_user_2fa_settings` needs the ADR-021
// tenant audit leg (org anchor) → `withActiveOrg`; `deactivate_own_account` runs its own tx under
// the frozen Doc-6C §6.2a DELETE-anonymize staff-GUC leg (multi-org guard + anonymize). This
// wrapper serves the UNAUDITED profile update (and future unaudited self reads/writes).

import { prisma, type DbExecutor, type Prisma } from "@/shared/db";
import type { AuthSession } from "@/server/auth/provisioning";

/** The transaction client handed to the self-context work — `app.user_id` pinned; no org context. */
export type UserSelfTx = Prisma.TransactionClient;

/**
 * Resolve the session subject's `identity.users` id (live row only). FAIL-CLOSED: no user ⇒ `null`
 * (the caller collapses to the non-disclosure `404` — never an existence-leaking error).
 */
export async function resolveSelfUser(
  session: AuthSession,
  db: DbExecutor = prisma,
): Promise<{ userId: string } | null> {
  const user = await db.user.findFirst({
    where: { authUserId: session.authUserId, deletedAt: null },
    select: { id: true },
  });
  if (user === null) return null;
  return { userId: user.id };
}

/**
 * Run `fn` inside ONE transaction whose RLS context is the SELF USER only: `app.user_id` pinned to
 * `userId`, `app.is_platform_staff` pinned false, `app.active_org` deliberately UNSET (no tenant
 * context on the §C4 self surface). GUCs are transaction-local (`set_config(.,.,true)`) — never
 * session-global (no context bleed on pooled connections).
 *
 * @param userId the SERVER-RESOLVED session subject (from `resolveSelfUser` — never client input).
 * @param fn     the self-scoped work; receives the transaction client.
 */
export async function withUserSelfContext<T>(
  userId: string,
  fn: (tx: UserSelfTx) => Promise<T>,
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.user_id', ${userId}::text, true)`;
    await tx.$executeRaw`SELECT set_config('app.is_platform_staff', 'false'::text, true)`;
    return fn(tx);
  });
}
