"use client";

// Organization profile — P-ACC-04 (Doc-7E · T-SETTINGS). Client Component holding only ephemeral form
// state (Doc-7C §2.3). PRESENTATION-ONLY: client-side validation is UX only; it performs NO mutation —
// saving and transferring ownership both show honest interims and change nothing.
//
// FIELD DISCIPLINE (invent nothing):
//  • Editing maps to the frozen `identity.update_organization_profile.v1` writable fields (Doc-4C §C5):
//    `name` (bounded), `address` (Address VO), `contact_info` (ContactInfo VO), `brand_assets_ref`
//    (BrandAssets ref) with optimistic `updated_at`. Only the frozen scalar `name` is edited inline
//    here — the Address/ContactInfo VO field editor and the logo (`brand_assets_ref`) upload are DEFERRED
//    (`[ESC-7-API]` / `[ESC-7-API/upload]`): their exact VO sub-shape lives in Doc-2 §2 and is not part
//    of the wired surface, so we present current values read-only rather than coin sub-fields.
//  • `verification_level` is NEVER mutated here (Doc-4C §C5 AI-agent note) — it is display-only and
//    changes only through verification flows (firewall). `human_ref` (ORG-…) and `org_status` are
//    display-only too.
//  • Ownership transfer maps to `identity.transfer_ownership.v1` (Doc-4C §C5) — Owner-only
//    (`can_transfer_ownership`), never delegable, guarded by Last Owner Protection. `new_owner_user_id`
//    must hold an ACTIVE membership; `reason_code` is a required structured succession reason
//    (Architecture §5.5). High-stakes → destructive TYPED confirm (not colour-only).
import { useState, type FormEvent } from "react";
import { AlertTriangle, Camera, Info, MapPin, Phone, ShieldCheck, UserCog } from "lucide-react";
import { FormField } from "@/frontend/components/form-field";
import { cn } from "@/frontend/lib/cn";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/primitives/card";
import { Button } from "@/frontend/primitives/button";
import { Input } from "@/frontend/primitives/input";
import { Badge } from "@/frontend/primitives/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/frontend/primitives/dialog";

// Presentation seed — a wired build resolves the active organization server-side (get_active_context).
const ORG = {
  name: "Padma Valve & Fittings Ltd.",
  humanRef: "ORG-2026-000042", // display-only (never an authz key)
  status: "Active",
  verification: "Verified", // verification_level — display-only; changed only via verification flows
  address: ["Plot 7, Road 12, Tejgaon Industrial Area", "Dhaka 1208, Bangladesh"],
  contactEmail: "info@padmavalve.com.bd",
  contactPhone: "+880 2 5566 7788",
};

// Active members eligible to receive ownership (new_owner_user_id must hold an ACTIVE membership).
// Org roles are the frozen Org-Role dimension (Owner/Director/Manager/Officer — Invariant #2).
const CURRENT_OWNER = "Anisur Rahman";
const ELIGIBLE_MEMBERS = [
  { id: "usr_02", name: "Farhana Akter", role: "Director" },
  { id: "usr_03", name: "Kamal Hossain", role: "Manager" },
  { id: "usr_04", name: "Nasrin Sultana", role: "Officer" },
];

const TRANSFER_PHRASE = "TRANSFER";

export function OrganizationProfile() {
  const [name, setName] = useState(ORG.name);
  const [nameError, setNameError] = useState<string | undefined>(undefined);
  const [saved, setSaved] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);

  // Transfer-ownership state.
  const [newOwnerId, setNewOwnerId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [transferOpen, setTransferOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [transferred, setTransferred] = useState(false);

  const dirty = name !== ORG.name;
  const selectedMember = ELIGIBLE_MEMBERS.find((m) => m.id === newOwnerId) ?? null;
  const canOpenTransfer = selectedMember !== null && reason.trim().length > 0;

  function onSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length === 0) {
      setNameError("Enter an organization name.");
      return;
    }
    setNameError(undefined);
    // Presentation-only: nothing is written (the server owns the update; optimistic on `updated_at`,
    // which would surface a CONFLICT on stale) — show the honest interim.
    setSaved(true);
  }

  function confirmDiscard() {
    setName(ORG.name);
    setNameError(undefined);
    setSaved(false);
    setDiscardOpen(false);
  }

  function onTransfer() {
    // Presentation-only: nothing happens — honest interim.
    setTransferred(true);
    setTransferOpen(false);
    setConfirmText("");
    setNewOwnerId(null);
    setReason("");
  }

  return (
    <div className="max-w-2xl space-y-6">
      {saved ? (
        <div
          role="status"
          className="flex items-start gap-2 rounded-md border border-border bg-iv-info-subtle px-3 py-2 text-sm text-iv-info-muted"
        >
          <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <p>Organization updates are coming online soon — your changes weren’t applied yet.</p>
        </div>
      ) : null}
      {transferred ? (
        <div
          role="status"
          className="flex items-start gap-2 rounded-md border border-border bg-iv-info-subtle px-3 py-2 text-sm text-iv-info-muted"
        >
          <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <p>Ownership transfer isn’t wired in this preview — nothing happened.</p>
        </div>
      ) : null}

      {/* Organization details — editable name + read-only identity/verification. */}
      <form onSubmit={onSave} noValidate>
        <Card>
          <CardHeader>
            <CardTitle as="h2" className="flex items-center gap-2 text-base">
              <ShieldCheck aria-hidden="true" className="size-4 text-iv-navy-700" />
              Organization details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Logo (brand_assets_ref) — deferred change ([ESC-7-API/upload]). */}
            <div className="flex items-center gap-4">
              <div
                aria-hidden="true"
                className="flex size-16 items-center justify-center rounded-md border border-border bg-muted text-lg font-semibold text-muted-foreground"
              >
                PV
              </div>
              <div>
                <Button type="button" variant="outline" size="sm" disabled>
                  <Camera aria-hidden="true" />
                  Change logo
                </Button>
                <p className="mt-1 text-xs text-muted-foreground">Logo upload is coming soon.</p>
              </div>
            </div>

            <FormField
              id="org-name"
              label="Organization name"
              required
              description="Your organization’s legal or trading name, shown across iVendorz."
              error={nameError}
            >
              <Input
                name="name"
                type="text"
                autoComplete="organization"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setSaved(false);
                }}
              />
            </FormField>

            {/* Read-only identity — human_ref / status / verification_level are display-only. */}
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Reference
                </dt>
                <dd className="mt-1 font-mono text-sm text-foreground">{ORG.humanRef}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Status
                </dt>
                <dd className="mt-1">
                  <Badge variant="success">{ORG.status}</Badge>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Verification
                </dt>
                <dd className="mt-1">
                  <Badge variant="brand">{ORG.verification}</Badge>
                </dd>
              </div>
            </dl>
            <p className="text-xs text-muted-foreground">
              Verification status is managed through verification review — it can’t be changed here.
            </p>
          </CardContent>
        </Card>

        {/* Save bar — appears only when the name has changed (T-SETTINGS save/discard). */}
        {dirty ? (
          <div className="sticky bottom-0 z-10 -mx-4 mt-8 flex flex-col gap-3 border-t border-border bg-card/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-sm text-muted-foreground">You have unsaved changes.</p>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setDiscardOpen(true)}>
                Discard
              </Button>
              <Button type="submit">Save changes</Button>
            </div>
          </div>
        ) : null}
      </form>

      {/* Address & contact — presented read-only; the Address/ContactInfo VO field editor is deferred
          ([ESC-7-API]; VO sub-shape → Doc-2 §2, not in the wired surface). */}
      <Card>
        <CardHeader>
          <CardTitle as="h2" className="flex items-center gap-2 text-base">
            <MapPin aria-hidden="true" className="size-4 text-iv-navy-700" />
            Address &amp; contact
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Address
              </p>
              <address className="mt-1 space-y-0.5 text-sm not-italic text-foreground">
                {ORG.address.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </address>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Contact
              </p>
              <div className="mt-1 space-y-1 text-sm text-foreground">
                <p>{ORG.contactEmail}</p>
                <p className="flex items-center gap-1.5">
                  <Phone aria-hidden="true" className="size-3.5 text-muted-foreground" />
                  {ORG.contactPhone}
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <Button type="button" variant="outline" size="sm" className="w-fit" disabled>
              Edit address &amp; contact
            </Button>
            <p className="text-xs text-muted-foreground">
              Editing address and contact details is coming soon.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Transfer ownership — Owner-only (can_transfer_ownership), high-stakes, irreversible. Gated by a
          wired org-role read; shown here in the Owner presentation. */}
      <Card className="border-iv-danger-muted/40">
        <CardHeader>
          <CardTitle as="h2" className="flex items-center gap-2 text-base">
            <UserCog aria-hidden="true" className="size-4 text-iv-navy-700" />
            Transfer ownership
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="text-sm text-muted-foreground">
            Hand the Owner role to another active member. This is a major, irreversible change — the
            new owner gains full control of{" "}
            <span className="font-medium text-foreground">{ORG.name}</span> and you become a
            Director. Only an owner ({CURRENT_OWNER}) can do this.
          </p>

          <fieldset>
            <legend className="text-sm font-medium text-foreground">Choose the new owner</legend>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Only active members can receive ownership.
            </p>
            <div role="radiogroup" aria-label="New owner" className="mt-3 space-y-2">
              {ELIGIBLE_MEMBERS.map((m) => (
                <label
                  key={m.id}
                  className={cn(
                    "flex cursor-pointer items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm transition-colors focus-within:ring-2 focus-within:ring-ring",
                    newOwnerId === m.id
                      ? "border-iv-brand-500 bg-iv-brand-50"
                      : "border-border hover:bg-muted/50",
                  )}
                >
                  <span className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="new-owner"
                      value={m.id}
                      checked={newOwnerId === m.id}
                      onChange={() => setNewOwnerId(m.id)}
                      className="size-4 accent-iv-brand-500"
                    />
                    <span className="font-medium text-foreground">{m.name}</span>
                  </span>
                  <Badge variant="neutral">{m.role}</Badge>
                </label>
              ))}
            </div>
          </fieldset>

          <FormField
            id="transfer-reason"
            label="Reason for transfer"
            required
            description="Recorded as a structured succession reason on the ownership change."
          >
            <Input
              name="reason"
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Ownership succession — founder handover"
            />
          </FormField>

          <div>
            <Button
              type="button"
              variant="destructive"
              disabled={!canOpenTransfer}
              onClick={() => setTransferOpen(true)}
            >
              Transfer ownership
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Discard-changes confirm (Doc-7E dialog). */}
      <Dialog open={discardOpen} onOpenChange={setDiscardOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Discard changes?</DialogTitle>
            <DialogDescription>
              Your unsaved changes will be lost. This can’t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDiscardOpen(false)}>
              Keep editing
            </Button>
            <Button type="button" variant="destructive" onClick={confirmDiscard}>
              Discard changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transfer ownership — destructive TYPED confirm (high-stakes; not colour-only). */}
      <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer ownership?</DialogTitle>
            <DialogDescription>
              You’re about to make{" "}
              <span className="font-semibold text-foreground">{selectedMember?.name}</span> the
              owner of <span className="font-semibold text-foreground">{ORG.name}</span> — this is
              irreversible, and you’ll lose owner control. Your organization always keeps at least
              one owner.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-start gap-2 rounded-md border border-iv-warning-muted/40 bg-iv-warning-subtle px-3 py-2 text-sm text-iv-warning-muted">
            <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <p>Only the new owner will be able to transfer ownership back.</p>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="transfer-confirm" className="block text-sm font-medium text-foreground">
              Type {TRANSFER_PHRASE} to confirm
            </label>
            <Input
              id="transfer-confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              autoComplete="off"
              placeholder={TRANSFER_PHRASE}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setTransferOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={confirmText !== TRANSFER_PHRASE}
              onClick={onTransfer}
            >
              Transfer ownership
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
