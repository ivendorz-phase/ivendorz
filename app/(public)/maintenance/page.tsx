import Link from "next/link";
import { Wrench } from "lucide-react";
import { Button } from "@/frontend/primitives/button";

// Public Maintenance route (`/maintenance`) — P-SH-05 (Doc-7C · T-STATE; screen_specifications §P-SH-05).
// A pure SERVER COMPONENT rendered in the Doc-7C `(public)` shell. Presentation-only.
//
// SCOPE: a planned-downtime / dependency-unavailable (503) notice — a simple, honest state. It fabricates
// NO incident data: no ETA, timestamp, incident id, uptime, or status history is invented (a wired build
// would surface any real window from the platform). The optional "retry" is a plain navigation back to the
// app (no wired backoff). Styled to match the shipped 404/403 state layout for consistency; the frozen kit
// is unchanged and no primitive is duplicated. Binds no Doc-5 contract. This page owns the single `<h1>`.
export const metadata = {
  title: "Down for maintenance — iVendorz",
};

export default function MaintenancePage() {
  return (
    // 2026-07-16 — ported to the reference (`isMaintenance`): a utility screen, so no `PublicPageHead`
    // (the reference gives it none). Ported: its proportions — a larger icon medallion, heading and
    // lead measure, and its single outline action. Copy is unchanged; in particular no return time is
    // promised, since we have none to state.
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center sm:py-28">
      <span className="flex size-16 items-center justify-center rounded-full bg-iv-brand-50 text-iv-brand-600">
        <Wrench aria-hidden="true" className="size-8" />
      </span>
      <p className="mt-6 font-mono text-xs font-semibold uppercase tracking-widest text-iv-brand-600">
        Maintenance
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-iv-ink-heading sm:text-4xl">
        Down for maintenance
      </h1>
      <p className="mt-4 max-w-xl text-base text-iv-ink-secondary">
        iVendorz is briefly unavailable while we carry out scheduled maintenance. We’ll be back
        shortly — thanks for your patience.
      </p>
      <div className="mt-8">
        <Button asChild size="lg" variant="outline">
          <Link href="/">Try again</Link>
        </Button>
      </div>
    </div>
  );
}
