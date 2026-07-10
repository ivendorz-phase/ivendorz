// Doc-7B kit — SealedMarker. The single INLINE "sealed until window close" cell marker, promoted from the
// buyer-scoped realization (Shared Platform Component Registry §4.2 CTO override — 2026-07-03), shared by
// every surface that renders a value the server sealed for anti-farming (Doc-3 §10.1 / §12.2
// `abuse.sealed_until_close`): the buyer quotation detail (summary amount) and the buyer comparison matrix
// (price + protected-commercial-term cells). It frames the absence as a deliberate, time-bound redaction —
// NEVER a vendor deficiency. The lock icon is decorative (`aria-hidden`); the text carries the meaning.
// Extracted to one source so the governance-sensitive copy can never drift between surfaces.

import { Lock } from "lucide-react";

export function SealedMarker() {
  return (
    <span className="inline-flex items-center gap-1 text-muted-foreground">
      <Lock aria-hidden className="size-3.5" />
      Sealed until close
    </span>
  );
}
