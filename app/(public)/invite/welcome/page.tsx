import Link from "next/link";
import { Button } from "@/frontend/primitives/button";
import {
  resolveInvitationToken,
  type ResolveInvitationTokenResult,
} from "@/modules/identity/contracts";
import { readInviteTokenCookie } from "@/server/auth/invite-token-cookie";

// Token-landing surface (P2-A2) — Doc-7E_GrowthHub_Patch_v1.0.1 §2(b): a `(public)` route; the
// surface calls `identity.resolve_invitation_token.v1` (Doc-5C v1.0.1 row 37) SERVER-SIDE through
// the M1 contracts seam — no direct table access from `app/`, no client-side token handling (the
// raw token lives only in the HttpOnly carriage cookie set by the `/invite` ingress; this URL is
// token-free, so no analytics/pageview/Referer surface can carry it — Doc-7E §3 / Doc-5C G-6).
//
// ANTI-ORACLE UX (binding): every non-live cause (unknown / expired / revoked) renders ONE uniform
// generic message — never which case it was, never the referrer's identity (Q-4 default-anonymous;
// no disclosure surface exists). Valid → campaign framing + the signup CTA into the ER1 `(auth)`
// flow (signup creates no user record; attribution binds later inside `provisionIdentity`
// §PROV-EXT — registration never fails on token grounds). ZERO stats on this public surface
// (reference-fidelity rule); visual/content direction per the approved Stage-3 prototype
// (`prototypes/growth-hub/index.html`, screens 2–3 — non-authoritative).

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Invitation — iVendorz",
  robots: { index: false, follow: false }, // a per-invitee carriage surface — never indexed
};

/** Presentation label over the frozen campaign key (presentation vocabulary — Doc-7E §5; the MVP
 *  key is `referral` → "Referral"). Never a new key; the slug renders title-cased. */
function campaignLabel(campaignKey: string): string {
  return campaignKey
    .split("_")
    .filter((word) => word.length > 0)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default async function InviteWelcomePage() {
  // Server-side only: cookie → resolve (the row-37 anti-oracle read). No cookie = the same
  // uniform invalid framing (indistinguishable — no carriage state is disclosed either).
  const token = await readInviteTokenCookie();
  const resolution: ResolveInvitationTokenResult =
    token === null ? { valid: false } : await resolveInvitationToken({ token });

  const valid = resolution.valid && typeof resolution.campaignKey === "string";

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6 py-16 sm:py-24">
      <div className="w-full max-w-md rounded-2xl border border-iv-light-border bg-white p-8 text-center shadow-iv-xs sm:p-10">
        {valid ? (
          <>
            <h1 className="text-2xl font-bold tracking-tight text-iv-ink-heading">
              You&rsquo;ve been invited to iVendorz
            </h1>
            <p className="mt-3 text-sm leading-6 text-iv-ink-secondary">
              A business on iVendorz has invited your organization to join Bangladesh&rsquo;s
              industrial procurement network.
            </p>
            <p className="mt-3 text-xs text-iv-ink-secondary">
              Campaign:{" "}
              <span className="font-semibold text-iv-ink-heading">
                {campaignLabel(resolution.campaignKey ?? "")}
              </span>
            </p>
            <Button asChild size="lg" className="mt-6 w-full">
              <Link href="/signup">Create your account</Link>
            </Button>
            <p className="mt-4 text-xs text-iv-ink-secondary">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-primary underline-offset-2 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold tracking-tight text-iv-ink-heading">
              This invitation link isn&rsquo;t valid
            </h1>
            <p className="mt-3 text-sm leading-6 text-iv-ink-secondary">
              The link may have been mistyped or may no longer be active. You can still explore
              iVendorz and create an account directly.
            </p>
            <Button asChild size="lg" className="mt-6 w-full">
              <Link href="/">Explore iVendorz</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
