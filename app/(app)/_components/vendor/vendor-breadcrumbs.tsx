// Vendor Workspace breadcrumb (companion §2.4 — the only vendor-added top chrome). Presentation-
// only and NON-DISCLOSING: it renders exactly the trail it is given; it never derives or reveals
// anything about absence/exclusion (GR11 byte-equivalence). RSC-friendly (no hooks).
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/frontend/lib/cn";

export interface VendorBreadcrumbItem {
  label: string;
  /** Omit on the current (last) item. */
  href?: string;
}

export interface VendorBreadcrumbsProps {
  items: VendorBreadcrumbItem[];
  className?: string;
}

export function VendorBreadcrumbs({ items, className }: VendorBreadcrumbsProps) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={cn("min-w-0", className)}>
      <ol className="flex items-center gap-1 text-sm text-muted-foreground">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-1">
              {index > 0 && (
                <ChevronRight
                  aria-hidden="true"
                  className="size-4 shrink-0 text-muted-foreground"
                />
              )}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="truncate rounded-sm hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn("truncate", isLast && "font-medium text-foreground")}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
