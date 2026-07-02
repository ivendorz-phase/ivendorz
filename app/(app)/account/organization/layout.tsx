// Organization profile layout (Surface E · Doc-7E · P-ACC-04) — mounts the CANONICAL Platform Shell for
// the Account & Identity section, scoped to `/account/organization` (and deeper) ONLY. App Router
// composition only — no business logic.
//
// PRESENTATION ONLY: identity/active-org is presentation SEED (a wired build resolves it server-side via
// get_active_context — PARKED). No client-supplied org id is trusted (Inv #5); the active org is the
// server-validated tenant boundary (Inv #5, "Users act; Organizations own"). Reuses the SHARED account
// nav model (single source), not a duplicated shell.
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
  breadcrumb: [{ label: "Account", href: "/account/overview" }, { label: "Organization" }],
};

export default function OrganizationLayout({ children }: { children: ReactNode }) {
  return <AppShell vm={ACCOUNT_SHELL_VM}>{children}</AppShell>;
}
