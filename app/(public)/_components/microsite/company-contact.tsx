// CompanyContact (M2.6) — the "Get in touch" section for the vendor microsite. Address + business hours
// are editorial (open), but the direct-contact CHANNELS (phone / email / website) are PLATFORM-MEDIATED:
// they render a "Sign in to view" link to `(auth)` rather than a fabricated number/address — this both
// avoids fabricating contact details AND respects the platform lead model (buyer↔vendor contact runs
// through iVendorz). The map is a DECORATIVE placeholder (no real embed/coordinates). Anonymous intents
// (Send RFQ / Request a callback) route to `(auth)`, never a mutation; "Visit marketplace profile" is a
// public navigation link. Presentation-only. Reuses the kit (Card/Button); RSC-friendly.
import type { ReactNode } from "react";
import Link from "next/link";
import { Clock, Globe, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { Card, CardContent } from "@/frontend/primitives/card";
import type { CompanyContactVM } from "./company-content-seed";

export interface CompanyContactProps {
  vendorName: string;
  contact?: CompanyContactVM;
  /** Anonymous-intent destination — routes to `(auth)`, never mutates. */
  authHref: string;
  /** Public marketplace navigation link. */
  marketplaceHref: string;
}

function Row({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span aria-hidden="true" className="mt-0.5 text-iv-navy-700">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <div className="text-sm text-foreground">{value}</div>
      </div>
    </div>
  );
}

export function CompanyContact({
  vendorName,
  contact,
  authHref,
  marketplaceHref,
}: CompanyContactProps) {
  // Channels are mediated by the platform — a sign-in link instead of a fabricated number/address.
  const gated = (
    <Link
      href={authHref}
      className="rounded-sm font-medium text-iv-navy-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      Sign in to view
    </Link>
  );

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardContent className="flex flex-col gap-4 pt-6">
          {contact?.address ? (
            <Row icon={<MapPin className="size-4" />} label="Address" value={contact.address} />
          ) : null}
          {contact?.hours ? (
            <Row icon={<Clock className="size-4" />} label="Business hours" value={contact.hours} />
          ) : null}
          <Row icon={<Phone className="size-4" />} label="Phone" value={gated} />
          <Row icon={<Mail className="size-4" />} label="Email" value={gated} />
          <Row icon={<Globe className="size-4" />} label="Website" value={gated} />

          {/* Anonymous intents → (auth); never mutate here (Doc-7D §5). */}
          <div className="mt-1 flex flex-wrap gap-2">
            <Button asChild>
              <Link href={authHref}>Send RFQ</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={authHref}>Request a callback</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href={marketplaceHref}>Visit marketplace profile</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Decorative map placeholder — no real embed or coordinates. */}
      <Card className="overflow-hidden">
        <div className="flex h-full min-h-[14rem] flex-col items-center justify-center gap-2 bg-muted text-muted-foreground">
          <MapPin aria-hidden="true" className="size-7" />
          <span className="text-sm font-medium text-foreground">
            {contact?.mapLabel ?? vendorName}
          </span>
          <span className="text-xs">Map preview</span>
        </div>
      </Card>
    </div>
  );
}
