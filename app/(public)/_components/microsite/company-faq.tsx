// CompanyFaq (M2.6) — frequently-asked questions for the vendor microsite, as a native HTML
// `<details>`/`<summary>` disclosure list. Native disclosure is fully accessible and needs NO client
// JavaScript, so this stays an RSC (no "use client"). The Q&A is editorial, deliberately non-committal
// (no fabricated binding specifics — MOQ/lead-time/warranty defer to a quotation). No frozen field; coins
// nothing. Presentation-only; genuine-empty when absent. Reuses the kit tokens.
import { ChevronDown } from "lucide-react";
import type { FaqItemVM } from "./company-content-seed";

export interface CompanyFaqProps {
  items?: FaqItemVM[];
}

export function CompanyFaq({ items }: CompanyFaqProps) {
  if (!items || items.length === 0) return null;
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => (
        <li key={item.question}>
          <details className="group rounded-lg border border-border bg-card">
            <summary className="flex cursor-pointer items-center justify-between gap-3 rounded-lg px-4 py-3 text-sm font-medium text-iv-ink-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
              {item.question}
              <ChevronDown
                aria-hidden="true"
                className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
              />
            </summary>
            <div className="px-4 pb-4 text-sm leading-relaxed text-muted-foreground">
              {item.answer}
            </div>
          </details>
        </li>
      ))}
    </ul>
  );
}
