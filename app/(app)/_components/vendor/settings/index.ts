// Vendor Settings composition (Team 3, FE-VEN-12, P-ACC-02/03/15). This feature folder holds ONLY
// the tab-composition adapter — the actual content is the existing, unmodified Account components
// (`app/(app)/account/profile|security|notifications`), imported directly by the route. No content
// component is duplicated here (Board ruling 2026-07-03, Option B — composition only, forking an
// Account page is Flag-and-Halt). `P-ACC-13` Workflow Settings is deliberately NOT composed here —
// scoped out per the Board's §6.1 ruling, carried forward.
export { SettingsTabs, type SettingsTabsProps } from "./settings-tabs";
