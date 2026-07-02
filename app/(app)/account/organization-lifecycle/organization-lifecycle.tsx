"use client";

// Organization lifecycle — P-ACC-05 (Doc-7E · T-SETTINGS). Client Component holding only ephemeral form
// state (Doc-7C §2.3). PRESENTATION-ONLY: deleting and restoring both show honest interims and change
// nothing — the server owns the §5.1 state machine.
//
// FIELD DISCIPLINE (invent nothing):
//  • Deactivation maps to the frozen `identity.soft_delete_organization.v1` (Doc-4C §C5, Owner-only
//    `can_delete_organization`): request `confirmation : boolean` + `reason : string` (+ optimistic
//    `updated_at`); state `active → soft_deleted` (Doc-2 §5.1). The `confirmation` boolean is expressed
//    as a destructive TYPED confirm (not colour-only). SOFT-DELETE ONLY — never hard-delete; the org is
//    recoverable and its IDs are never reused (Invariant #8).
//  • Restore maps to `identity.restore_organization.v1` (Doc-4C §C5): request `organization_id`
//    (server-known) + optional `reason`; state `soft_deleted → active`; a reused slug is regenerated
//    (`slug_regenerated`). Owner/Admin scope by wired read.
//  • Cross-module cascade (vendor profile / RFQs) is BLOCKED pending DC-1 — never synthesized here.
import { useState, type FormEvent } from "react";
import { AlertTriangle, Info, RotateCcw, ShieldCheck } from "lucide-react";
import { FormField } from "@/frontend/components/form-field";
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

const ORG_NAME = "Padma Valve & Fittings Ltd.";
const DELETE_PHRASE = "DELETE";
// Presentation seed for the deactivated state (a wired build resolves these from the org record/audit).
const DEACTIVATED_ON = "12 Jun 2026";

export function OrganizationLifecycle({ deleted }: { deleted: boolean }) {
  // Deactivate flow (active state).
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState<string | undefined>(undefined);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleteDone, setDeleteDone] = useState(false);

  // Restore flow (deleted state).
  const [restoreReason, setRestoreReason] = useState("");
  const [restoreOpen, setRestoreOpen] = useState(false);
  const [restoreDone, setRestoreDone] = useState(false);

  function openDelete(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (reason.trim().length === 0) {
      setReasonError("Enter a reason for deactivating this organization.");
      return;
    }
    setReasonError(undefined);
    setDeleteOpen(true);
  }

  function onDelete() {
    // Presentation-only: nothing happens — honest interim.
    setDeleteDone(true);
    setDeleteOpen(false);
    setConfirmText("");
  }

  function onRestore() {
    // Presentation-only: nothing happens — honest interim.
    setRestoreDone(true);
    setRestoreOpen(false);
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Honest interims. */}
      {deleteDone ? (
        <div
          role="status"
          className="flex items-start gap-2 rounded-md border border-border bg-iv-info-subtle px-3 py-2 text-sm text-iv-info-muted"
        >
          <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <p>Deactivation isn’t wired in this preview — nothing happened.</p>
        </div>
      ) : null}
      {restoreDone ? (
        <div
          role="status"
          className="flex items-start gap-2 rounded-md border border-border bg-iv-info-subtle px-3 py-2 text-sm text-iv-info-muted"
        >
          <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <p>Restore isn’t wired in this preview — nothing happened.</p>
        </div>
      ) : null}

      {/* Current lifecycle status. */}
      <Card>
        <CardHeader>
          <CardTitle as="h2" className="flex items-center gap-2 text-base">
            <ShieldCheck aria-hidden="true" className="size-4 text-iv-navy-700" />
            Organization status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">{ORG_NAME}</p>
              <p className="text-sm text-muted-foreground">
                {deleted
                  ? `Deactivated on ${DEACTIVATED_ON}. It can be restored by an owner.`
                  : "This organization is active."}
              </p>
            </div>
            {deleted ? (
              <Badge variant="warning">Deactivated</Badge>
            ) : (
              <Badge variant="success">Active</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {deleted ? (
        /* Restore path — visible whenever the org is soft-deleted (Invariant #8: recoverable). */
        <Card>
          <CardHeader>
            <CardTitle as="h2" className="flex items-center gap-2 text-base">
              <RotateCcw aria-hidden="true" className="size-4 text-iv-navy-700" />
              Restore organization
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Restoring reactivates <span className="font-medium text-foreground">{ORG_NAME}</span>{" "}
              and its members. If its web address was reused while deactivated, a new one is
              generated. Only an owner can restore it.
            </p>
            <FormField
              id="restore-reason"
              label="Reason"
              description="Optional — recorded on the restore."
            >
              <Input
                name="restoreReason"
                type="text"
                value={restoreReason}
                onChange={(e) => setRestoreReason(e.target.value)}
                placeholder="e.g. Resuming operations"
              />
            </FormField>
            <div>
              <Button type="button" onClick={() => setRestoreOpen(true)}>
                Restore organization
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Danger zone — soft-delete (destructive; conveyed by heading + label + typed confirm). */
        <Card className="bg-iv-danger-subtle">
          <CardHeader>
            <CardTitle as="h2" className="flex items-center gap-2 text-base text-iv-danger-muted">
              <AlertTriangle aria-hidden="true" className="size-4" />
              Danger zone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={openDelete} noValidate className="space-y-4">
              <div>
                <p className="text-sm font-medium text-foreground">Deactivate organization</p>
                <p className="text-sm text-muted-foreground">
                  This deactivates <span className="font-medium text-foreground">{ORG_NAME}</span>{" "}
                  and signs out its members. Nothing is permanently deleted — an owner can restore
                  it later. Only an owner can do this.
                </p>
              </div>
              <FormField
                id="delete-reason"
                label="Reason"
                required
                description="Recorded on the deactivation."
                error={reasonError}
              >
                <Input
                  name="reason"
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Consolidating into another organization"
                />
              </FormField>
              <Button type="submit" variant="destructive">
                Deactivate organization
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Deactivation — destructive TYPED confirm (the `confirmation` boolean; not colour-only). */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate this organization?</DialogTitle>
            <DialogDescription>
              <span className="font-semibold text-foreground">{ORG_NAME}</span> and its members will
              lose access until it’s restored. To confirm, type{" "}
              <span className="font-semibold text-foreground">{DELETE_PHRASE}</span> below.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-start gap-2 rounded-md border border-iv-warning-muted/40 bg-iv-warning-subtle px-3 py-2 text-sm text-iv-warning-muted">
            <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <p>Nothing is permanently deleted — an owner can restore this organization later.</p>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="delete-confirm" className="block text-sm font-medium text-foreground">
              Type {DELETE_PHRASE} to confirm
            </label>
            <Input
              id="delete-confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              autoComplete="off"
              placeholder={DELETE_PHRASE}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={confirmText !== DELETE_PHRASE}
              onClick={onDelete}
            >
              Deactivate organization
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restore confirm. */}
      <Dialog open={restoreOpen} onOpenChange={setRestoreOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore this organization?</DialogTitle>
            <DialogDescription>
              <span className="font-semibold text-foreground">{ORG_NAME}</span> and its members will
              regain access. If its web address was reused, a new one is generated.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setRestoreOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={onRestore}>
              Restore organization
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
