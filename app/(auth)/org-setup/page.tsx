// Org setup route (`/org-setup`) — P-AUTH-03 (Wizard template · Doc-7E §2.3; journey J-BUY-02).
// Post-signup onboarding: "every user ≥ 1 org" (Invariant #5 — Users act, Organizations own). Lives in
// the `(auth)` group because there is NO active-org context yet (Doc-7C §2.1). Composes the shared
// split-screen `AuthShell` (wide panel for the multi-column wizard). No dedicated redesign reference
// existed for this screen, so it adopts the family frame + kit for consistency; the wizard content is
// unchanged.
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
import { Building2 } from "lucide-react";
import { BrandLogo } from "@/frontend/brand";
import { AuthShell } from "../_components/auth-shell";
import { AuthIconBadge } from "../_components/auth-icon-badge";
import { OrgSetupWizard } from "./org-setup-wizard";

export const metadata: Metadata = {
  title: "Set up your organization — iVendorz",
  description:
    "Create the organization that will own your procurement on iVendorz — you’ll be its owner.",
};

export default function OrgSetupPage() {
  return (
    <AuthShell
      wide
      aside={{
        headline: "Set up the organization that owns your sourcing.",
        subcopy:
          "Every account works inside an organization — it owns your RFQs, quotes and documents. You’ll be its owner.",
        points: [
          "You become the Owner automatically",
          "It gets a unique reference on creation",
          "Invite your team once it’s set up",
        ],
        footNote: "Users act; organizations own — the platform’s core rule.",
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

      <AuthIconBadge>
        <Building2 />
      </AuthIconBadge>

      <div className="mb-6">
        <h1 className="text-[1.7rem] font-extrabold tracking-tight text-iv-ink-heading">
          Set up your organization
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          Every account works inside an organization — it owns your RFQs, quotes, and documents.
          You’ll be its owner.
        </p>
      </div>

      <OrgSetupWizard />
    </AuthShell>
  );
}
