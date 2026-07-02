"use client";

// Security & 2FA settings — P-ACC-03 (Doc-7E · T-SETTINGS). Client Component holding only ephemeral
// form state (Doc-7C §2.3). PRESENTATION-ONLY: it performs NO mutation — saving 2FA settings and
// deactivating the account both show honest interims and change nothing.
//
// FIELD DISCIPLINE (invent nothing): the 2FA toggle maps to the frozen `update_user_2fa_settings`
// field `two_fa_enabled` (Doc-4C §C4); the TOTP challenge/verification is Supabase Auth infrastructure
// (DC-4), not represented here. Deactivation maps to `deactivate_own_account` (Doc-5C) behind a
// destructive TYPED confirm. Backup codes are presentation seed. No kit `Switch` primitive exists yet,
// so the toggle is a hand-wired accessible `role="switch"` control (flagged for the kit owner).
import { useState } from "react";
import { AlertTriangle, Info, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/primitives/card";
import { Button } from "@/frontend/primitives/button";
import { Input } from "@/frontend/primitives/input";
import { Separator } from "@/frontend/primitives/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/frontend/primitives/dialog";
import { cn } from "@/frontend/lib/cn";

const INITIAL_2FA = false;
// Presentation seed — a wired build issues real one-time backup codes on 2FA enrolment.
const BACKUP_CODES = ["3f9a-c2e1", "7b04-9d5a", "e18c-4a62", "aa20-1f7d", "5c73-b8e9", "9012-6de4"];
const DEACTIVATE_PHRASE = "DEACTIVATE";

function Toggle({
  id,
  checked,
  onChange,
  labelId,
}: {
  id: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  labelId: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      aria-labelledby={labelId}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        checked ? "bg-iv-brand-600" : "bg-input",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "inline-block size-5 transform rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-5" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

export function SecuritySettings() {
  const [twoFA, setTwoFA] = useState(INITIAL_2FA);
  const [saved, setSaved] = useState(false);
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deactivated, setDeactivated] = useState(false);

  const dirty = twoFA !== INITIAL_2FA;

  function onSave() {
    // Presentation-only: nothing is written (the server owns the update) — honest interim.
    setSaved(true);
  }

  function onDeactivate() {
    // Presentation-only: nothing happens — honest interim.
    setDeactivated(true);
    setDeactivateOpen(false);
    setConfirmText("");
  }

  return (
    <div className="max-w-2xl space-y-6">
      {saved ? (
        <div
          role="status"
          className="flex items-start gap-2 rounded-md border border-border bg-iv-info-subtle px-3 py-2 text-sm text-iv-info-muted"
        >
          <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <p>Two-factor settings are coming online soon — your change wasn’t applied yet.</p>
        </div>
      ) : null}
      {deactivated ? (
        <div
          role="status"
          className="flex items-start gap-2 rounded-md border border-border bg-iv-info-subtle px-3 py-2 text-sm text-iv-info-muted"
        >
          <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <p>Account deactivation isn’t wired in this preview — nothing happened.</p>
        </div>
      ) : null}

      {/* Two-factor authentication */}
      <Card>
        <CardHeader>
          <CardTitle as="h2" className="flex items-center gap-2 text-base">
            <ShieldCheck aria-hidden="true" className="size-4 text-iv-navy-700" />
            Two-factor authentication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p id="twofa-label" className="text-sm font-medium text-foreground">
                Authenticator app (TOTP)
              </p>
              <p className="text-sm text-muted-foreground">
                Require a 6-digit code from your authenticator app when you sign in.
              </p>
            </div>
            <Toggle id="twofa" checked={twoFA} onChange={setTwoFA} labelId="twofa-label" />
          </div>

          {twoFA ? (
            <>
              <Separator />
              <div>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">Backup codes</p>
                  <Button type="button" variant="outline" size="sm" disabled>
                    Regenerate
                  </Button>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Save these somewhere safe — each can be used once if you lose your device.
                </p>
                <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {BACKUP_CODES.map((code) => (
                    <li
                      key={code}
                      className="rounded-md border border-border bg-muted px-2 py-1 text-center font-mono text-sm text-foreground"
                    >
                      {code}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>

      {/* Danger zone — deactivation (destructive; conveyed by heading + label + typed confirm, not colour alone). */}
      <Card className="bg-iv-danger-subtle">
        <CardHeader>
          <CardTitle as="h2" className="flex items-center gap-2 text-base text-iv-danger-muted">
            <AlertTriangle aria-hidden="true" className="size-4" />
            Danger zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">Deactivate account</p>
              <p className="text-sm text-muted-foreground">
                You’ll be signed out and your account deactivated. An organization owner can restore
                it later.
              </p>
            </div>
            <Button
              type="button"
              variant="destructive"
              className="sm:shrink-0"
              onClick={() => setDeactivateOpen(true)}
            >
              Deactivate account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save bar — appears only when the 2FA setting has changed. */}
      {dirty ? (
        <div className="sticky bottom-0 z-10 -mx-4 mt-8 flex flex-col gap-3 border-t border-border bg-card/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-sm text-muted-foreground">You have unsaved changes.</p>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setTwoFA(INITIAL_2FA)}>
              Discard
            </Button>
            <Button type="button" onClick={onSave}>
              Save changes
            </Button>
          </div>
        </div>
      ) : null}

      {/* Deactivation — destructive TYPED confirm (Doc-7E; not colour-only). */}
      <Dialog open={deactivateOpen} onOpenChange={setDeactivateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate your account?</DialogTitle>
            <DialogDescription>
              This deactivates your account and signs you out. To confirm, type{" "}
              <span className="font-semibold text-foreground">{DEACTIVATE_PHRASE}</span> below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <label
              htmlFor="deactivate-confirm"
              className="block text-sm font-medium text-foreground"
            >
              Type {DEACTIVATE_PHRASE} to confirm
            </label>
            <Input
              id="deactivate-confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              autoComplete="off"
              placeholder={DEACTIVATE_PHRASE}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeactivateOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={confirmText !== DEACTIVATE_PHRASE}
              onClick={onDeactivate}
            >
              Deactivate account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
