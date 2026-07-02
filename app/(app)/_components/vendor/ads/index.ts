// Vendor Ads presentation components (P-VND-12/13/14; Doc-4D PassB Part D §D7.4).
// Presentation-only, reusable; composes the FROZEN Doc-7B kit + platform shell + reuses vendor
// shared atoms (DescriptionList, PresentationFormNote). Typed props bind ONLY real frozen fields
// (Doc-2 §5.8/§10.746-749, Doc-4D PassB Part D) — zero contract invention. Firewall: ads never
// carry a governance signal (Doc-4D §B.11/§18.3).
export { AdList, type AdListProps } from "./ad-list";
export { AdForm } from "./ad-form";
export { AdDetailPanel, type AdDetailPanelProps } from "./ad-detail-panel";
export { AdStatusChip, AD_PLACEMENT_LABEL } from "./ad-status-chip";
export type { AdStatus, AdPlacement, AdScheduleView, AdListItemView, AdView } from "./types";
