"use client";

// Accept-invitation view — P-AUTH-07 (Doc-7E §2.3). Client Component holding only ephemeral view state
// (Doc-7C §2.3). PRESENTATION-ONLY: it performs NO mutation and calls NO contract — `accept_invitation`
// (the frozen binding) is not wired in this build, so accepting shows an honest interim and joins
// nothing. The invitation details are realistic MOCK seed (a wired build resolves them, server-side,
// from the server-authoritative token). Model is ACCEPT/DECLINE of an already-resolved invite; the
// org-card + role-pill are the reference visuals. Composes the shared kit (Badge / Button) + helpers.
import { useState } from "react";
import Link from "next/link";
import { Check, ShieldCheck, UserRound, X } from "lucide-react";
import { Badge } from "@/frontend/primitives/badge";
import { Button } from "@/frontend/primitives/button";
import { AuthResultPanel } from "../_components/auth-result-panel";

// Mock invitation (presentation seed). `role` is a FROZEN Org Role (Owner/Director/Manager/Officer,
// Invariant #2) — never invented; a wired build reads org/role/inviter from the token, server-side.
const INVITATION = {
  org: "Padma Valve & Fittings Ltd.",
  role: "Manager",
  inviter: "Anisur Rahman",
};

const ORG_INITIAL = INVITATION.org.charAt(0).toUpperCase();

export function InvitationView({ preview }: { preview?: "loading" | "accepted" | "declined" }) {
  const [status, setStatus] = useState<"pending" | "accepted" | "declined">(
    preview === "accepted" ? "accepted" : preview === "declined" ? "declined" : "pending",
  );
  // Loading is a DEV/QA preview only — there is no real async accept in this presentation build.
  const loading = preview === "loading";

  if (status === "accepted") {
    return (
      <AuthResultPanel
        tone="success"
        icon={<Check />}
        title="Welcome to the team"
        description={
          <>
            You’ve joined <span className="font-medium text-foreground">{INVITATION.org}</span> as a{" "}
            {INVITATION.role}. Your shared workspace is ready.
          </>
        }
        action={
          <Button asChild size="lg" className="w-full">
            <Link href="/login">Go to workspace</Link>
          </Button>
        }
        note="Joining isn’t wired in this preview — nothing was changed."
      />
    );
  }

  if (status === "declined") {
    return (
      <AuthResultPanel
        tone="neutral"
        icon={<X />}
        title="Invitation declined"
        description={
          <>
            You’ve declined the invitation to join {INVITATION.org}. You can safely close this page.
          </>
        }
        action={
          <Button asChild variant="outline" size="lg" className="w-full">
            <Link href="/login">Back to sign in</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div>
      {/* Org invite card. */}
      <div className="mb-6 flex items-center gap-3.5 rounded-xl border border-border bg-muted/50 p-4">
        <span
          aria-hidden="true"
          className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-iv-navy-700 text-xl font-extrabold text-white"
        >
          {ORG_INITIAL}
        </span>
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 font-semibold text-iv-ink-heading">
            {INVITATION.org}
            <ShieldCheck aria-hidden="true" className="size-4 shrink-0 text-iv-navy-600" />
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">Invited by {INVITATION.inviter}</p>
        </div>
      </div>

      <div className="mb-6">
        <h1 className="text-[1.55rem] font-extrabold tracking-tight text-iv-ink-heading">
          You’ve been invited
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          Join <span className="font-medium text-foreground">{INVITATION.org}</span> on iVendorz as
          a{" "}
          <Badge variant="neutral" className="ml-0.5 gap-1 align-middle">
            <UserRound aria-hidden="true" className="size-3" />
            {INVITATION.role}
          </Badge>
          .
        </p>
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="sm:flex-1"
          disabled={loading}
          onClick={() => setStatus("declined")}
        >
          <X aria-hidden="true" />
          Decline
        </Button>
        <Button
          type="button"
          size="lg"
          className="sm:flex-1"
          disabled={loading}
          onClick={() => setStatus("accepted")}
        >
          {loading ? (
            "Joining…"
          ) : (
            <>
              <Check aria-hidden="true" />
              Accept &amp; join
            </>
          )}
        </Button>
      </div>

      <p className="mt-6 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
        Organizations own their records; by joining you act on behalf of this one with the role
        shown. Your role can be changed later by an owner.
      </p>
    </div>
  );
}
