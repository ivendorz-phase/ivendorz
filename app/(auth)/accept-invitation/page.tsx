// Accept-invitation route (`/accept-invitation`) — P-AUTH-07 (Auth template · Doc-7E §2.3; journey
// J-BUY-05). The screen reached from an org invitation link, where an invited user joins an EXISTING
// organization. Binds the frozen M1 command `accept_invitation` (Doc-4C §C6 — caller-facing). Lives in
// the `(auth)` group; self-contained centered layout — does NOT add an `(auth)/layout.tsx`.
//
// PRESENTATION-ONLY: composes the Doc-7B kit and joins NOTHING. GOVERNANCE:
//  • The invitation token is SERVER-AUTHORITATIVE — the page never validates or trusts it; the org,
//    role, and inviter shown are realistic MOCK seed (a wired build resolves them from the token).
//  • Org Role uses the FROZEN set (Owner/Director/Manager/Officer — Invariant #2); none is invented.
//  • NON-DISCLOSURE (Doc-7A §4.3/§8): an invalid/expired invitation resolves to a UNIFORM notice that
//    leaks no org/account-existence signal.
//  • The `?state=` preview (pending/loading/accepted/declined/invalid) is a DEV/QA harness — honored
//    ONLY outside production (mirrors Search / P-AUTH-05/06).
import type { Metadata } from "next";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { BrandLogo } from "@/frontend/brand";
import { Card } from "@/frontend/primitives/card";
import { Button } from "@/frontend/primitives/button";
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
    <main className="flex min-h-screen flex-col items-center justify-center bg-muted/40 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Link
            href="/"
            className="inline-flex rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <BrandLogo height={36} />
          </Link>
        </div>

        <Card className="p-6 shadow-iv-md sm:p-8">
          {invalid ? (
            // Uniform, non-disclosing outcome for a server-rejected (invalid/expired) invitation.
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-2 rounded-md border border-border bg-iv-warning-subtle px-4 py-5 text-center">
                <ShieldAlert aria-hidden="true" className="size-6 text-iv-warning-muted" />
                <h1 className="text-lg font-semibold text-iv-ink-heading">
                  This invitation is invalid or has expired
                </h1>
                <p className="text-sm text-muted-foreground">
                  For your security, invitation links expire after a short time. Ask your team to
                  send a new one.
                </p>
              </div>
              <Button asChild variant="outline" className="w-full">
                <Link href="/login">Back to sign in</Link>
              </Button>
            </div>
          ) : (
            <InvitationView preview={preview} />
          )}
        </Card>
      </div>
    </main>
  );
}
