// PL-1 Pipeline (companion §13.2 → (app)/leads). The vendor's private CRM of RECEIVED RFQ invitations
// (read = ops.list_leads.v1, cursor, no totals). RECEIVED-ONLY: leads are created out-of-wire on the
// VendorInvited event — the vendor never self-creates one (no add affordance). Presentation-only;
// renders genuine-empty (one canonical, byte-equivalent copy) until the reads are wired. List is the
// default view; Board is a desktop convenience with non-numeric column links. Uses the shell PageHeader.
import type { Metadata } from "next";
import { PageHeader } from "../../../_components/shell";
import { LeadBoard, LeadList, LeadPipeline } from "../../../_components/vendor/leads";

export const metadata: Metadata = { title: "Leadboard" };

export default function LeadsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Leadboard"
        description="Your private CRM of RFQ invitations you've received, on a stage board. Leads appear automatically — you don't create them."
      />
      {/* Board opens first (VX-03) — the kanban is the focus; List stays available as a tab. */}
      <LeadPipeline list={<LeadList />} board={<LeadBoard />} defaultView="board" />
    </div>
  );
}
