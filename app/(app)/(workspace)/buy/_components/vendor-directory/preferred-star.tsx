"use client";

// My Vendor Directory — the ⭐ Preferred gesture (frozen `vendor_favorites`, Doc-4F §F4.6). Shared by
// the list rows and the detail header. PRESENTATION-ONLY. Encodes two BINDING rules:
//   • D1(a): only a LINKED record can be preferred — an unlinked vendor shows a disabled star + hint.
//   • D4: SETTING Preferred is open to any member; REMOVING is authorized-only (an ordinary member
//     sees the preferred state, never a remove control). Removing always routes through a confirm
//     dialog (owner-supplied handler). Persistence is PARKED — `ops.set/clear_vendor_favorite.v1`.

import { Star } from "lucide-react";
import { cn } from "@/frontend/lib/cn";
import { usePersonaCanRemove } from "./directory-persona";
import { canBePreferred, type DirectoryWorkingVendor } from "./working-model";

export interface PreferredStarProps {
  vendor: DirectoryWorkingVendor;
  size?: "sm" | "md";
  onSetPreferred: (vendor: DirectoryWorkingVendor) => void;
  onRequestRemovePreferred: (vendor: DirectoryWorkingVendor) => void;
}

export function PreferredStar({
  vendor,
  size = "sm",
  onSetPreferred,
  onRequestRemovePreferred,
}: PreferredStarProps) {
  const canRemove = usePersonaCanRemove();
  const classifiable = canBePreferred(vendor);
  const box = size === "md" ? "size-10" : "size-8";
  const icon = size === "md" ? "size-6" : "size-4";

  // D1(a): unlinked private vendors cannot be preferred.
  if (!classifiable) {
    return (
      <span
        className={cn("inline-flex items-center justify-center text-muted-foreground/30", box)}
        title="Link to a marketplace profile to prefer or set status"
        aria-label={`${vendor.name} — link to prefer`}
      >
        <Star aria-hidden className={icon} />
      </span>
    );
  }

  if (vendor.isFavorite) {
    // D4: an ordinary member sees the preferred state but no remove control.
    if (!canRemove) {
      return (
        <span
          className={cn("inline-flex items-center justify-center text-iv-amber-500", box)}
          title="Preferred"
          aria-label={`${vendor.name} is preferred`}
        >
          <Star aria-hidden className={cn(icon, "fill-current")} />
        </span>
      );
    }
    return (
      <button
        type="button"
        onClick={() => onRequestRemovePreferred(vendor)}
        title="Remove from Preferred"
        aria-label={`Remove ${vendor.name} from Preferred`}
        className={cn(
          "inline-flex items-center justify-center rounded-md text-iv-amber-500 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          box,
        )}
      >
        <Star aria-hidden className={cn(icon, "fill-current")} />
      </button>
    );
  }

  // Not preferred — setting Preferred is open to any member (add-is-open, D4).
  return (
    <button
      type="button"
      onClick={() => onSetPreferred(vendor)}
      title="Add to Preferred"
      aria-label={`Add ${vendor.name} to Preferred`}
      className={cn(
        "inline-flex items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-iv-amber-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        box,
      )}
    >
      <Star aria-hidden className={icon} />
    </button>
  );
}
