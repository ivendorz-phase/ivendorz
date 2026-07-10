// Identity ops (users) — presentation SEED (P-ADM-26 · Doc-7H · J-ADM-06). A curated mock of the admin user
// worklist standing in for the unwired read — NOT data, coins nothing. CROSS-MODULE BOUNDARY: users are owned
// by M1/Identity (platform-owned, personal-data rules apply); Admin (M8) DECIDES a governance action but
// IDENTITY OWNS THE EFFECT (R5) — Admin never bypasses the Identity domain. The mutation is
// `identity.set_user_account_status.v1` (suspend/reinstate), 21.6 Admin, no active-org context (§5.6), authz
// `staff_super_admin` (interim, DC-3). Fields bind to frozen `users` (Doc-2:260): login identity (name/email)
// + `status`; `soft_deleted` is anonymizable-on-departure (terminal). FIREWALL: identity touches no governance
// signal — no score here. No fabricated total (GI-03).
import type { StatusTone } from "@/frontend/components/status-chip";

// Frozen `users` status (Doc-2:260): active / suspended / soft_deleted (anonymizable on departure).
export type UserStatus = "active" | "suspended" | "soft_deleted";

export interface UserOpsVM {
  id: string;
  name: string;
  /** Login identity (email). Absent for an anonymized (soft-deleted) account. */
  email: string | null;
  status: UserStatus;
}

export const USER_STATUS_META: Record<UserStatus, { label: string; tone: StatusTone }> = {
  active: { label: "Active", tone: "success" },
  suspended: { label: "Suspended", tone: "warning" },
  soft_deleted: { label: "Soft-deleted", tone: "neutral" },
};

export const USER_OPS: UserOpsVM[] = [
  {
    id: "usr-004181",
    name: "A. Rahman",
    email: "a.rahman@rupsha-eng.com.bd",
    status: "active",
  },
  {
    id: "usr-004176",
    name: "S. Akter",
    email: "s.akter@deltafab.com.bd",
    status: "active",
  },
  {
    id: "usr-004170",
    name: "M. Hasan",
    email: "m.hasan@meghna-buyers.com.bd",
    status: "active",
  },
  {
    id: "usr-004163",
    name: "K. Chowdhury",
    email: "k.chowdhury@bayvalves.com.bd",
    status: "suspended",
  },
  {
    id: "usr-004155",
    name: "N. Islam",
    email: "n.islam@padma-procure.com.bd",
    status: "active",
  },
  {
    id: "usr-004148",
    name: "R. Karim",
    email: "r.karim@titas-instr.com.bd",
    status: "suspended",
  },
  {
    id: "usr-004139",
    name: "Anonymized user",
    email: null,
    status: "soft_deleted",
  },
];
