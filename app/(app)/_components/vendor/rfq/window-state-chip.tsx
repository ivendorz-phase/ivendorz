// Vendor Workspace — window-state chip re-export shim. PROMOTED to the Doc-7B kit (Shared Platform
// Component Registry §4.2 CTO override — 2026-07-03): `@/frontend/components/rfq` is now the single
// canonical implementation. Kept as a re-export so existing vendor imports (`./window-state-chip`)
// continue to resolve unchanged — zero behavior change. New code should import from the kit directly.
export { WindowStateChip, type WindowStateChipProps } from "@/frontend/components/rfq";
