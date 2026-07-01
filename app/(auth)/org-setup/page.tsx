// Org setup route (`/org-setup`) — P-AUTH-03 (Wizard template · Doc-7E §2.3; journey J-BUY-02).
// Post-signup onboarding: "every user ≥ 1 org" (Invariant #5 — Users act, Organizations own). Lives in
// the `(auth)` group because there is NO active-org context yet (Doc-7C §2.1); does NOT add an
// `(auth)/layout.tsx` (that would alter the sibling Login/Signup pages).
//
// PRESENTATION-ONLY: composes the Doc-7B kit and performs NO mutation. It BINDS the frozen wired
// command `create_organization` (Doc-4C §C5 — caller-facing; creator becomes Owner atomically; a
// server-allocated `ORG-…` human ref is assigned), but this build does not call it — a completed
// wizard shows an honest interim and creates no organization. FIELD DISCIPLINE (invent nothing):
// collects only the frozen required `name`. `org_type` (enum values unenumerated in the corpus) and
// the `address`/`contact_info` value-objects are omitted rather than invented; `is_personal_org` is
// server-set and never client-sent. The "usage" step is presentation-only ONBOARDING INTENT — Platform
// Participation (Buyer/Vendor/Hybrid) is DERIVED from later profile creation, not a `create_organization`
// field (`[ESC-7-API]` participation); it is never submitted here.
import type { Metadata } from "next";
import Link from "next/link";
import { BrandLogo } from "@/frontend/brand";
import { Card } from "@/frontend/primitives/card";
import { OrgSetupWizard } from "./org-setup-wizard";

export const metadata: Metadata = {
  title: "Set up your organization — iVendorz",
  description:
    "Create the organization that will own your procurement on iVendorz — you’ll be its owner.",
};

export default function OrgSetupPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-muted/40 px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="mb-6 flex justify-center">
          <Link
            href="/"
            className="inline-flex rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <BrandLogo height={36} />
          </Link>
        </div>

        <Card className="p-6 shadow-iv-md sm:p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-iv-ink-heading">
              Set up your organization
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Every account works inside an organization — it owns your RFQs, quotes, and documents.
              You’ll be its owner.
            </p>
          </div>

          <OrgSetupWizard />
        </Card>
      </div>
    </main>
  );
}
