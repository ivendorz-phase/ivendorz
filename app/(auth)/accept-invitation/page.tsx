// Accept-invitation route (`/accept-invitation`) — P-AUTH-07 (Auth template · Doc-7E §2.3; journey
// J-BUY-05). The screen reached from an org invitation link, where an invited user joins an EXISTING
// organization. Binds the frozen M1 command `accept_invitation` (Doc-4C §C6 — caller-facing). Composes
// the shared split-screen `AuthShell` (redesigned 2026-07-12 to the kit).
//
// PRESENTATION-ONLY: composes the Doc-7B kit and joins NOTHING. GOVERNANCE:
//  • The invitation token is SERVER-AUTHORITATIVE — the page never validates or trusts it; the org,
//    role, and inviter shown are realistic MOCK seed (a wired build resolves them from the token).
//  • Org Role uses the FROZEN set (Owner/Director/Manager/Officer — Invariant #2); none is invented.
//  • NON-DISCLOSURE (Doc-7A §4.3/§8): an invalid/expired invitation resolves to a UNIFORM notice that
//    leaks no org/account-existence signal.
//  • The `?state=` preview (pending/loading/accepted/declined/invalid) is a DEV/QA harness — honored
//    ONLY outside production (mirrors Search / P-AUTH-05/06).
// The invitation is an ACCEPT/DECLINE of an already-resolved invite (not a full sign-up form) — the
// user chose to keep that model and adopt the reference's org-card visuals only.
import type { Metadata } from "next";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { BrandLogo } from "@/frontend/brand";
import { Button } from "@/frontend/primitives/button";
import { AuthShell } from "../_components/auth-shell";
import { AuthResultPanel } from "../_components/auth-result-panel";
import { InvitationView } from "./invitation-view";

export const metadata: Metadata = {
  title: "Join your organization — iVendorz",
  description: "Accept your invitation to join an organization on iVendorz.",
};

type SearchParams = { state?: string };

export default async function AcceptInvitationPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  // DEV/QA-only preview harness — never honored in production.
  const raw = process.env.NODE_ENV !== "production" ? sp.state : undefined;
  const invalid = raw === "invalid";
  const preview = raw === "loading" || raw === "accepted" || raw === "declined" ? raw : undefined;

  return (
    <AuthShell
      aside={{
        headline: "Your team is already sourcing here.",
        subcopy:
          "Accept the invite to join your organisation’s workspace — shared RFQs, vendor shortlists and approval workflows, all in one place.",
        points: [
          "Shared RFQs & quote comparisons",
          "Role-based approval controls",
          "One audit trail for the whole team",
        ],
        footNote:
          "Organizations own their records — you’ll act on this org’s behalf with the role you’re given.",
      }}
    >
      {/* Top bar — mobile brand (the aside is hidden below lg). */}
      <div className="mb-8 flex items-center">
        <Link
          href="/"
          className="inline-flex rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background lg:hidden"
        >
          <BrandLogo height={30} />
        </Link>
      </div>

      {invalid ? (
        // Uniform, non-disclosing outcome for a server-rejected (invalid/expired) invitation.
        <AuthResultPanel
          tone="warning"
          icon={<ShieldAlert />}
          title="This invitation is invalid or has expired"
          description="For your security, invitation links expire after a short time. Ask your team to send a new one."
          action={
            <Button asChild variant="outline" size="lg" className="w-full">
              <Link href="/login">Back to sign in</Link>
            </Button>
          }
        />
      ) : (
        <InvitationView preview={preview} />
      )}
    </AuthShell>
  );
}
