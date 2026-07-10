"use client";

// Accept-invitation view — P-AUTH-07 (Doc-7E §2.3). Client Component holding only ephemeral view state
// (Doc-7C §2.3). PRESENTATION-ONLY: it performs NO mutation and calls NO contract — `accept_invitation`
// (the frozen binding) is not wired in this build, so accepting shows an honest interim and joins
// nothing. The invitation details are realistic MOCK seed (a wired build resolves them, server-side,
// from the server-authoritative token). Composes the shared kit (Card subparts / Badge / Button).
import { useState } from "react";
import Link from "next/link";
import { Building2, Check, Info, Loader2, X } from "lucide-react";
import { Badge } from "@/frontend/primitives/badge";
import { Button } from "@/frontend/primitives/button";

// Mock invitation (presentation seed). `role` is a FROZEN Org Role (Owner/Director/Manager/Officer,
// Invariant #2) — never invented; a wired build reads org/role/inviter from the token, server-side.
const INVITATION = {
  org: "Padma Valve & Fittings Ltd.",
  role: "Manager",
  inviter: "Anisur Rahman",
};

export function InvitationView({ preview }: { preview?: "loading" | "accepted" | "declined" }) {
  const [status, setStatus] = useState<"pending" | "accepted" | "declined">(
    preview === "accepted" ? "accepted" : preview === "declined" ? "declined" : "pending",
  );
  // Loading is a DEV/QA preview only — there is no real async accept in this presentation build.
  const loading = preview === "loading";

  if (status === "accepted") {
    return (
      <div className="space-y-4">
        <div className="flex flex-col items-center gap-2 rounded-md border border-border bg-iv-info-subtle px-4 py-5 text-center">
          <Check aria-hidden="true" className="size-6 text-iv-info-muted" />
          <h1 className="text-lg font-semibold text-iv-ink-heading">Almost there</h1>
          <p className="text-sm text-iv-info-muted" role="status">
            Joining {INVITATION.org} is coming online soon — you’ll be able to finish here shortly.
            Nothing was changed.
          </p>
        </div>
        <Button asChild variant="outline" className="w-full">
          <Link href="/login">Back to sign in</Link>
        </Button>
      </div>
    );
  }

  if (status === "declined") {
    return (
      <div className="space-y-4">
        <div className="rounded-md border border-border bg-muted/50 px-4 py-5 text-center">
          <h1 className="text-lg font-semibold text-iv-ink-heading">Invitation declined</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            You’ve declined the invitation to join {INVITATION.org}. You can safely close this page.
          </p>
        </div>
        <Button asChild variant="outline" className="w-full">
          <Link href="/login">Back to sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <span
          aria-hidden="true"
          className="flex size-14 items-center justify-center rounded-lg bg-iv-brand-50 text-iv-brand-700"
        >
          <Building2 className="size-7" />
        </span>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-iv-ink-heading">
            You’ve been invited
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Join <span className="font-medium text-foreground">{INVITATION.org}</span> as
          </p>
          <div className="mt-2 flex justify-center">
            <Badge variant="neutral">{INVITATION.role}</Badge>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Invited by {INVITATION.inviter}</p>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row">
        <Button
          type="button"
          variant="outline"
          className="sm:flex-1"
          disabled={loading}
          onClick={() => setStatus("declined")}
        >
          <X aria-hidden="true" />
          Decline
        </Button>
        <Button
          type="button"
          className="sm:flex-1"
          disabled={loading}
          onClick={() => setStatus("accepted")}
        >
          {loading ? (
            <>
              <Loader2 aria-hidden="true" className="animate-spin" />
              Joining…
            </>
          ) : (
            <>
              <Check aria-hidden="true" />
              Accept &amp; join
            </>
          )}
        </Button>
      </div>

      <div className="flex items-start gap-2 border-t border-border pt-4 text-xs text-muted-foreground">
        <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        <p>
          Organizations own their records; by joining you act on behalf of this one with the role
          shown. Your role can be changed later by an owner.
        </p>
      </div>
    </div>
  );
}
