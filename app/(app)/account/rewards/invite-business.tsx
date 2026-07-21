"use client";

// "Invite a business" — the Growth Hub create-invitation flow (Doc-7E_GrowthHub_Patch_v1.0.1
// §2(a), the §B8 CTA mandate). A CLIENT island mounted by the server `rewards-dashboard.tsx`
// ONLY for holders of `can_manage_growth_invites` (§3 — UX gating; the M1 app layer behind the
// endpoint is the enforcement). It POSTs to the wired `POST /api/identity/growth_invitations`
// (`identity.create_invitation.v1`, Doc-5C v1.0.1 row 36) — the one client self-fetch on this
// surface (the create is a USER ACTION, not a server-rendered read).
//
// PINNED MVP (Doc-7E v1.0.1 §2(a), Review-A MINOR-2): the flow submits the STATIC `referral`
// campaign key; NO campaign enumeration is rendered (no wired registry read exists — `[ESC-7-API]`;
// the server-side REFERENCE stage backstops every submission).
//
// §C13 PRESENCE RULE: targeted (email/sms/whatsapp) → `recipient_identifier` REQUIRED; open
// (`link`) → the field is NOT collected and NOT submitted (forbidden — never an empty string).
// [Scope note, disclosed: the `qr` open channel is NOT offered in this slice — no QR-render
// dependency exists in the repo, and a QR option that can only show a URL is a stub. The `link`
// channel carries the open-invitation flow; `qr` mounts when a QR renderer lands.]
//
// TOKEN-ONCE UX (GI-2, binding): the 201's raw token is displayed EXACTLY ONCE with a copy
// affordance and an explicit "you won't see this again" notice; closing the dialog clears it from
// memory and no re-read surface exists (Doc-5C G-2). An idempotent replay of the same create
// (stable `Idempotency-Key`, Doc-5A §9.7) is the SAME logical response — delivery recovery of the
// once-view, never an independent re-read. HYGIENE (§3): the raw token is never logged and never
// enters any analytics event; the share URL is built client-side from the one response.
//
// Kit primitives only (Dialog / Tabs / Button / FormField) — no re-implemented controls; motion is
// the Dialog primitive's own kit animation (motion_standard.md — no one-off keyframes here).

import * as React from "react";
import { AlertTriangle, Check, Copy, UserPlus } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/frontend/primitives/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/frontend/primitives/tabs";
import { FormField } from "@/frontend/components/form-field";
import { StatusChip } from "@/frontend/components/status-chip";

// The channels offered in this slice (Doc-2 v1.0.10 `growth_recipient_type` closed set, minus `qr`
// — see the scope note above). Targeted channels require a recipient; `link` forbids one (§C13).
type Channel = "email" | "sms" | "whatsapp" | "link";
const CHANNELS: { value: Channel; label: string }[] = [
  { value: "email", label: "Email" },
  { value: "sms", label: "SMS" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "link", label: "Link" },
];
const TARGETED: readonly Channel[] = ["email", "sms", "whatsapp"];
const RECIPIENT_LABEL: Record<Exclude<Channel, "link">, string> = {
  email: "Recipient email",
  sms: "Recipient mobile number",
  whatsapp: "Recipient WhatsApp number",
};

type FlowState =
  | { step: "compose"; submitting: boolean; error: string | null }
  | { step: "issued"; channel: Channel; shareUrl: string; copied: boolean };

/** Wire envelope shapes (Doc-5A §5.6/§6.1 — camelCase `result`, snake_case envelope). */
interface CreateInvitationWireResult {
  result?: { growthInvitationId?: string; state?: string; token?: string };
  error?: { message?: string };
}

export function InviteBusinessDialog() {
  const [open, setOpen] = React.useState(false);
  const [channel, setChannel] = React.useState<Channel>("email");
  const [recipient, setRecipient] = React.useState("");
  const [flow, setFlow] = React.useState<FlowState>({
    step: "compose",
    submitting: false,
    error: null,
  });
  // The stable Idempotency-Key for ONE logical create (Doc-5A §9.7): minted per compose session,
  // re-minted only after a success (the §B.6 leg persists on success / releases on error, so a
  // retried failure safely reuses the key — the same logical command).
  const idempotencyKeyRef = React.useRef<string | null>(null);
  if (idempotencyKeyRef.current === null) {
    idempotencyKeyRef.current = crypto.randomUUID();
  }

  const targeted = TARGETED.includes(channel);

  function reset(nextOpen: boolean): void {
    setOpen(nextOpen);
    if (!nextOpen) {
      // Token-once: leaving the dialog clears the raw token/share URL from memory (GI-2).
      setFlow({ step: "compose", submitting: false, error: null });
      setRecipient("");
      setChannel("email");
      idempotencyKeyRef.current = crypto.randomUUID();
    }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (flow.step !== "compose" || flow.submitting) return;

    const trimmedRecipient = recipient.trim();
    if (targeted && trimmedRecipient.length === 0) {
      setFlow({ step: "compose", submitting: false, error: "A recipient is required." });
      return;
    }

    setFlow({ step: "compose", submitting: true, error: null });

    // §C13 body: snake_case wire fields; the recipient key is ABSENT (not "") for the open channel.
    const body: Record<string, string> = {
      campaign_key: "referral",
      recipient_type: channel,
      ...(targeted ? { recipient_identifier: trimmedRecipient } : {}),
    };

    try {
      const res = await fetch("/api/identity/growth_invitations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKeyRef.current as string,
        },
        body: JSON.stringify(body),
      });
      const payload = (await res.json().catch(() => null)) as CreateInvitationWireResult | null;

      if (res.status === 201 && typeof payload?.result?.token === "string") {
        // Build the share URL from THIS one response (the `/invite` ingress link shape). The raw
        // token lives only in this component's state until the dialog closes.
        const shareUrl = `${window.location.origin}/invite?token=${encodeURIComponent(payload.result.token)}`;
        idempotencyKeyRef.current = crypto.randomUUID(); // next create = a new logical command
        setFlow({ step: "issued", channel, shareUrl, copied: false });
        return;
      }

      setFlow({
        step: "compose",
        submitting: false,
        error:
          payload?.error?.message ?? `The invitation could not be created (HTTP ${res.status}).`,
      });
    } catch {
      setFlow({
        step: "compose",
        submitting: false,
        error: "Network error — please try again.",
      });
    }
  }

  async function copyShareUrl(): Promise<void> {
    if (flow.step !== "issued") return;
    try {
      await navigator.clipboard.writeText(flow.shareUrl);
      setFlow({ ...flow, copied: true });
    } catch {
      // Clipboard unavailable — the readonly input remains selectable by hand.
    }
  }

  return (
    <>
      <Button variant="amber" size="lg" className="mt-6 gap-2" onClick={() => setOpen(true)}>
        <UserPlus aria-hidden />
        Invite a business
      </Button>

      <Dialog open={open} onOpenChange={reset}>
        <DialogContent className="sm:max-w-lg">
          {flow.step === "compose" ? (
            <form onSubmit={submit}>
              <DialogHeader>
                <DialogTitle>Invite a business</DialogTitle>
                <DialogDescription>
                  Invite another business to join iVendorz. When their organization registers and
                  qualifies, your organization earns reward points.
                </DialogDescription>
              </DialogHeader>

              <div className="mt-4 space-y-4">
                {/* Pinned MVP: the static `referral` campaign — rendered as fact, never a choice. */}
                <p className="text-sm text-muted-foreground">
                  Campaign: <span className="font-medium text-foreground">Referral</span>
                </p>

                <div>
                  <p className="mb-1.5 text-sm font-medium text-foreground">
                    How do you want to invite them?
                  </p>
                  <Tabs value={channel} onValueChange={(v) => setChannel(v as Channel)}>
                    <TabsList>
                      {CHANNELS.map((c) => (
                        <TabsTrigger key={c.value} value={c.value}>
                          {c.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </div>

                {targeted ? (
                  <FormField
                    id="invite-recipient"
                    label={RECIPIENT_LABEL[channel as Exclude<Channel, "link">]}
                    required
                    inputProps={{
                      value: recipient,
                      onChange: (e) => setRecipient(e.target.value),
                      placeholder:
                        channel === "email" ? "procurement@factory.example" : "+8801XXXXXXXXX",
                      autoComplete: "off",
                    }}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    You&rsquo;ll get a link to share yourself — open invitations aren&rsquo;t
                    delivered by the platform, and no recipient details are collected.
                  </p>
                )}

                <p role="status" aria-live="polite" className="min-h-4 text-sm text-destructive">
                  {flow.error}
                </p>
              </div>

              <DialogFooter className="mt-2">
                <Button type="button" variant="outline" onClick={() => reset(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="amber" disabled={flow.submitting}>
                  {flow.submitting ? "Creating…" : "Create invitation"}
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  Invitation created
                  <StatusChip label="Issued" tone="info" />
                </DialogTitle>
                <DialogDescription>
                  {TARGETED.includes(flow.channel)
                    ? "A delivery to the recipient is on its way. This link is your own copy."
                    : "Share this link yourself — open invitations aren’t delivered by the platform."}
                </DialogDescription>
              </DialogHeader>

              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-2 rounded-md border border-iv-amber-500/60 bg-iv-amber-500/10 p-2">
                  <input
                    readOnly
                    value={flow.shareUrl}
                    aria-label="Invitation link — shown once"
                    className="w-full bg-transparent font-mono text-xs text-foreground outline-none"
                    onFocus={(e) => e.currentTarget.select()}
                  />
                  <Button type="button" variant="outline" size="sm" onClick={copyShareUrl}>
                    {flow.copied ? <Check aria-hidden /> : <Copy aria-hidden />}
                    {flow.copied ? "Copied" : "Copy"}
                  </Button>
                </div>

                <div className="flex items-start gap-2 rounded-md border border-border bg-muted px-3 py-2 text-xs text-muted-foreground">
                  <AlertTriangle aria-hidden className="mt-0.5 size-4 shrink-0" />
                  <p>
                    <span className="font-semibold text-foreground">
                      You won&rsquo;t see this again.
                    </span>{" "}
                    The link is shown once — copy it now if you need it later.
                  </p>
                </div>
              </div>

              <DialogFooter className="mt-2">
                <Button type="button" variant="primary" onClick={() => reset(false)}>
                  Done
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
