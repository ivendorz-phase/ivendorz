"use client";

// Comparison Document — screen-only toolbar (the canonical print surface's actions). Print is the
// browser's own `window.print()` over the fixed A4 sheets (print CSS isolates the document). Excel export
// is an HONEST DISABLED STUB — platform PDF/Excel generation is not a frozen capability (ESC-CS-EXPORT);
// nothing is fabricated. Hidden in print via `.cd-print-hidden` on the wrapper.

import Link from "next/link";
import { ArrowLeft, FileSpreadsheet, Printer } from "lucide-react";
import { Button } from "@/frontend/primitives/button";

export function DocumentToolbar({ backHref }: { backHref: string }) {
  return (
    <>
      <Button asChild variant="ghost" size="sm">
        <Link href={backHref}>
          <ArrowLeft aria-hidden /> Back to comparison
        </Link>
      </Button>
      <Button
        variant="secondary"
        size="sm"
        disabled
        title="Excel export is pending governance approval (ESC-CS-EXPORT)"
      >
        <FileSpreadsheet aria-hidden /> Excel export
        <span className="sr-only"> (pending governance approval)</span>
      </Button>
      <Button size="sm" onClick={() => window.print()}>
        <Printer aria-hidden /> Print / Save as PDF
      </Button>
    </>
  );
}
