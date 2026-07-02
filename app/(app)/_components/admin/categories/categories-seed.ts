// Category taxonomy — presentation SEED (P-ADM-08 · Doc-7H · J-ADM-03 · `set_category_status`). A curated
// mock of the admin-governed category tree standing in for the unwired read — NOT data, coins nothing. The
// taxonomy is Admin-GOVERNED: vendors PROPOSE categories but Admin governs the canonical tree; the OWNING
// module owns the effect (R5 — `marketplace.set_category_status.v1` = Approve / Retire, Doc-4D). Status is the
// FROZEN category lifecycle `draft → active → retired` (Doc-2 §3.3) — a taxonomy-visibility state, NOT a
// governance signal (no Trust/Performance/Tier here — firewall). Fields bind only to frozen `categories`
// attributes: `slug` (the human ref) — NOT a coined code; `is_specialized` is a `category_assignments` flag
// (Doc-2 §10.3), never a category attribute, so it is absent here. No fabricated vendor/product counts
// (GI-03). Rows are pre-ordered depth-first (a child always follows its parent) so a flat table can render
// the hierarchy via `depth` indentation without a total.
import type { StatusTone } from "@/frontend/components/status-chip";

// Frozen `categories` lifecycle (Doc-2 §3.3). `set_category_status` moves draft→active (Approve) and
// active→retired (Retire); retired is terminal-for-discovery (excluded from search).
export type CategoryStatus = "draft" | "active" | "retired";

export interface CategoryVM {
  id: string;
  /** Frozen human ref for a category (Doc-2 `categories.slug`) — display only. */
  slug: string;
  name: string;
  /** Parent category name for the path subtext; null for a root node. */
  parent: string | null;
  /** Tree depth (0 = root, 1 = sub) — drives the name-cell indentation only. */
  depth: number;
  status: CategoryStatus;
}

export const CATEGORY_STATUS_META: Record<CategoryStatus, { label: string; tone: StatusTone }> = {
  draft: { label: "Draft", tone: "warning" },
  active: { label: "Active", tone: "success" },
  retired: { label: "Retired", tone: "neutral" },
};

// Depth-first ordering: each child directly follows its parent so the table reads as a tree.
export const CATEGORIES: CategoryVM[] = [
  {
    id: "cat-fab",
    slug: "fabrication-machining",
    name: "Fabrication & Machining",
    parent: null,
    depth: 0,
    status: "active",
  },
  {
    id: "cat-fab-cnc",
    slug: "cnc-machining",
    name: "CNC Machining",
    parent: "Fabrication & Machining",
    depth: 1,
    status: "active",
  },
  {
    id: "cat-fab-weld",
    slug: "structural-welding",
    name: "Structural Welding",
    parent: "Fabrication & Machining",
    depth: 1,
    status: "active",
  },
  {
    id: "cat-valve",
    slug: "valves-fittings",
    name: "Valves & Fittings",
    parent: null,
    depth: 0,
    status: "active",
  },
  {
    id: "cat-valve-control",
    slug: "control-valves",
    name: "Control Valves",
    parent: "Valves & Fittings",
    depth: 1,
    status: "active",
  },
  {
    id: "cat-elec",
    slug: "electrical-drives",
    name: "Electrical & Drives",
    parent: null,
    depth: 0,
    status: "active",
  },
  {
    id: "cat-elec-vfd",
    slug: "variable-frequency-drives",
    name: "Variable Frequency Drives",
    parent: "Electrical & Drives",
    depth: 1,
    status: "draft",
  },
  {
    id: "cat-bearing",
    slug: "bearings-power-transmission",
    name: "Bearings & Power Transmission",
    parent: null,
    depth: 0,
    status: "active",
  },
  {
    id: "cat-instr",
    slug: "instrumentation",
    name: "Instrumentation",
    parent: null,
    depth: 0,
    status: "active",
  },
  {
    id: "cat-safety",
    slug: "safety-ppe",
    name: "Safety & PPE",
    parent: null,
    depth: 0,
    status: "active",
  },
  {
    id: "cat-lube",
    slug: "lubricants",
    name: "Lubricants",
    parent: null,
    depth: 0,
    status: "draft",
  },
  {
    id: "cat-legacy-couplings",
    slug: "mechanical-couplings-legacy",
    name: "Mechanical Couplings (legacy)",
    parent: null,
    depth: 0,
    status: "retired",
  },
];
