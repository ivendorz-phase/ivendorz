// Vendor approval — presentation SEED (P-ADM-07 · Doc-7H · J-ADM-03 · `set_vendor_profile_status`). Curated
// mock vendor-profile approval requests standing in for the unwired read — NOT data, coins nothing. Approval
// sets the vendor PROFILE STATUS (claim lifecycle + visibility, Invariant #3) — it is NOT a trust/performance
// score or a financial tier (that stays M5, verification is a separate surface, P-ADM-12/13). Admin decides;
// M2 owns the effect (R5). No governance signal; no fabricated total.
import type { StatusTone } from "@/frontend/components/status-chip";

export type VendorApprovalStatus = "pending" | "approved" | "rejected";

export interface VendorApprovalVM {
  id: string;
  ref: string;
  name: string;
  category: string;
  location: string;
  /** Claim lifecycle (Invariant #3) — claimed vs unclaimed record. */
  claim: "Claimed" | "Unclaimed";
  submitted: string;
  status: VendorApprovalStatus;
}

export const VENDOR_APPROVAL_STATUS_META: Record<
  VendorApprovalStatus,
  { label: string; tone: StatusTone }
> = {
  pending: { label: "Pending", tone: "warning" },
  approved: { label: "Approved", tone: "success" },
  rejected: { label: "Rejected", tone: "neutral" },
};

export const VENDOR_APPROVALS: VendorApprovalVM[] = [
  {
    id: "vnd-00042",
    ref: "VND-2026-00042",
    name: "Rupsha Engineering Works",
    category: "Fabrication & Machining",
    location: "Khulna",
    claim: "Claimed",
    submitted: "2h ago",
    status: "pending",
  },
  {
    id: "vnd-00041",
    ref: "VND-2026-00041",
    name: "Bay Valves & Controls",
    category: "Valves & Fittings",
    location: "Chattogram",
    claim: "Claimed",
    submitted: "5h ago",
    status: "pending",
  },
  {
    id: "vnd-00040",
    ref: "VND-2026-00040",
    name: "Green Power Solutions",
    category: "Electrical & Drives",
    location: "Dhaka",
    claim: "Unclaimed",
    submitted: "1d ago",
    status: "pending",
  },
  {
    id: "vnd-00039",
    ref: "VND-2026-00039",
    name: "Sundarban Safety",
    category: "Safety & PPE",
    location: "Khulna",
    claim: "Claimed",
    submitted: "1d ago",
    status: "approved",
  },
  {
    id: "vnd-00038",
    ref: "VND-2026-00038",
    name: "Meghna Bearings",
    category: "Bearings & Power Transmission",
    location: "Narayanganj",
    claim: "Claimed",
    submitted: "2d ago",
    status: "pending",
  },
  {
    id: "vnd-00037",
    ref: "VND-2026-00037",
    name: "Padma Lubricants",
    category: "Lubricants",
    location: "Dhaka",
    claim: "Unclaimed",
    submitted: "3d ago",
    status: "rejected",
  },
  {
    id: "vnd-00036",
    ref: "VND-2026-00036",
    name: "Titas Instrumentation",
    category: "Instrumentation",
    location: "Gazipur",
    claim: "Claimed",
    submitted: "4d ago",
    status: "approved",
  },
];
