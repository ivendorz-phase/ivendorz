// User profile layout (Surface E · Doc-7E · P-ACC-02) — mounts the CANONICAL Platform Shell for the
// Account & Identity section, scoped to `/account/profile` (and deeper) ONLY, so it does NOT wrap the
// sibling `/account` buyer-profile page (P-ACC-14). App Router composition only — no business logic.
//
// PRESENTATION ONLY: identity/active-org is presentation SEED (a wired build resolves it server-side via
// get_active_context, SR3 — PARKED). No client-supplied org id is trusted (Inv #5). The Account nav is
// the SHARED account nav model (single source; also used by the overview hub), not a duplicated shell.
import type { ReactNode } from "react";
import { AppShell, type ShellViewModel } from "../../_components/shell";
import { ACCOUNT_NAV, ACCOUNT_QUICK_BAR } from "../overview/account-nav-model";

const ACCOUNT_SHELL_VM: ShellViewModel = {
  identity: {
    user: { name: "Anisur Rahman", email: "anisur@padmavalve.com.bd" },
    activeOrg: { id: "active", name: "Padma Valve & Fittings Ltd.", participation: "hybrid" },
    organizations: [{ id: "active", name: "Padma Valve & Fittings Ltd.", participation: "hybrid" }],
  },
  nav: ACCOUNT_NAV,
  quickBar: ACCOUNT_QUICK_BAR,
  breadcrumb: [{ label: "Account", href: "/account/overview" }, { label: "Profile" }],
};

export default function UserProfileLayout({ children }: { children: ReactNode }) {
  return <AppShell vm={ACCOUNT_SHELL_VM}>{children}</AppShell>;
}
