// Platform shell — the Shared Authenticated Shell (Doc-7C realization · IA §3/§4). PLATFORM-owned
// presentation components every authenticated `(app)` surface composes. Wires nothing (presentation
// only); fed by a typed ShellViewModel whose live resolution (Doc-7C SR3/SR5) is deferred.
export { AppShell } from "./app-shell";
export { Topbar } from "./topbar";
export { Sidebar } from "./sidebar";
export { MobileNav } from "./mobile-nav";
export { OrgSwitcher } from "./org-switcher";
export { NotificationCenter } from "./notification-center";
export { UserMenu } from "./user-menu";
export { QuickCreate } from "./quick-create";
export { PageHeader } from "./page-header";
export { Breadcrumbs } from "./breadcrumbs";
export { BottomBar } from "./bottom-bar";
export { composeNav } from "./hybrid-nav";
export * from "./types";
export * from "./icons";
