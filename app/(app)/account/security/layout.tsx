// Security & 2FA layout (Surface E · Doc-7E · P-ACC-03) — mounts the CANONICAL Platform Shell for the
// Account & Identity section, scoped to `/account/security` (and deeper) ONLY. App Router composition
// only. PRESENTATION ONLY: identity/active-org is presentation SEED (get_active_context — PARKED); no
// client-supplied org id is trusted (Inv #5). Reuses the SHARED account nav (single source).
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
  breadcrumb: [{ label: "Account", href: "/account/overview" }, { label: "Security" }],
};

export default function SecurityLayout({ children }: { children: ReactNode }) {
  return <AppShell vm={ACCOUNT_SHELL_VM}>{children}</AppShell>;
}
