// "Verified" marker for a Trust-verified field/value (S2/S3/S4). Presentation-only and READ-ONLY:
// it reflects M5/Trust verification (the firewall — M2 never decides verification). Renders nothing
// when not verified. RSC-friendly.
import { ShieldCheck } from "lucide-react";
import { Badge } from "@/frontend/primitives/badge";

export interface VerifiedMarkerProps {
  verified?: boolean;
  className?: string;
}

export function VerifiedMarker({ verified, className }: VerifiedMarkerProps) {
  if (!verified) return null;
  return (
    <Badge variant="success" className={className}>
      <ShieldCheck aria-hidden="true" className="size-3" />
      Verified
    </Badge>
  );
}
