"use client";

// User profile form — P-ACC-02 (Doc-7E · T-SETTINGS). Client Component holding only ephemeral form
// state (Doc-7C §2.3). PRESENTATION-ONLY: client-side validation is UX only; it performs NO mutation —
// a completed save shows an honest interim and changes nothing.
//
// FIELD DISCIPLINE (invent nothing): edits exactly the frozen `update_user_profile.v1` writable fields
// (Doc-4C §C4) — `display_name` and `phone`. EMAIL is auth-managed (DC-4) → rendered READ-ONLY here,
// never mutated. AVATAR change is deferred — `[ESC-7-API/upload]` (no client-facing upload-grant in the
// wired surface); the "Change photo" affordance is disabled. Composes the shared kit
// (FormField / Input / Button / Avatar / Dialog).
import { useState, type FormEvent } from "react";
import { Camera, Info } from "lucide-react";
import { FormField } from "@/frontend/components/form-field";
import { Input } from "@/frontend/primitives/input";
import { Button } from "@/frontend/primitives/button";
import { Avatar, AvatarFallback } from "@/frontend/primitives/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/frontend/primitives/dialog";

// Presentation seed (a wired build resolves these server-side from the session user).
const INITIAL = { displayName: "Anisur Rahman", phone: "+8801712345678" };
const EMAIL = "anisur@padmavalve.com.bd";
const PHONE_RE = /^\+[1-9]\d{7,14}$/; // E.164 (optional field; validated only when present)

interface FieldErrors {
  displayName?: string;
  phone?: string;
}

export function UserProfileForm() {
  const [values, setValues] = useState(INITIAL);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saved, setSaved] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);

  const dirty = values.displayName !== INITIAL.displayName || values.phone !== INITIAL.phone;

  function set<K extends keyof typeof values>(key: K, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function onSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next: FieldErrors = {};
    if (values.displayName.trim().length === 0) next.displayName = "Enter a display name.";
    if (values.phone.trim().length > 0 && !PHONE_RE.test(values.phone.trim()))
      next.phone = "Enter a valid phone number with country code (e.g. +8801712345678).";
    setErrors(next);
    // Presentation-only: nothing is written (the server owns the update) — show the honest interim.
    if (Object.keys(next).length === 0) setSaved(true);
  }

  function confirmDiscard() {
    setValues(INITIAL);
    setErrors({});
    setSaved(false);
    setDiscardOpen(false);
  }

  return (
    <form onSubmit={onSave} noValidate>
      {/* Constrained form column (spec cites `--iv-form-max`, which is not defined in the design system
          yet — using a concrete form width; flagged for the token owner). */}
      <div className="max-w-2xl space-y-6">
        {saved ? (
          <div
            role="status"
            className="flex items-start gap-2 rounded-md border border-border bg-iv-info-subtle px-3 py-2 text-sm text-iv-info-muted"
          >
            <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <p>Profile updates are coming online soon — your changes weren’t applied yet.</p>
          </div>
        ) : null}

        {/* Avatar — display + deferred change ([ESC-7-API/upload]). */}
        <div className="flex items-center gap-4">
          <Avatar className="size-16">
            <AvatarFallback className="text-lg">AR</AvatarFallback>
          </Avatar>
          <div>
            <Button type="button" variant="outline" size="sm" disabled>
              <Camera aria-hidden="true" />
              Change photo
            </Button>
            <p className="mt-1 text-xs text-muted-foreground">Photo upload is coming soon.</p>
          </div>
        </div>

        <FormField
          id="profile-display-name"
          label="Display name"
          required
          description="How your name appears across iVendorz."
          error={errors.displayName}
        >
          <Input
            name="displayName"
            type="text"
            autoComplete="name"
            value={values.displayName}
            onChange={(e) => set("displayName", e.target.value)}
          />
        </FormField>

        <FormField
          id="profile-phone"
          label="Phone"
          description="Include the country code, e.g. +8801712345678."
          error={errors.phone}
        >
          <Input
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={values.phone}
            onChange={(e) => set("phone", e.target.value)}
          />
        </FormField>

        {/* Email is auth-managed (DC-4) — read-only here. */}
        <div className="space-y-1.5">
          <span className="block text-sm font-medium text-foreground">Email</span>
          <div className="flex h-9 items-center rounded-md border border-input bg-muted px-3 text-sm text-muted-foreground">
            {EMAIL}
          </div>
          <p className="text-xs text-muted-foreground">
            Your email and password are managed in Security &amp; 2FA.
          </p>
        </div>
      </div>

      {/* Save bar — appears only when there are unsaved changes (T-SETTINGS save/discard). */}
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
    </form>
  );
}
