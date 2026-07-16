import { Info } from "lucide-react";
import { Container } from "@/frontend/components/container";
import { PublicPageHead } from "../../_components/public-page-head";

// Reusable legal-document scaffold for the public Legal pages (P-PUB-21 Terms / P-PUB-22 Privacy;
// Doc-7D Public surface · T-STATIC). PURE SERVER COMPONENT, presentation-only. It renders a long-form
// reading layout: a prominent placeholder notice, an in-page anchor nav, and the sectioned document body
// with separators + document landmarks (heading outline, `id` anchors).
//
// FIELD DISCIPLINE: this is a SCAFFOLD, not legal content. Placeholder callers pass honest placeholder
// section text — no binding terms, clauses, governing law, entity details, or real dates are coined —
// and leave `published` unset, so the amber "pending Legal review / not yet binding" notice renders and
// `lastUpdated` stays a placeholder token (e.g. "Pending"). A caller that has passed publication review
// and been authorized to go live passes `published` (a real `lastUpdated` date), which suppresses the
// notice. Default is UNPUBLISHED — the safe state — so a caller must opt in explicitly to go live.
// Reading width uses a utility because `--iv-reading-max` is not yet defined in tokens (globals.css defines
// `--iv-content-max` only) — flagged to the token owner (RV-0030 pattern). The page owns the single `<h1>`
// (via `PublicPageHead`).
//
// ── 2026-07-16 · PORTED TO THE "iVendorz Public Pages" REFERENCE ──────────────────────────────────
// (design project `14497856-6435-433d-b191-2a32431d642b` → its `isTerms` / `isPrivacy` / `isCharter`
// screens). One scaffold change ports all three pages. VISUAL ONLY, per the owner directives in
// `.claude/skills/ivendorz-fe-design/SKILL.md`:
//   • the plain white header → the shared navy `PublicPageHead` (crumb · eyebrow · h1 · lead);
//   • the stacked anchor nav → the reference's two-column `legal-layout` (nav beside the body,
//     sticky on desktop, collapsing back above the body below `lg`).
//
// NOTHING ELSE IS TAKEN FROM THE REFERENCE, and deliberately so — on these three pages our content is
// the more honest of the two:
//  • ITS ENTIRE BODY IS LOREM. Ours is an explicit placeholder scaffold that states what each section
//    WILL cover and coins no clause. Lorem never ships (§Data & Copy Fidelity), and legal wording is
//    emphatically not "copy" for an agent to author — the field discipline above is unchanged.
//  • IT FABRICATES A DATE — "Last updated 1 July 2026". `lastUpdated` stays the caller's token
//    ("Pending"): dates are not copy to invent, and a real date here would assert that a Legal review
//    which has not happened, has. The unpublished amber notice still renders for the same reason.
//  • ITS CRUMB LINKS "Legal" to its own page. There is no `/legal` index route in this codebase, so
//    the crumb renders unlinked rather than inventing a destination.

export interface LegalSection {
  id: string;
  heading: string;
  paragraphs: string[];
}

export function LegalDocument({
  title,
  intro,
  lastUpdated,
  sections,
  published = false,
}: {
  title: string;
  intro: string;
  lastUpdated: string;
  sections: LegalSection[];
  published?: boolean;
}) {
  return (
    <>
      {/* The reference's shared navy `.pghead`, with its crumb trail (Home › Legal › {title}).
          "Legal" is an unlinked grouping crumb: there is no `/legal` index route, and the reference
          only links it to its own page because it is a click-through prototype — we do not invent a
          destination. `lastUpdated` sits in the head exactly as the reference places it (see file
          header for why its value stays a token). */}
      <PublicPageHead
        eyebrow="Legal"
        crumbs={[{ label: "Legal" }, { label: title }]}
        title={title}
        description={intro}
      >
        <p className="font-mono text-xs uppercase tracking-wider text-white/70">
          Last updated: {lastUpdated}
        </p>
      </PublicPageHead>

      <section className="bg-background">
        <Container className="py-12 sm:py-14">
          {/* Placeholder notice — shown until the caller is published (publication review passed). */}
          {!published && (
            <div
              role="note"
              className="mb-10 flex items-start gap-2 rounded-md border border-iv-amber-100 bg-iv-amber-50 px-4 py-3 text-sm text-iv-amber-700"
            >
              <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              <p>
                This document is a placeholder. Its wording is pending Legal review and is not yet
                binding — it is shown to preview the structure only.
              </p>
            </div>
          )}

          {/* The reference's two-column `legal-layout`: anchor nav beside the body (it previously
              stacked above). The nav sticks on desktop so the trail stays reachable in a long
              document; it collapses back above the body below `lg`. */}
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[220px_minmax(0,1fr)]">
            <nav aria-label="On this page" className="lg:sticky lg:top-24 lg:self-start">
              <h2 className="text-2xs font-semibold uppercase tracking-widest text-muted-foreground">
                On this page
              </h2>
              <ol className="mt-3 space-y-1.5">
                {sections.map((s, i) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="rounded-sm text-sm text-iv-brand-600 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {i + 1}. {s.heading}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            {/* Document body — reading measure preserved (see file header's RV-0030 note). */}
            <div className="max-w-[70ch] space-y-10">
              {sections.map((s, i) => (
                <section
                  key={s.id}
                  id={s.id}
                  aria-labelledby={`${s.id}-heading`}
                  className="scroll-mt-24"
                >
                  <h2 id={`${s.id}-heading`} className="text-xl font-semibold text-iv-ink-heading">
                    {i + 1}. {s.heading}
                  </h2>
                  <div className="mt-3 space-y-3">
                    {s.paragraphs.map((p, j) => (
                      <p key={j} className="text-sm leading-relaxed text-muted-foreground">
                        {p}
                      </p>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
