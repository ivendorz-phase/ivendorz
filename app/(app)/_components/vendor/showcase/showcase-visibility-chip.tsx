// Visibility chip for a showcase project. Binds the FROZEN interim `is_visible` boolean — the
// showcase aggregate has NO status enum (Doc-6D Pass3:47 refused to coin one), so this maps a
// boolean, never a state machine. Label text always present; never colour-alone. RSC-friendly.
import { StatusChip } from "@/frontend/components/status-chip";

export function ShowcaseVisibilityChip({ isVisible }: { isVisible?: boolean }) {
  return isVisible ? (
    <StatusChip label="Published" tone="success" />
  ) : (
    <StatusChip label="Draft" tone="neutral" />
  );
}
