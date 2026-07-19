// Vendor Workspace — Support Tickets route (VX-03). Thin composition-only page. Allowlisted `?status=`
// filter over the frozen support-ticket status machine (anything unrecognized ⇒ All).
import type { Metadata } from "next";
import {
  SupportView,
  SUPPORT_STATUSES,
  type SupportStatus,
} from "../../../_components/vendor/support/support-view";

export const metadata: Metadata = { title: "Support Tickets" };

export default async function SupportPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const activeStatus = SUPPORT_STATUSES.includes(status as SupportStatus)
    ? (status as SupportStatus)
    : undefined;
  return <SupportView activeStatus={activeStatus} />;
}
