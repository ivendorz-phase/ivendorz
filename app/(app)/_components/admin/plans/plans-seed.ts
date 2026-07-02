// Plans — presentation SEED (P-ADM-22 · Doc-7H · J-ADM-06 · `billing.list_plans`). A curated mock of the
// commercial plan catalog standing in for the unwired read — NOT data, coins nothing. `plans` are owned by
// M7/Billing (BC-BILL-1), platform-owned, "marketing configuration" with lifecycle `draft → active → retired`
// (Doc-2 §3.8). A Plan (COMMERCIAL) is NOT a Financial Tier (CAPABILITY) — Invariant #10; and entitlements
// resolve as boolean/numeric/enum, NEVER plan-name checks (Invariant #10) — no plan-name gating is expressed
// here. Fields bind to the frozen `plans` (Doc-2:823): `name`, `billing_cycle(monthly/annual)`, `price`,
// `currency`, `is_active` (marketing-VISIBILITY, distinct from the lifecycle `status`). No fabricated total
// (GI-03).
import type { StatusTone } from "@/frontend/components/status-chip";

// Frozen `plans` lifecycle (Doc-2 §3.8).
export type PlanStatus = "draft" | "active" | "retired";
export type BillingCycle = "monthly" | "annual";

export interface PlanVM {
  /** `plans.id` — opaque platform id (no human_ref); display only. */
  id: string;
  name: string;
  billingCycle: BillingCycle;
  price: number;
  /** Currency stored per value field (multi-currency-ready; BDT today). */
  currency: string;
  /** `plans.is_active` — marketing VISIBILITY, distinct from the lifecycle `status`. */
  isVisible: boolean;
  status: PlanStatus;
}

export const PLAN_STATUS_META: Record<PlanStatus, { label: string; tone: StatusTone }> = {
  draft: { label: "Draft", tone: "warning" },
  active: { label: "Active", tone: "success" },
  retired: { label: "Retired", tone: "neutral" },
};

export const BILLING_CYCLE_SUFFIX: Record<BillingCycle, string> = {
  monthly: "/mo",
  annual: "/yr",
};

/** Format a plan price for display (currency + amount + cycle suffix). */
export function formatPlanPrice(plan: PlanVM): string {
  const amount = plan.price.toLocaleString("en-US");
  return `${plan.currency} ${amount} ${BILLING_CYCLE_SUFFIX[plan.billingCycle]}`;
}

export const PLANS: PlanVM[] = [
  {
    id: "plan-basic",
    name: "Basic",
    billingCycle: "monthly",
    price: 0,
    currency: "BDT",
    isVisible: true,
    status: "active",
  },
  {
    id: "plan-growth",
    name: "Growth",
    billingCycle: "monthly",
    price: 5000,
    currency: "BDT",
    isVisible: true,
    status: "active",
  },
  {
    id: "plan-professional",
    name: "Professional",
    billingCycle: "monthly",
    price: 12000,
    currency: "BDT",
    isVisible: true,
    status: "active",
  },
  {
    id: "plan-professional-annual",
    name: "Professional (Annual)",
    billingCycle: "annual",
    price: 120000,
    currency: "BDT",
    isVisible: true,
    status: "active",
  },
  {
    id: "plan-enterprise",
    name: "Enterprise",
    billingCycle: "annual",
    price: 480000,
    currency: "BDT",
    isVisible: false,
    status: "draft",
  },
  {
    id: "plan-starter-legacy",
    name: "Starter (legacy)",
    billingCycle: "monthly",
    price: 3000,
    currency: "BDT",
    isVisible: false,
    status: "retired",
  },
];
