// Vendor microsite breadcrumb (M2.5). Vendors directory → this vendor. Non-disclosing: renders exactly
// the trail it is given (it never derives ancestry). Reuses the established public breadcrumb pattern
// (the one previously inlined on the vendor profile page). Presentation-only; RSC-friendly.
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface VendorBreadcrumbProps {
  /** The vendor's display name (the current, non-linked crumb). */
  name: string;
  /** Directory href (the parent crumb). Defaults to the public vendors directory. */
  vendorsHref?: string;
}

export function VendorBreadcrumb({ name, vendorsHref = "/vendors" }: VendorBreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-muted-foreground">
      <Link href={vendorsHref} className="rounded-sm hover:text-foreground">
        Vendors
      </Link>
      <ChevronRight aria-hidden="true" className="size-4" />
      <span aria-current="page" className="truncate text-foreground">
        {name}
      </span>
    </nav>
  );
}
