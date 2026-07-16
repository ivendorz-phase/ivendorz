import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  FileText,
  ClipboardCheck,
  Users,
  ShieldCheck,
  Lock,
} from "lucide-react";
import { Card } from "@/frontend/primitives/card";
import { Button } from "@/frontend/primitives/button";
import { Container } from "@/frontend/components/container";
import { PublicPageHead } from "../_components/public-page-head";

// Public About route (`/about`) — P-PUB-02 (Doc-7D Public surface · T-STATIC · TB-NONE;
// screen_specifications §P-PUB-02, journey J-GST-01). A pure SERVER COMPONENT mounted in the Doc-7C
// `(public)` shell (layout.tsx adds header + footer). ROUTING + COMPOSITION ONLY.
//
// SCOPE: STATIC MARKETING — anonymous, SSG-friendly + SEO-indexable, binds NO Doc-5 contract and
// fabricates no data. Copy is grounded ONLY in the product definition (CLAUDE.md §1 / Master Overview):
// no invented metrics, customer counts, funding, team, or dates. Section blocks + cards + CTA per the
// spec's Required set; conversion CTAs route anonymously to sign-up (/login, Doc-7D PR5) and discovery.
// Reading blocks use a reading-width utility because `--iv-reading-max` is not yet defined in tokens
// (globals.css defines `--iv-content-max` only) — flagged to the token owner (RV-0030 pattern). The
// `PublicPageHead` owns the single `<h1>`.
//
// ── 2026-07-16 · PORTED TO THE "iVendorz Public Pages" REFERENCE ──────────────────────────────────
// (design project `14497856-6435-433d-b191-2a32431d642b` → its `isAbout` screen). Governed by the
// owner directives in `.claude/skills/ivendorz-fe-design/SKILL.md` (§Reference-Design Fidelity +
// §Data & Copy Fidelity): match the reference's VISUAL design exactly; never copy its code, logic or
// data; escalate — never quietly resolve — anything that collides with a rule.
//
// The reference's own `isAbout` screen was evidently authored FROM this page: its "What iVendorz is"
// cards and "What we stand on" principles are this file's `WHAT_WE_DO` / `PRINCIPLES` copy VERBATIM,
// and its closing CTA matches too. So the port is narrow — those sections already match. It changes
// the intro band and adds one row:
//   • The centered light intro → the reference's shared navy `PublicPageHead` (crumb · eyebrow · h1 ·
//     lead). Copy is unchanged: a reference defines the visual design, not the words, so this page
//     keeps its own approved h1/lead rather than adopting the reference's.
//   • Its 4-up stats band → `JOURNEY` (below).
//
// DIVERGENCES FROM THE REFERENCE (both governed; do not "fix" them back):
//  1. ITS STATS BAND IS FABRICATED — "12,543 Active RFQs · 3,800+ Verified vendors · ৳4.2B Sourced in
//     2025 · 64 Districts served". No read backs any of them, M2/M3 are not built, and nothing has
//     been sourced. On an ANONYMOUS PUBLIC page a figure is a factual claim to a real visitor, not an
//     internal placeholder behind auth, so all four are forbidden outright (§Data & Copy Fidelity).
//     **OWNER RULING (2026-07-16): keep the band's 4-up footprint; fill it with true, non-numeric
//     content** — the canonical treatment for the whole class. Realized as `JOURNEY`.
//  2. ITS "THE STORY" SECTION IS NOT BUILT — **ESCALATED, awaiting a ruling.** It is not merely lorem
//     (which the directive lets me replace with copy of my own): the section is founder backstory
//     ("Our founders spent a decade chasing quotes over email and phone…") beside a "Team / office
//     photo" image slot. Both are unverifiable claims about REAL PEOPLE and a real company history
//     that no source in this repo supplies, and the directive is explicit that new business claims,
//     testimonials and dates are NOT "copy" I may write. This page's own scope note above already
//     records the same decision ("no invented … team"). Writing it would be fabrication; building it
//     empty would be worse. It stays out until the owner supplies the real story + photo, or rules
//     the section dropped.
export const metadata = {
  title: "About iVendorz — Industrial Procurement OS for Bangladesh",
  description:
    "iVendorz is the industrial procurement operating system for Bangladesh — connecting factories, plants, and EPC contractors with verified suppliers, from RFQ to award to delivery.",
};

// The procurement journey — the four stages this page's intro already describes ("from finding a
// supplier to closing out a delivered order"), each TRUE per the product definition (CLAUDE.md §1).
// This fills the reference's 4-up stats band under the owner's ruling: keep the footprint, drop the
// fabricated payload (see file header). It states the journey, never a count — nothing here is a
// figure, so nothing here can be false. Deliberately NOT the four product surfaces (`WHAT_WE_DO`
// below already renders those in full a section later; repeating them would be duplication, not a
// summary).
const JOURNEY = [
  {
    title: "Discover",
    body: "Find verified suppliers across a deep industrial category taxonomy.",
  },
  { title: "Request", body: "Send structured requirements out to matched, invited vendors." },
  { title: "Award", body: "Compare quotations like-for-like and award on an auditable trail." },
  { title: "Deliver", body: "Run the post-award document workflow through to a closed-out order." },
];

// The four product surfaces, stated verbatim from the product definition (CLAUDE.md §1 blend).
const WHAT_WE_DO = [
  {
    icon: Boxes,
    title: "B2B marketplace",
    body: "A discovery surface where industrial buyers find verified suppliers across a deep category taxonomy — capabilities, products, and projects, presented honestly.",
  },
  {
    icon: FileText,
    title: "Structured RFQ procurement",
    body: "A governed RFQ → quote → award workflow. Requirements go out, comparable quotations come back, and awards are made on a clear, auditable trail.",
  },
  {
    icon: ClipboardCheck,
    title: "Post-award operations",
    body: "Lightweight operations after the award — the document workflow (LOI, PO, challan, invoice, WCC) that keeps a purchase moving to delivery.",
  },
  {
    icon: Users,
    title: "Vendor network & CRM",
    body: "A private vendor CRM for each buyer to track the suppliers they work with — their own view, kept private to their organization.",
  },
];

// Principles — each is a TRUE architectural commitment (CLAUDE.md §1/§4/§5), not marketing invention.
const PRINCIPLES = [
  {
    icon: ShieldCheck,
    title: "A governed matching engine",
    body: "Sourcing runs on a governed routing and matching engine — not pay-to-win placement. A subscription never buys a better position in an RFQ; matching is decided the same way for everyone.",
  },
  {
    icon: Lock,
    title: "Private by default",
    body: "The organization is the boundary. Business records are private to the organization that owns them, and a buyer's private supplier decisions stay private — forever.",
  },
  {
    icon: FileText,
    title: "We never touch your transaction money",
    body: "iVendorz carries no escrow, wallet, or settlement between buyers and vendors. Payments happen off-platform; we record them, we never move them.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Page head — the reference's shared `.pghead` band (see file header). Copy is this page's
          OWN already-approved wording: a reference defines the visual design, never the words. */}
      <PublicPageHead
        eyebrow="Our mission"
        crumbs={[{ label: "About" }]}
        title="The procurement backbone of industrial Bangladesh"
        description="iVendorz is a procurement operating system for the factories, plants, and EPC contractors that keep industry running — and for the suppliers who serve them. We bring sourcing, quoting, and awarding onto one governed, verifiable workflow."
      />

      {/* The reference's 4-up stats band — footprint kept, fabricated payload dropped (see file
          header). Renders the procurement journey, which this page's own intro already states
          ("from finding a supplier to closing out a delivered order"). */}
      <section className="border-b border-border bg-background">
        <Container className="py-10">
          <ol className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {JOURNEY.map((stage, index) => (
              <li key={stage.title} className="flex flex-col gap-1.5">
                <span
                  aria-hidden
                  className="font-mono text-2xs font-semibold uppercase tracking-widest text-iv-brand-600"
                >
                  Step {index + 1}
                </span>
                <span className="text-xl font-bold tracking-tight text-iv-ink-heading">
                  {stage.title}
                </span>
                <span className="text-sm text-muted-foreground">{stage.body}</span>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* What we do. */}
      <section className="bg-muted/30">
        <Container className="py-14">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-iv-ink-heading sm:text-3xl">
              What iVendorz is
            </h2>
            <p className="mt-3 text-iv-ink-secondary">
              One platform across the whole procurement journey — from finding a supplier to closing
              out a delivered order.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {WHAT_WE_DO.map(({ icon: Icon, title, body }) => (
              <Card key={title} className="flex flex-col gap-3 p-6">
                <span className="flex size-10 items-center justify-center rounded-md bg-iv-brand-50 text-iv-brand-600">
                  <Icon aria-hidden="true" className="size-5" />
                </span>
                <h3 className="text-base font-semibold text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground">{body}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* How we're different. */}
      <section className="border-t border-border bg-background">
        <Container className="py-14">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-iv-ink-heading sm:text-3xl">
              What we stand on
            </h2>
            <p className="mt-3 text-iv-ink-secondary">
              A few commitments are wired into how the platform works — not slogans, but rules the
              system enforces.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
            {PRINCIPLES.map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex flex-col gap-3">
                <span className="flex size-10 items-center justify-center rounded-md bg-iv-brand-50 text-iv-brand-600">
                  <Icon aria-hidden="true" className="size-5" />
                </span>
                <h3 className="text-base font-semibold text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Closing CTA. */}
      <section className="border-t border-border bg-muted/30">
        <Container className="py-16 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-iv-ink-heading sm:text-3xl">
            Built for Bangladeshi industry
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-iv-ink-secondary">
            Join the buyers and suppliers sourcing with confidence on iVendorz.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="gap-2">
              <Link href="/login">
                Get started <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/marketplace">Explore the marketplace</Link>
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
