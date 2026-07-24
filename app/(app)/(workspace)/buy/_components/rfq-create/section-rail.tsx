"use client";

// P-BUY-RFQ (P-BUY-07) Phase 2 — SECTION RAIL. The app-shell sidebar is suppressed on /buy/rfqs/new
// (shell/sidebar.tsx), so this in-page rail IS the page's primary sidebar. Each item shows: a
// completion dot (section's required fields satisfied) · a blocker-count badge (unmet submission
// blockers in that section) · a scroll-spy active state (`aria-current`) · click → smooth-scroll to
// the section and focus its first field. Sticky, capped to `calc(100vh-88px)` with internal scroll
// (a sticky column must never exceed the viewport — the carried-in prototype trap). PRESENTATION-ONLY.

import { cn } from "@/frontend/lib/cn";
import type { RfqSectionId, SectionStatus } from "./rfq-draft-validation";

export interface SectionMeta {
  id: RfqSectionId;
  label: string;
}

/** Canvas section order — the rail, the anchors and the scroll-spy all read from this one list. */
export const RFQ_SECTIONS: SectionMeta[] = [
  { id: "requirement", label: "Requirement" },
  { id: "specification", label: "Specification" },
  { id: "attachments", label: "Attachments" },
  { id: "terms", label: "Terms & conditions" },
  { id: "delivery", label: "Delivery" },
  { id: "routing", label: "Vendor routing" },
  { id: "value", label: "Estimated value" },
  { id: "communication", label: "Communication" },
];

/** DOM anchor id for a section (used by the rail, the readiness panel and the scroll-spy). */
export const sectionAnchorId = (id: RfqSectionId) => `rfq-sec-${id}`;

export function SectionRail({
  statuses,
  activeSection,
  onNavigate,
}: {
  statuses: Record<RfqSectionId, SectionStatus>;
  activeSection: RfqSectionId | null;
  onNavigate: (id: RfqSectionId) => void;
}) {
  return (
    <nav
      aria-label="RFQ sections"
      className="sticky top-3.5 hidden max-h-[calc(100vh-88px)] overflow-y-auto overscroll-contain lg:block"
    >
      <p className="mb-1.5 px-2 text-2xs font-bold uppercase tracking-wide text-muted-foreground/80">
        Sections
      </p>
      <ul className="flex flex-col gap-0.5">
        {RFQ_SECTIONS.map((s) => {
          const st = statuses[s.id];
          const isActive = activeSection === s.id;
          return (
            <li key={s.id}>
              <a
                href={`#${sectionAnchorId(s.id)}`}
                aria-current={isActive ? "true" : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(s.id);
                }}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2.5 py-2 text-sm leading-tight text-foreground/80 transition-colors hover:bg-accent",
                  isActive && "bg-iv-brand-100 font-semibold text-iv-brand-800",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "size-2 shrink-0 rounded-full",
                    st.done ? "bg-iv-success-base" : "bg-border",
                  )}
                />
                <span className="min-w-0 flex-1 truncate">{s.label}</span>
                {st.blockers > 0 ? (
                  <span
                    className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-iv-danger-subtle px-1 text-2xs font-bold text-iv-danger-base"
                    aria-label={`${st.blockers} item required before submission`}
                  >
                    {st.blockers}
                  </span>
                ) : null}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
