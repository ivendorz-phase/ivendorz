// Buyer Workspace — SealedMarker (Tier-2). The single INLINE "sealed until window close" cell marker,
// shared by every buyer surface that renders a value the server sealed for anti-farming (Doc-3 §10.1 /
// §12.2 `abuse.sealed_until_close`): P-BUY-14 quotation detail (summary amount) and P-BUY-15 comparison
// matrix (price + protected-commercial-term cells). It frames the absence as a deliberate, time-bound
// redaction — NEVER a vendor deficiency. The lock icon is decorative (`aria-hidden`); the text carries the
// meaning. Extracted to one source so the governance-sensitive copy can never drift between surfaces.
//
// (The block-level `SealedNotice` used inside P-BUY-14's section cards is a different shape and stays local.)

import { Lock } from "lucide-react";

export function SealedMarker() {
  return (
    <span className="inline-flex items-center gap-1 text-muted-foreground">
      <Lock aria-hidden className="size-3.5" />
      Sealed until close
    </span>
  );
}
