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
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Wrench aria-hidden="true" className="size-6" />
      </span>
      <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Maintenance
      </p>
      <h1 className="mt-2 text-2xl font-semibold text-foreground">Down for maintenance</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        iVendorz is briefly unavailable while we carry out scheduled maintenance. We’ll be back
        shortly — thanks for your patience.
      </p>
      <div className="mt-6">
        <Button asChild variant="outline">
          <Link href="/">Try again</Link>
        </Button>
      </div>
    </div>
  );
}
