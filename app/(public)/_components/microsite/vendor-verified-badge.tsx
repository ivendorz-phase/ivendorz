// Vendor verified badge (M2.5 microsite). The ONLY trust signal on the public microsite is the BINARY
// "Verified" badge (M5 public projection): true → the badge; absence = NO badge (never a "pending" /
// "unverified" state). NO numeric trust score, NO trust/performance band, NO financial tier — those are
// deferred behind [ESC-7G-SCORE-DISPLAY] (human Board) and are not in the public read (Doc-5G R10,
// Doc-7D §4). Reuses the kit Badge; renders nothing when not verified. Presentation-only; RSC-friendly.
import { ShieldCheck } from "lucide-react";
import { Badge } from "@/frontend/primitives/badge";
import { cn } from "@/frontend/lib/cn";

export function VendorVerifiedBadge({
  verified,
  className,
}: {
  verified?: boolean;
  className?: string;
}) {
  if (!verified) return null;
  return (
    <Badge variant="success" className={cn("gap-1", className)}>
      <ShieldCheck aria-hidden="true" className="size-3" />
      Verified
    </Badge>
  );
}
