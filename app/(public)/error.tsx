"use client";

// Doc-7C SR7 — `(public)` route-segment error boundary (must be a Client Component). Renders the
// kit ErrorState with NO protected enrichment (Doc-7A §5.4). A generic render error maps to the
// INTERNAL class; Next's `error.digest` is surfaced as the support reference (carries no PII). When
// wired Doc-5 reads land, surfaces can throw typed errors carrying the contract's real error_class.
import { useEffect } from "react";
import { Button } from "@/frontend/primitives/button";
import { ErrorState } from "@/frontend/components/error-state";

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Presentation telemetry hook point — never logs protected/excluded data (GI-12).
  }, [error]);

  return (
    <div className="mx-auto w-full max-w-[var(--iv-content-max)] px-4 py-16 sm:px-6 lg:px-8">
      <ErrorState
        errorClass="INTERNAL"
        message="An unexpected error occurred while loading this page."
        referenceId={error.digest}
        action={
          <Button variant="outline" onClick={reset}>
            Try again
          </Button>
        }
      />
    </div>
  );
}
