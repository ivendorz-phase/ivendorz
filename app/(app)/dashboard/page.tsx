// Workspace entry (`/dashboard`) — the canonical "take me to my workspace" route. A Next.js SERVER
// COMPONENT in the `(app)` group (App Router composition only — REPOSITORY_STRUCTURE §8): no business
// logic. It resolves the default co-mounted lens SERVER-SIDE and redirects; it renders no UI.
//
// This is the post-login destination (the Doc-7E login action redirects here) and the target of the
// shell's "return to workspace" affordance. The lens decision (Buy vs Sell) is a NAVIGATION default
// derived from the active org's participation flags — never an authorization gate ([ESC-7G-A7R]). The
// `(app)` layout already enforces authentication; every workspace route re-validates server-side (R7).
import { redirect } from "next/navigation";
import { ensureProvisioned, resolveSupabaseSession } from "@/server/auth";
import { resolveWorkspaceEntryPath } from "@/server/identity";

// Per-request: the destination depends on the session + the server-resolved active-org context.
export const dynamic = "force-dynamic";

export default async function WorkspaceEntryPage() {
  const target = await resolveWorkspaceEntryPath({
    resolveSession: resolveSupabaseSession,
    ensureProvisioned,
  });
  redirect(target);
}
