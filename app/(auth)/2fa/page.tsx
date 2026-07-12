// Two-factor challenge route (`/2fa`) — P-AUTH-06 (Auth template · Doc-7E §2). The second-factor
// verification step during sign-in. Binds Supabase Auth MFA (verify) — authentication only
// (Doc-7C §3.1). Unauthenticated; no active-org context, no session held (Doc-7C §2.1). Composes the
// shared split-screen `AuthShell` (redesigned 2026-07-12 to the kit).
//
// PRESENTATION-ONLY: composes the Doc-7B kit and verifies NOTHING. GOVERNANCE:
//  • The code + the MFA challenge are SERVER-AUTHORITATIVE — client-side checks are format-only UX;
//    the page never verifies a code and never trusts one.
//  • The `?state=` preview (form/loading/error/interim) is a DEV/QA harness — honored ONLY outside
//    production, so a real visitor is never shown a fabricated system state (mirrors Search / P-AUTH-05).
import type { Metadata } from "next";
import Link from "next/link";
import { BrandLogo } from "@/frontend/brand";
import { AuthShell } from "../_components/auth-shell";
import { TwoFactorForm } from "./two-factor-form";

export const metadata: Metadata = {
  title: "Two-factor authentication — iVendorz",
  description: "Enter your verification code to finish signing in.",
};

type SearchParams = { state?: string };

export default async function TwoFactorPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  // DEV/QA-only preview harness — never honored in production.
  const raw = process.env.NODE_ENV !== "production" ? sp.state : undefined;
  const preview = raw === "loading" || raw === "error" || raw === "interim" ? raw : undefined;

  return (
    <AuthShell
      aside={{
        headline: "An extra layer on every sign-in.",
        subcopy:
          "Two-factor authentication protects your RFQs, contracts and vendor data — even if your password is ever compromised.",
        points: [
          "Works with any authenticator app",
          "Trust a device to skip it next time",
          "Backup codes keep you covered if you lose your device",
        ],
        footNote: "Your second factor is verified server-side on every sign-in.",
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

      <TwoFactorForm preview={preview} />
    </AuthShell>
  );
}
