"use client";

// Comparison Document — the redesigned Comparative Statement (a fresh `.cd-` visual system; NOT the old
// `cs-document` layout). Read-only, print-styled. Its CORE (vendors / line items / computed totals /
// letterhead / approval roles) is SERVER data (props, adapter-computed — R7); the buyer-authored
// overlays (evaluation, procurement purpose, wet-ink signatory names) come from the shared provider so
// edits made in the workspace flow through to the printable document.
//
// GOVERNANCE: every evaluative section is buyer-authored (R6, † provenance) — the platform computes
// arithmetic only and recommends no winner; the lowest figure is disclosed as arithmetic, never a
// recommendation. "Draft Reference" only (no `CS-` series — ESC-CS-REF). Signatures are wet-ink; nothing
// is captured digitally. Line-item data is indicative until ESC-CS-LINEITEMS.

import { Fragment } from "react";
import { formatDate } from "@/frontend/components/format";
import type { MoneyValue } from "@/frontend/components/format";
import { useComparisonWorkspace } from "../comparison-workspace/comparison-workspace-state";
import type { ComparisonWorkspaceData } from "../comparison-workspace/workspace-view-models";
import type {
  CsApprovalBlock,
  CsBuyerEvaluation,
  CsLineItem,
  CsVendor,
} from "../comparative-statement/cs-view-models";
import { composeDocumentPages, type ComparisonDocumentPage } from "./document-page-composer";

const DAGGER = "†";

function amt(value: MoneyValue | undefined): string {
  if (!value) return "—";
  return value.amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function CdSheet({
  page,
  orgName,
  humanRef,
  children,
}: {
  page: ComparisonDocumentPage;
  orgName: string;
  humanRef?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="cd-sheet-scroll">
      <div className="cd-sheet">
        <div className="cd-body">{children}</div>
        <div className="cd-foot">
          <span>
            {orgName}
            {humanRef ? ` · ${humanRef}` : ""} · Comparative Statement (Draft)
          </span>
          <span className="cd-foot-pg">
            Page {page.pageNumber} of {page.pageCount}
          </span>
        </div>
      </div>
    </div>
  );
}

function CompactHead({ orgName, humanRef }: { orgName: string; humanRef?: string }) {
  return (
    <div className="cd-letterhead" style={{ paddingBottom: "2mm" }}>
      <span className="cd-org-name" style={{ fontSize: "10pt" }}>
        {orgName}
      </span>
      <span className="cd-doc-title" style={{ fontSize: "10pt" }}>
        Comparative Statement {humanRef ? `· ${humanRef}` : ""}
      </span>
    </div>
  );
}

function ItemsTable({
  vendors,
  items,
  withTotals,
  data,
}: {
  vendors: CsVendor[];
  items: CsLineItem[];
  withTotals: boolean;
  data: ComparisonWorkspaceData;
}) {
  const { computed } = data.statement;
  const totalRow = (label: string, values: MoneyValue[], className: string) => (
    <tr className={className}>
      <td colSpan={5} style={{ textAlign: "right", fontWeight: 700 }}>
        {label}
      </td>
      {vendors.map((v, vi) => (
        <td key={v.quotationId} colSpan={2} className="cd-num">
          {amt(values[vi])}
        </td>
      ))}
      <td />
    </tr>
  );

  return (
    <table className="cd-items">
      <thead>
        <tr>
          <th rowSpan={2} style={{ width: "3%" }}>
            Sl
          </th>
          <th rowSpan={2} style={{ width: "16%", textAlign: "left" }}>
            Item Description
          </th>
          <th rowSpan={2} style={{ width: "11%", textAlign: "left" }}>
            Specification
          </th>
          <th rowSpan={2} style={{ width: "4%" }}>
            Unit
          </th>
          <th rowSpan={2} style={{ width: "5%" }}>
            Qty
          </th>
          {vendors.map((v) => (
            <th key={v.quotationId} colSpan={2}>
              {v.vendorName}
            </th>
          ))}
          <th rowSpan={2} style={{ width: "6%" }}>
            Lowest Unit ({data.currency})
          </th>
        </tr>
        <tr>
          {vendors.map((v) => (
            <Fragment key={v.quotationId}>
              <th>Unit Price</th>
              <th>Total Price</th>
            </Fragment>
          ))}
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.sl}>
            <td className="cd-num">{item.sl}</td>
            <td>{item.description}</td>
            <td>{item.specification ?? "—"}</td>
            <td style={{ textAlign: "center" }}>{item.unit}</td>
            <td className="cd-num">{item.quantity.toLocaleString("en-US")}</td>
            {vendors.map((v, vi) => {
              const cell = item.cells[vi];
              if (cell?.sealed) {
                return (
                  <td key={v.quotationId} colSpan={2} style={{ color: "var(--cd-muted)" }}>
                    Sealed until close
                  </td>
                );
              }
              const low = item.lowestVendorIdx?.includes(vi) ? " cd-low" : "";
              return (
                <Fragment key={v.quotationId}>
                  <td className={`cd-num${low}`}>{amt(cell?.unitPrice)}</td>
                  <td className={`cd-num${low}`}>{amt(cell?.totalPrice)}</td>
                </Fragment>
              );
            })}
            <td className="cd-num cd-low">{amt(item.lowestUnitPrice)}</td>
          </tr>
        ))}
        {withTotals ? (
          <>
            {totalRow(`Sub Total (${data.currency})`, computed.subTotals, "cd-total")}
            {totalRow(`VAT (${computed.vatRatePct}%)`, computed.vatAmounts, "cd-total")}
            {totalRow(`Grand Total (${data.currency})`, computed.grandTotals, "cd-grand")}
          </>
        ) : null}
      </tbody>
    </table>
  );
}

function Signatures({ approvals }: { approvals: CsApprovalBlock[] }) {
  return (
    <div className="cd-sign-grid">
      {approvals.map((a) => (
        <div className="cd-sign" key={a.role}>
          <div className="cd-sign-role">{a.role}</div>
          <div className="cd-sign-space" />
          <div className="cd-sign-line">
            <div className="cd-sign-name">{a.name ?? " "}</div>
            <div className="cd-sign-title">{a.title ?? " "}</div>
            <div className="cd-sign-title">Date: ____________</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CoverBody({
  data,
  purpose,
  evaluation,
  approvals,
}: {
  data: ComparisonWorkspaceData;
  purpose: string;
  evaluation: CsBuyerEvaluation | undefined;
  approvals: CsApprovalBlock[];
}) {
  const { statement } = data;
  const { computed, vendors, letterhead } = statement;
  const lowest = vendors[computed.lowestVendorIdx];
  return (
    <>
      <div className="cd-letterhead">
        <div style={{ minWidth: 0 }}>
          <div className="cd-org-name">{letterhead.name}</div>
          {letterhead.tagline ? <div className="cd-org-line">{letterhead.tagline}</div> : null}
          <div className="cd-org-line">{letterhead.addressLine}</div>
          {letterhead.contactLine ? (
            <div className="cd-org-line">{letterhead.contactLine}</div>
          ) : null}
        </div>
        <div className="cd-title-block">
          <div className="cd-doc-title">COMPARATIVE STATEMENT</div>
          <div className="cd-draft-chip">DRAFT — FOR APPROVAL</div>
        </div>
      </div>

      <div className="cd-two-col">
        <div className="cd-col">
          <div className="cd-h">Statement details</div>
          <table className="cd-kv">
            <tbody>
              <tr>
                <th scope="row">Draft Reference</th>
                <td>{data.draftReference}</td>
              </tr>
              <tr>
                <th scope="row">RFQ No.</th>
                <td>{data.humanRef ?? "—"}</td>
              </tr>
              <tr>
                <th scope="row">Purpose</th>
                <td>{purpose}</td>
              </tr>
              {data.project ? (
                <tr>
                  <th scope="row">Project / Dept.</th>
                  <td>{data.project}</td>
                </tr>
              ) : null}
              <tr>
                <th scope="row">Issue Date</th>
                <td>{formatDate(data.issueDate)}</td>
              </tr>
              <tr>
                <th scope="row">Currency</th>
                <td>{data.currency}</td>
              </tr>
              <tr>
                <th scope="row">Prepared By</th>
                <td>{statement.preparedByLabel}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="cd-col">
          <div className="cd-h">Commercial summary</div>
          <table className="cd-kv">
            <tbody>
              <tr>
                <th scope="row">Vendors compared</th>
                <td>{vendors.length}</td>
              </tr>
              <tr>
                <th scope="row">Line items</th>
                <td>{computed.totalItems}</td>
              </tr>
              <tr>
                <th scope="row">Lowest grand total</th>
                <td>
                  {lowest?.vendorName} — {data.currency}{" "}
                  {amt(computed.grandTotals[computed.lowestVendorIdx])}
                  <span className="cd-prov"> (arithmetic — not a recommendation)</span>
                </td>
              </tr>
              {computed.differenceAmount ? (
                <tr>
                  <th scope="row">Difference vs. next</th>
                  <td>
                    {data.currency} {amt(computed.differenceAmount)}
                    {computed.differencePct ? ` · ${computed.differencePct}` : ""}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <div className="cd-h">Participating vendors</div>
      <table className="cd-data">
        <thead>
          <tr>
            <th style={{ width: "6mm" }}>#</th>
            <th style={{ textAlign: "left" }}>Vendor</th>
            <th>Quotation Ref.</th>
            <th>Received</th>
            <th>Delivery Offer</th>
          </tr>
        </thead>
        <tbody>
          {vendors.map((v, i) => (
            <tr key={v.quotationId}>
              <td className="cd-num">{i + 1}</td>
              <td style={{ fontWeight: 700 }}>{v.vendorName}</td>
              <td>{v.quotationRef ?? "—"}</td>
              <td>{v.receivedAt ? formatDate(v.receivedAt) : "—"}</td>
              <td>{v.deliveryOffer ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {evaluation?.executiveSummary ? (
        <>
          <div className="cd-h">
            Executive summary <span className="cd-prov">{DAGGER} buyer-authored</span>
          </div>
          <p style={{ margin: 0 }}>{evaluation.executiveSummary}</p>
        </>
      ) : null}

      <div className="cd-h">Approval</div>
      <Signatures approvals={approvals} />
      <p className="cd-prov">
        Signatures are executed on the printed document. The platform captures no digital signature.
      </p>
    </>
  );
}

function FinalBody({
  data,
  evaluation,
  approvals,
}: {
  data: ComparisonWorkspaceData;
  evaluation: CsBuyerEvaluation | undefined;
  approvals: CsApprovalBlock[];
}) {
  const { statement } = data;
  const { computed, vendors } = statement;
  const recommended =
    evaluation?.recommendedVendorIdx !== undefined
      ? vendors[evaluation.recommendedVendorIdx]
      : undefined;
  return (
    <>
      <div className="cd-h">
        Buyer Evaluation Summary <span className="cd-prov">{DAGGER} buyer-authored</span>
      </div>
      {evaluation ? (
        <table className="cd-data">
          <thead>
            <tr>
              <th style={{ width: "10mm" }}>#</th>
              <th style={{ textAlign: "left" }}>Vendor</th>
              <th>Grand Total ({data.currency})</th>
              <th style={{ textAlign: "left" }}>Technical</th>
              <th>Delivery</th>
            </tr>
          </thead>
          <tbody>
            {evaluation.evaluationOrder.map((row, i) => {
              const vendor = vendors[row.vendorIdx];
              const isRecommended = evaluation.recommendedVendorIdx === row.vendorIdx;
              return (
                <tr
                  key={vendor.quotationId}
                  style={isRecommended ? { background: "var(--cd-low-bg)" } : undefined}
                >
                  <td className="cd-num">{i + 1}</td>
                  <td style={isRecommended ? { fontWeight: 700 } : undefined}>
                    {vendor.vendorName}
                  </td>
                  <td className="cd-num">{amt(computed.grandTotals[row.vendorIdx])}</td>
                  <td>{row.technical ?? "—"}</td>
                  <td>{vendor.deliveryOffer ?? "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p className="cd-prov">
          No buyer evaluation has been recorded. Add an assessment in the workspace to populate this
          section.
        </p>
      )}
      <p className="cd-prov">
        <b>{DAGGER}</b> Confirmed by the buyer&apos;s procurement team from the computed totals and
        its own technical assessment. The platform does not rank vendors or recommend a winner.
      </p>

      {recommended ? (
        <>
          <div className="cd-h">
            Recommendation <span className="cd-prov">{DAGGER} buyer-authored</span>
          </div>
          <table className="cd-kv">
            <tbody>
              <tr>
                <th scope="row">Recommended vendor</th>
                <td style={{ fontWeight: 700, color: "var(--cd-low-ink)" }}>
                  {recommended.vendorName}
                </td>
              </tr>
              {evaluation?.reasons?.length ? (
                <tr>
                  <th scope="row">Reasons</th>
                  <td>
                    {evaluation.reasons.map((r) => (
                      <div key={r}>• {r}</div>
                    ))}
                  </td>
                </tr>
              ) : null}
              {evaluation?.risk ? (
                <tr>
                  <th scope="row">Risk assessment</th>
                  <td>{evaluation.risk}</td>
                </tr>
              ) : null}
              {evaluation?.commercialAdvantage ? (
                <tr>
                  <th scope="row">Commercial position</th>
                  <td>{evaluation.commercialAdvantage}</td>
                </tr>
              ) : null}
              {evaluation?.remarks ? (
                <tr>
                  <th scope="row">Remarks</th>
                  <td>{evaluation.remarks}</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </>
      ) : null}

      <div className="cd-h">Procurement Committee Approval</div>
      <Signatures approvals={approvals} />
    </>
  );
}

export function ComparisonDocument({ data }: { data: ComparisonWorkspaceData }) {
  const { toBuyerEvaluation, procurementPurpose, signatoryNames } = useComparisonWorkspace();
  const { statement } = data;
  const evaluation = toBuyerEvaluation(statement.vendors);
  const purpose = procurementPurpose.trim() || data.rfqTitle;

  // Wet-ink signature blocks: roles from the frozen approval set, names/titles from the buyer's
  // session-local overrides (blank by default — nothing is pre-filled or captured).
  const approvals: CsApprovalBlock[] = statement.approvals.map((block) => ({
    role: block.role,
    name: signatoryNames[block.role]?.name?.trim() || undefined,
    title: signatoryNames[block.role]?.title?.trim() || undefined,
  }));

  const pages = composeDocumentPages(statement.items);

  return (
    <div className="cd-scope">
      <div className="cd-sheet-list">
        {pages.map((page) => (
          <CdSheet
            key={`${page.kind}-${page.pageNumber}`}
            page={page}
            orgName={statement.letterhead.name}
            humanRef={data.humanRef}
          >
            {page.kind === "cover" ? (
              <CoverBody
                data={data}
                purpose={purpose}
                evaluation={evaluation}
                approvals={approvals}
              />
            ) : null}
            {page.kind === "items" ? (
              <>
                <CompactHead orgName={statement.letterhead.name} humanRef={data.humanRef} />
                <div className="cd-h">
                  Item comparison — items {page.fromSl}–{page.toSl}
                  {page.withTotals ? " · totals" : ""}
                </div>
                <ItemsTable
                  vendors={statement.vendors}
                  items={page.items}
                  withTotals={page.withTotals}
                  data={data}
                />
                <p className="cd-prov">
                  <span className="cd-swatch" /> Lowest quoted unit price per item (arithmetic
                  identification — not a recommendation).
                </p>
              </>
            ) : null}
            {page.kind === "final" ? (
              <>
                <CompactHead orgName={statement.letterhead.name} humanRef={data.humanRef} />
                <FinalBody data={data} evaluation={evaluation} approvals={approvals} />
              </>
            ) : null}
          </CdSheet>
        ))}
      </div>
    </div>
  );
}
