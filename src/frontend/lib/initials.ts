// Presentation helper — up-to-2-char initials for an avatar fallback. Kit-level (importable from any
// app-layer surface) so the authenticated shell (`app/(app)/_components/shell`) and the public header
// (`app/(public)/_components/account-affordance`) derive initials from ONE implementation rather than
// each re-implementing it. Pure, presentation-only; coins nothing.
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
