// P-DOC-02 Vendor Documents hub route (FE-DOC-02 · Team-3 · page_inventory §8A). A Next.js SERVER
// COMPONENT (App Router composition only): no business logic. Vendor mirror of the buyer hub
// (`(buyer)/documents/page.tsx`) — composes the SAME shared documents home
// (`_components/documents`), never forks it, per that home's own header rule ("buyer↔vendor
// surfaces import THIS, never each other").
//
// PRESENTATION-ONLY COMPOSITION (this milestone): the hub COMPOSES frozen module-owned reads —
// M4 BC-OPS-4 `ops.list_generated_documents.v1` (§1) + links over the M4 BC-OPS-2 document routes
// (§2, vendor-mounted at `/sell/engagements/[id]/*`) + M3 sourcing links (§3) + an M7
// platform-invoices link-out (§4, DF-6). NOTHING is wired today, so every section renders its
// EMPTY state (owner directive 2026-07-17: no demo data — a wired read or the empty state, never
// fabricated rows). The former vendor-perspective fixture universe (`ENG-2026-000124` family) is
// deleted; when BC-OPS-4/BC-OPS-2 reads land, their rows flow through the same filter pipeline
// below unchanged.
//
// URL PARAMS (all allowlisted, same pattern as the buyer leg — anything else ⇒ All):
//  • `?stage=` — the LifecycleStrip filter (six frozen stage keys; navigation, not state).
//  • `?view=`  — received | sent | pending | completed (derived presentation groupings).
//  • `?q=`     — a REFINE over the loaded rows (human_ref / kind label / source ref) — not a
//    server-search claim.
import { DocumentsHubView } from "../../../_components/vendor/documents";
import { DOCUMENT_STAGE_KEYS, type DocumentStageKey } from "../../../_components/documents";
import {
  DOCUMENTS_HUB_VIEWS,
  generatedDocKindLabel,
  type DocumentsHubData,
  type DocumentsHubViewPreset as HubView,
  type GeneratedDocumentRow,
  type HubEngagementRow,
  type TradeInvoicePointer,
} from "../../../_components/vendor/documents";
export const metadata = {
  title: "Documents",
};

// ——— §1 Generated documents — EMPTY until `ops.list_generated_documents.v1` is wired (see header).
const MOCK_GENERATED: GeneratedDocumentRow[] = [];

// ——— §2 Engagement document clusters — EMPTY until the BC-OPS-2 engagement reads are wired.
const MOCK_ENGAGEMENTS: HubEngagementRow[] = [];

// ——— Pending-attention trade-invoice pointers — EMPTY until the trade-invoice read is wired.
const MOCK_PENDING_INVOICES: TradeInvoicePointer[] = [];

const q = (value: string) => value.toLowerCase();

export default async function VendorDocumentsHubPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; stage?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const activeView = DOCUMENTS_HUB_VIEWS.includes(sp.view as HubView)
    ? (sp.view as HubView)
    : undefined;
  const activeStage = DOCUMENT_STAGE_KEYS.includes(sp.stage as DocumentStageKey)
    ? (sp.stage as DocumentStageKey)
    : undefined;
  const query = sp.q?.trim() ? sp.q.trim().slice(0, 80) : undefined;

  let generated = MOCK_GENERATED;
  if (activeStage) {
    generated = generated.filter((g) => g.doc_kind === activeStage);
  }
  if (activeView === "received" || activeView === "sent") {
    generated = generated.filter((g) => g.direction === activeView);
  }
  if (query) {
    const needle = q(query);
    generated = generated.filter(
      (g) =>
        q(g.human_ref).includes(needle) ||
        q(generatedDocKindLabel(g.doc_kind)).includes(needle) ||
        (g.source_ref ? q(g.source_ref).includes(needle) : false) ||
        (g.counterparty_ref ? q(g.counterparty_ref).includes(needle) : false),
    );
  }

  let engagements = MOCK_ENGAGEMENTS;
  if (activeView === "completed") {
    engagements = engagements.filter((e) => e.status === "completed" || e.status === "closed");
  }
  if (query) {
    const needle = q(query);
    engagements = engagements.filter((e) => q(e.human_ref).includes(needle));
  }

  let pendingInvoices = MOCK_PENDING_INVOICES;
  if (query) {
    const needle = q(query);
    pendingInvoices = pendingInvoices.filter(
      (p) => q(p.human_ref).includes(needle) || q(p.engagement_ref).includes(needle),
    );
  }

  const data: DocumentsHubData = {
    active_view: activeView,
    active_stage: activeStage,
    query,
    generated,
    engagements,
    pending_invoices: pendingInvoices,
    // EMPTY until a real recently-opened read exists — never a fabricated shortcut list.
    recently_opened: [],
  };
  return <DocumentsHubView data={data} />;
}
