// Signup route (`/signup`) — P-AUTH-02 (Auth template · Doc-7E §2 · Doc-7C §2.1; journey J-GST-06).
// Unauthenticated; NO active-org context and NO session held while authenticating — `(auth)` is
// distinct from `(app)` (Doc-7C §2.1). RSC shell composing the client sign-up form; self-contained
// centered layout (does NOT add an `(auth)/layout.tsx` — that would alter the sibling Login page).
//
// PRESENTATION-ONLY (parallel FE stream): the form is fully composed from the Doc-7B kit but performs
// NO account creation. There is no `create_user` wire contract — `[ESC-7-API-SIGNUP]`: the user record
// + Personal Organization + Owner membership are provisioned OUT-OF-BAND by the M1 lazy-provisioning
// command (see `app/(auth)/login/actions.ts`), never coined here. On a valid submit the form shows an
// honest interim notice; it fabricates no account and invents no contract. Org setup is a SEPARATE
// step (P-AUTH-03, "every user ≥ 1 org").
import type { Metadata } from "next";
import Link from "next/link";
import { BrandLogo } from "@/frontend/brand";
import { Card } from "@/frontend/primitives/card";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = {
  title: "Create your account — iVendorz",
  description:
    "Create an iVendorz account to source from verified industrial suppliers across Bangladesh.",
};

export default function SignupPage() {
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
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-iv-ink-heading">
              Create your account
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Source from verified industrial suppliers across Bangladesh.
            </p>
          </div>

          <SignupForm />
        </Card>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="rounded-sm font-medium text-iv-navy-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
