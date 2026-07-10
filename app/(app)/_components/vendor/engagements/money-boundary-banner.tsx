// Money-boundary banner (companion §13.3, NIT-C8 — persistent on the Payment AND Trade-Invoice
// surfaces). The platform NEVER holds, transfers, or settles funds: invoice/payment entries are records
// of OFF-PLATFORM payments only. There is no Pay/Settle/Escrow/Wallet affordance anywhere. This is a
// card + text composition (no new component coined). Presentation-only; RSC-friendly.
import { ShieldCheck } from "lucide-react";
import { cn } from "@/frontend/lib/cn";

export function MoneyBoundaryBanner({ className }: { className?: string }) {
  return (
    <div
      role="note"
      className={cn(
        "flex items-start gap-2 rounded-md border border-border bg-muted px-3 py-2 text-sm text-muted-foreground",
        className,
      )}
    >
      <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <p>
        Payment and invoice entries record off-platform payments. iVendorz never holds, transfers,
        or settles funds — there is no pay, settle, escrow or wallet here.
      </p>
    </div>
  );
}
