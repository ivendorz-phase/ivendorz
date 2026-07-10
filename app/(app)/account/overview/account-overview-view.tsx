// Account overview content — P-ACC-01 (Doc-7E · T-DASHBOARD). PRESENTATION & COMPOSITION ONLY: a
// read-only at-a-glance hub. Server Component (no state, no mutation, binds no contract) composing the
// shared kit; a wired build resolves the identity/usage server-side (get_active_context + M7 entitlement
// reads) and maps them onto this presentation. All values here are presentation SEED.
//
// GOVERNANCE:
//  • Platform Participation (Buyer/Vendor/Hybrid) ≠ Org Role (Owner/Director/Manager/Officer) — the two
//    dimensions are shown DISTINCTLY and never conflated (Invariant #2/#5).
//  • Entitlement/usage is boolean/numeric/enum — NEVER a plan-name string as an access signal
//    (Invariant #10): seats/credits are numeric; subscription is an enum status ("Active"), not "Pro".
//  • Reads only; no funds/trust/score computed here. Non-disclosure: nothing reveals an excluded entity.
import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CreditCard,
  Factory,
  KeyRound,
  Settings2,
  ShieldCheck,
  ShoppingCart,
  Users,
} from "lucide-react";
import { Card, CardContent } from "@/frontend/primitives/card";
import { Badge } from "@/frontend/primitives/badge";
import { Button } from "@/frontend/primitives/button";
import { Separator } from "@/frontend/primitives/separator";
import { Avatar, AvatarFallback } from "@/frontend/primitives/avatar";
import { StatusChip } from "@/frontend/components/status-chip";

// Presentation seed (a wired build resolves these server-side; see header).
const ACCOUNT = {
  user: { name: "Anisur Rahman", email: "anisur@padmavalve.com.bd", initials: "AR" },
  org: { name: "Padma Valve & Fittings Ltd.", role: "Owner" },
};

const MANAGE_LINKS = [
  {
    title: "Organization",
    desc: "Company details and profile",
    href: "/account/organization",
    icon: Building2,
  },
  { title: "Members", desc: "People in your organization", href: "/account/members", icon: Users },
  { title: "Roles", desc: "Roles and permissions", href: "/account/roles", icon: ShieldCheck },
  {
    title: "Delegation",
    desc: "Grant authority to act for you",
    href: "/account/delegation",
    icon: KeyRound,
  },
  {
    title: "Plans & billing",
    desc: "Subscription and usage",
    href: "/account/billing",
    icon: CreditCard,
  },
  {
    title: "Workflow",
    desc: "Approval chains and thresholds",
    href: "/account/settings",
    icon: Settings2,
  },
];

function StatTile({ label, value, hint }: { label: string; value: ReactNode; hint: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <div className="mt-1 text-2xl font-bold tabular-nums text-iv-ink-heading">{value}</div>
        <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}

export function AccountOverviewView() {
  return (
    <div className="space-y-6">
      {/* Identity + the two governance dimensions (Invariant #2). */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <Avatar className="size-14">
                <AvatarFallback className="text-base">{ACCOUNT.user.initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-iv-ink-heading">{ACCOUNT.user.name}</h2>
                <p className="text-sm text-muted-foreground">{ACCOUNT.user.email}</p>
                <p className="mt-1 text-sm text-iv-navy-700">{ACCOUNT.org.name}</p>
              </div>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/account">Edit profile</Link>
            </Button>
          </div>

          <Separator className="my-5" />

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Platform participation
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Badge variant="neutral" className="gap-1">
                  <ShoppingCart aria-hidden="true" className="size-3" />
                  Buyer
                </Badge>
                <Badge variant="neutral" className="gap-1">
                  <Factory aria-hidden="true" className="size-3" />
                  Vendor
                </Badge>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                What your organization does on iVendorz.
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Your role in {ACCOUNT.org.name}
              </p>
              <div className="mt-2">
                <StatusChip label={ACCOUNT.org.role} tone="brand" />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                What you’re allowed to do within it — separate from participation.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Snapshot — entitlements/usage are numeric/enum, never a plan-name (Invariant #10). */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Team seats" value="8 / 25" hint="members / seats" />
        <StatTile label="Lead credits" value="320 / 500" hint="used this period" />
        <StatTile
          label="Subscription"
          value={<StatusChip label="Active" tone="success" />}
          hint="entitlement status"
        />
      </div>

      {/* Settings quick-links (destinations 404 until their pages land — overview-first). */}
      <div>
        <h2 className="mb-3 text-base font-semibold text-iv-ink-heading">Manage</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {MANAGE_LINKS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-start gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-iv-brand-300 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span
                  aria-hidden="true"
                  className="flex size-9 shrink-0 items-center justify-center rounded-md bg-iv-brand-50 text-iv-brand-700"
                >
                  <Icon className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1 text-sm font-semibold text-iv-ink-heading">
                    {item.title}
                    <ArrowRight
                      aria-hidden="true"
                      className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                    />
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{item.desc}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
