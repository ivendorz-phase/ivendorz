// Honest "presentation-only" note shown in the action row of the Company edit forms (S2–S5). No
// mock business logic exists in this build: controls render the current values, but saving and
// validation are wired in the integration phase. RSC-friendly.
export function PresentationFormNote({ className }: { className?: string }) {
  return (
    <p className={className ?? "text-xs text-muted-foreground"}>
      This form is presentation-only in the current build — saving and validation connect in the
      integration phase.
    </p>
  );
}
