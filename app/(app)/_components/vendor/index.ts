// Vendor Workspace presentation components (Team 3, Milestone 1 — shell + navigation).
//
// Reusable and route-group-agnostic. These compose the FROZEN Doc-7B kit only and own no data,
// no fetch, no permission logic (presentation phase). A real `(app)`-group layout will mount
// <VendorWorkspaceShell> in the integration phase, once [ESC-7G-A7] (Hybrid IA / `(vendor)`
// route-group name) is ratified by the human Board and the Build Roadmap opens Wave 3.
export { VendorWorkspaceShell, type VendorWorkspaceShellProps } from "./vendor-workspace-shell";
export { VendorWorkspaceSkeleton } from "./vendor-workspace-skeleton";
export { VendorContentSkeleton } from "./vendor-content-skeleton";
export {
  WorkspaceSectionPlaceholder,
  type WorkspaceSectionPlaceholderProps,
} from "./workspace-section-placeholder";
export {
  VendorTopbar,
  type VendorTopbarProps,
  type VendorTopbarOrg,
  type VendorParticipation,
} from "./vendor-topbar";
export { VendorSidebarNav, type VendorSidebarNavProps } from "./vendor-sidebar-nav";
export { VendorMobileNav, type VendorMobileNavProps } from "./vendor-mobile-nav";
export { VendorBottomBar, type VendorBottomBarProps } from "./vendor-bottom-bar";
export {
  VendorBreadcrumbs,
  type VendorBreadcrumbItem,
  type VendorBreadcrumbsProps,
} from "./vendor-breadcrumbs";
export {
  ShellSlotPlaceholder,
  LocaleTogglePlaceholder,
  type ShellSlotPlaceholderProps,
} from "./vendor-shell-slot";
export {
  VENDOR_NAV,
  VENDOR_QUICKBAR,
  resolveActiveHref,
  type VendorNavItem,
  type VendorNavGroup,
} from "./vendor-nav";
