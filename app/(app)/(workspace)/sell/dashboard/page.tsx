// Vendor Dashboard — VX-02 layout revision (2026-07-15, owner-directed against the "Vendor Dashboard
// Overview" reference). Supersedes VX-01's header-card + activity-feed composition with the
// reference's own structure: a heading row, a 4-up KPI band, and a 1.55fr/1fr middle grid holding a
// documents table beside a two-card right column.
//
// OWNER RULING DRIVING THIS BUILD: "match the reference's visual hierarchy, spacing, proportions and
// stacked-card composition — but do not invent data or metrics; where a reference widget is not
// backed by our domain model, substitute a semantically equivalent, data-backed component of the
// same footprint." Every substitution below is recorded against that ruling.
//
// PRESENTATION-FIXTURE SEED (unchanged posture from VX-01): the figures and rows below are an
// explicitly-labelled presentation fixture — no read is wired yet. This mirrors the buyer dashboard's
// own disclosed SEED posture ((workspace)/buy/dashboard/page.tsx) exactly: a static, disclosed
// fixture object, never a client-computed count over partial data (which would violate R7). Every
// field below binds a REAL frozen field on a REAL read's row shape — the fixture supplies values,
// never new concepts.
//
// WHAT THE REFERENCE ASKED FOR AND WHY IT IS NOT HERE (three substitutions, all owner-ruled):
//  1. "Follow-ups due: 12" KPI tile + the follow-ups card's "12" header badge — an aggregate over
//     leads is forbidden (ND-8; see `next-actions-card.tsx`'s header). Substituted by `NextActionsCard`,
//     which renders the same rows with the same footprint but NO count.
//  2. "Documents issued" weekly bar chart — no time-series field exists on any vendor read, no
//     charting component or library exists in this repo, and bucketing client-side would violate R7.
//     Inventing the metric is a GR#8 scope expansion. The right column's second slot is filled by
//     `GlobalTrustScoreCard` — a REAL summary panel of equivalent height and visual weight, already
//     Board-ruled for display (2026-07-03).
//  3. Per-KPI delta chips ("+4 this wk") — same time-bucketing objection as (2); no delta prop
//     exists on the tile. The `live` chip occupies that slot (VX-01 semantics, unchanged).
//
// ALSO DROPPED FROM THE REFERENCE, DELIBERATELY:
//  • Its sidebar, top bar, search box and org/user chip — all already rendered by the shared
//    `(workspace)` shell. This page is the `<main>` only and must not re-render chrome. This also
//    retires VX-01's `DashboardHeaderCard`, which its own header admitted was a decorative duplicate
//    of that shell topbar (owner-confirmed drop, 2026-07-15).
//  • Its Selling/Buying role toggle — explicitly REJECTED by the hybrid co-mount ruling
//    (`hybrid-shell-vm.ts`: co-mounted grouped-not-merged, "never a toggle, never a cross-route swap").
//  • Its "Good morning, <name>" greeting — a time-of-day claim needs a client clock (forbidden
//    repo-wide); the greeting is time-neutral and named from the shared `VENDOR_IDENTITY_SEED`
//    placeholder rather than a fabricated person.
//  • Its ₹ / GSTIN / Indian-city fixture data — this platform is Bangladesh (BDT/৳); money, when it
//    appears on a wired read, renders through the kit `CurrencyDisplay` with a contract-carried
//    currency, never a hardcoded symbol.
//
// The Global Trust Score panel's own three-point governance disclosure is unchanged and still lives
// in `global-trust-score-card.tsx` — read it before touching that panel.
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "../../../_components/shell";
import { Button } from "@/frontend/primitives/button";
import { VendorKpiStatCard } from "../../../_components/vendor/dashboard/vendor-kpi-stat-card";
import { RecentDocumentsCard } from "../../../_components/vendor/dashboard/recent-documents-card";
import { NextActionsCard } from "../../../_components/vendor/dashboard/next-actions-card";
import { GlobalTrustScoreCard } from "../../../_components/vendor/dashboard/global-trust-score-card";
import { VENDOR_IDENTITY_SEED } from "../../../_components/vendor/identity-seed";
import type { GeneratedDocumentRow } from "../../../_components/vendor/documents/documents-hub-view-models";
import type { LeadView } from "../../../_components/vendor/leads/types";

export const metadata: Metadata = { title: "Dashboard" };

// Presentation-fixture SEED (see header) — the four VX-01 tiles, unchanged. Captions are QUALITATIVE
// descriptors of what each figure counts; never a second figure and never a trend claim.
const KPI_SEED = [
  {
    label: "Total RFQs",
    value: 156,
    caption: "Invitations received to date",
  },
  {
    label: "Active Quotes",
    value: 42,
    caption: "Submitted, awaiting buyer response",
  },
  {
    label: "New POs",
    value: 12,
    caption: "Awaiting your acknowledgement",
  },
  {
    label: "Messages",
    value: 8,
    caption: "Buyer inquiries in your inbox",
  },
];

// Presentation-fixture SEED — real `BC-OPS-4` row shape. `doc_kind` values are the as-projected
// strings from `GENERATED_DOC_KIND_LABEL`; `counterparty_ref` is an OPAQUE ref (M4 projects no name);
// `issued_at` is a server-formatted label (no client clock). Ordered newest-first per
// `DOCUMENTS_DEFAULT_SORT` — the read's contract, not a client sort.
const RECENT_DOCUMENTS_SEED: GeneratedDocumentRow[] = [
  {
    id: "gd-1",
    human_ref: "QTN-2026-000412",
    doc_kind: "quotation",
    version_no: 2,
    direction: "sent",
    source_engagement_id: "eng-1",
    source_ref: "RFQ-2026-000188",
    counterparty_ref: "ORG-8F42C1",
    issued_at: "Today",
  },
  {
    id: "gd-2",
    human_ref: "CHL-2026-000097",
    doc_kind: "challan",
    version_no: 1,
    direction: "sent",
    source_engagement_id: "eng-2",
    source_ref: "ENG-2026-000054",
    counterparty_ref: "ORG-2B7D90",
    issued_at: "Today",
  },
  {
    id: "gd-3",
    human_ref: "PO-2026-000231",
    doc_kind: "po",
    version_no: 1,
    direction: "received",
    source_engagement_id: "eng-2",
    source_ref: "ENG-2026-000054",
    counterparty_ref: "ORG-2B7D90",
    issued_at: "12 Jul",
  },
  {
    id: "gd-4",
    human_ref: "BIL-2026-000188",
    doc_kind: "bill",
    version_no: 3,
    direction: "sent",
    source_engagement_id: "eng-3",
    source_ref: "ENG-2026-000041",
    counterparty_ref: "ORG-5C1E44",
    issued_at: "11 Jul",
  },
  {
    id: "gd-5",
    human_ref: "WCC-2026-000063",
    doc_kind: "wcc",
    version_no: 1,
    direction: "received",
    source_engagement_id: "eng-3",
    source_ref: "ENG-2026-000041",
    counterparty_ref: "ORG-5C1E44",
    issued_at: "10 Jul",
  },
  {
    id: "gd-6",
    human_ref: "QTN-2026-000409",
    doc_kind: "quotation",
    version_no: 1,
    direction: "sent",
    source_engagement_id: "eng-4",
    source_ref: "RFQ-2026-000182",
    counterparty_ref: "ORG-9A03F7",
    issued_at: "09 Jul",
  },
];

// Presentation-fixture SEED — real `LeadView` fields. `next_action_urgency` is caller/server-supplied
// (no client clock); `rfq_human_ref` is the row's real display ref. No buyer name is coined (DF-3).
const NEXT_ACTIONS_SEED: LeadView[] = [
  {
    id: "lead-1",
    stage: "follow_up",
    rfq_human_ref: "RFQ-2026-000188",
    rfq_summary: "Industrial gate valves — DN200, CS body",
    next_action_at: "13 Jul",
    next_action_urgency: "overdue",
    next_action_label: "Negotiate MOQ pricing",
  },
  {
    id: "lead-2",
    stage: "quoted",
    rfq_human_ref: "RFQ-2026-000186",
    rfq_summary: "Centrifugal pump spares",
    next_action_at: "15 Jul",
    next_action_urgency: "due_today",
    next_action_label: "Confirm dispatch slot",
  },
  {
    id: "lead-3",
    stage: "negotiation",
    rfq_human_ref: "RFQ-2026-000182",
    rfq_summary: "MS structural fabrication — 12 T",
    next_action_at: "17 Jul",
    next_action_urgency: "upcoming",
    next_action_label: "Share revised drawings",
  },
];

const TRUST_SEED = {
  score: 88,
  tier: "gold" as const,
  progressToNextTier: 0.72,
};

export default function VendorDashboardPage() {
  return (
    <div>
      <PageHeader
        title={`Welcome back, ${VENDOR_IDENTITY_SEED.userName}`}
        description="Your quotations, documents and buyer follow-ups at a glance."
        meta={
          <span className="font-mono text-2xs font-semibold uppercase tracking-widest text-muted-foreground">
            Selling · Overview
          </span>
        }
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/sell/documents">View documents</Link>
            </Button>
            <Button asChild>
              <Link href="/sell/rfqs?state=draft">Make offer</Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {KPI_SEED.map((kpi) => (
          <VendorKpiStatCard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            caption={kpi.caption}
            live
          />
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 items-start gap-4 xl:grid-cols-[1.55fr_1fr]">
        <RecentDocumentsCard rows={RECENT_DOCUMENTS_SEED} />

        <div className="flex flex-col gap-4">
          <NextActionsCard leads={NEXT_ACTIONS_SEED} />
          <GlobalTrustScoreCard
            score={TRUST_SEED.score}
            tier={TRUST_SEED.tier}
            progressToNextTier={TRUST_SEED.progressToNextTier}
          />
        </div>
      </div>
    </div>
  );
}
