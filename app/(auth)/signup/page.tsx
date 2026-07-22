// Signup route (`/signup`) — P-AUTH-02 (Auth template · Doc-7E §2 · Doc-7C §2.1; journey J-GST-06).
// Unauthenticated; NO active-org context and NO session held while authenticating — `(auth)` is
// distinct from `(app)` (Doc-7C §2.1). RSC shell composing the shared split-screen auth frame + the
// client sign-up form.
//
// PRESENTATION-ONLY (parallel FE stream): the form is composed from the kit but performs NO account
// creation. There is no `create_user` wire contract — `[ESC-7-API-SIGNUP]`: the user record +
// Personal Organization + Owner membership are provisioned OUT-OF-BAND by the M1 lazy-provisioning
// command (see `app/(auth)/login/actions.ts`), never coined here. On a valid submit the form shows an
// honest interim notice; it fabricates no account and invents no contract. Org/role setup is a
// SEPARATE step (P-AUTH-03, "every user ≥ 1 org") — so signup deliberately collects NO company/role
// fields (kept out of this screen despite the reference mockup showing them).
import type { Metadata } from "next";
import Link from "next/link";
import { BrandLogo } from "@/frontend/brand";
import { AuthShell } from "../_components/auth-shell";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = {
  title: "Create your account — iVendorz",
  description:
    "Create an iVendorz account to source from verified industrial suppliers across Bangladesh.",
};

export default function SignupPage() {
  return (
    <AuthShell
      aside={{
        headline: "Source smarter with verified industrial suppliers.",
        subcopy:
          "Join procurement teams posting RFQs and awarding contracts on the trusted B2B marketplace for Bangladesh.",
        points: [
          "Post RFQs — no fees to post",
          "Verified suppliers only",
          "Compare competing quotes in one place",
        ],
        footNote:
          "Default-private by design — your sourcing activity is visible only to you and the vendors you invite.",
      }}
    >
      {/* Top bar — mobile brand (the aside is hidden below lg) + cross-link to login. */}
      <div className="mb-8 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="inline-flex rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background lg:hidden"
        >
          <BrandLogo height={30} />
        </Link>
        <p className="ml-auto text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="rounded-sm font-medium text-iv-navy-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Sign in
          </Link>
        </p>
      </div>

      <div className="mb-7">
        <h1 className="text-[1.7rem] font-extrabold tracking-tight text-iv-ink-heading">
          Create your account
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Start sourcing from verified suppliers across Bangladesh.
        </p>
      </div>

      <SignupForm />

      <p className="mt-7 text-center text-xs text-muted-foreground">
        Protected by verification &amp; an immutable audit trail.
      </p>
    </AuthShell>
  );
}
