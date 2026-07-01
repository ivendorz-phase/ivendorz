// Bans — presentation SEED (P-ADM-05 · Doc-7H · J-ADM-04 ban reads). Curated mock platform bans standing in
// for the unwired read — NOT data, coins nothing. IMPORTANT: these are PLATFORM bans (M8 enforcement — the
// `VendorBanned` stream), admin-visible by design. They are NOT the buyer-private blacklist — Invariant #11
// (private exclusion stays private, undetectable) governs the M4 buyer CRM, never this admin enforcement
// register. No governance signal (Trust/Performance/Tier); no fabricated total. Issue/lift happen in the ban
// detail (P-ADM-06) under a wired command — Admin decides, the owning module owns the effect (R5).
import type { StatusTone } from "@/frontend/components/status-chip";

export type BanStatus = "active" | "lifted" | "expired";

export interface BanVM {
  id: string;
  ref: string;
  /** Banned party display name. */
  subject: string;
  subjectType: "Vendor" | "User" | "Organization";
  reason: string;
  /** Enforcement scope. */
  scope: "Platform" | "Marketplace" | "RFQ";
  issuedBy: string;
  /** Expiry date, "Permanent", or "—" when lifted. */
  expiry: string;
  status: BanStatus;
}

export const BAN_STATUS_META: Record<BanStatus, { label: string; tone: StatusTone }> = {
  active: { label: "Active", tone: "danger" },
  lifted: { label: "Lifted", tone: "neutral" },
  expired: { label: "Expired", tone: "neutral" },
};

export const BANS: BanVM[] = [
  {
    id: "ban-00007",
    ref: "BAN-2026-00007",
    subject: "Rangpur Traders",
    subjectType: "Vendor",
    reason: "Repeated policy violations",
    scope: "Platform",
    issuedBy: "S. Akter",
    expiry: "Permanent",
    status: "active",
  },
  {
    id: "ban-00006",
    ref: "BAN-2026-00006",
    subject: "Delta Engineering Ltd.",
    subjectType: "Vendor",
    reason: "Fabricated certifications",
    scope: "Marketplace",
    issuedBy: "A. Rahman",
    expiry: "2026-12-31",
    status: "active",
  },
  {
    id: "ban-00005",
    ref: "BAN-2026-00005",
    subject: "quick-supply-bd",
    subjectType: "User",
    reason: "Fraudulent listings",
    scope: "Platform",
    issuedBy: "S. Akter",
    expiry: "Permanent",
    status: "active",
  },
  {
    id: "ban-00004",
    ref: "BAN-2026-00004",
    subject: "Coastal Chemicals",
    subjectType: "Vendor",
    reason: "Spam RFQ submissions",
    scope: "RFQ",
    issuedBy: "A. Rahman",
    expiry: "2026-03-15",
    status: "expired",
  },
  {
    id: "ban-00003",
    ref: "BAN-2026-00003",
    subject: "Hilltop Fabricators",
    subjectType: "Vendor",
    reason: "Unresolved conduct report",
    scope: "Marketplace",
    issuedBy: "S. Akter",
    expiry: "—",
    status: "lifted",
  },
  {
    id: "ban-00002",
    ref: "BAN-2026-00002",
    subject: "m.karim",
    subjectType: "User",
    reason: "Abusive conduct",
    scope: "Platform",
    issuedBy: "A. Rahman",
    expiry: "2026-02-01",
    status: "expired",
  },
  {
    id: "ban-00001",
    ref: "BAN-2026-00001",
    subject: "Northern Steel Co.",
    subjectType: "Organization",
    reason: "Impersonation of a verified vendor",
    scope: "Platform",
    issuedBy: "S. Akter",
    expiry: "Permanent",
    status: "active",
  },
];
