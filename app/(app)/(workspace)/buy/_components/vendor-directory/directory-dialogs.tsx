"use client";

// My Vendor Directory — removal-like confirmation dialogs (owner directive D4). PRESENTATION-ONLY.
//
// NO HARD DELETE exists anywhere (rule 7): the directory offers only "Remove from Preferred" (clears
// the frozen `vendor_favorites` flag — the record & relationship remain) and "Archive" (the frozen
// `active → archived` lifecycle — recoverable). Both are removal-like and gate on the D4 persona
// (authorized member only); both confirm before acting. Persistence is PARKED — the confirm applies
// LOCAL working state only; `ops.clear_vendor_favorite.v1` / `ops.archive_private_vendor.v1` wire
// later (Doc-4F §F4). Buyer-private throughout (Inv #11).

import { Info } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/frontend/primitives/dialog";
import type { DirectoryWorkingVendor } from "./working-model";

export function RemovePreferredDialog({
  vendor,
  onOpenChange,
  onConfirm,
}: {
  vendor: DirectoryWorkingVendor | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (vendor: DirectoryWorkingVendor) => void;
}) {
  return (
    <Dialog open={vendor !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove from Preferred?</DialogTitle>
          <DialogDescription>
            {vendor ? (
              <>
                <span className="font-medium text-foreground">{vendor.name}</span> will be removed
                from your ⭐ Preferred view. The vendor <strong>stays in your directory</strong> —
                this only clears the favorite flag, it is <strong>not</strong> a deletion.
              </>
            ) : null}
          </DialogDescription>
        </DialogHeader>
        <p className="flex items-start gap-2 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
          <Info aria-hidden className="mt-0.5 size-3.5 shrink-0" />
          Clearing the favorite is an idempotent flag change — the record and relationship remain.
          Removal-like actions are for an authorized member (pending a Doc-2 §7 ruling).
        </p>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" size="sm">
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => vendor && onConfirm(vendor)}
          >
            Remove from Preferred
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ArchiveDialog({
  vendor,
  onOpenChange,
  onConfirm,
}: {
  vendor: DirectoryWorkingVendor | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (vendor: DirectoryWorkingVendor) => void;
}) {
  return (
    <Dialog open={vendor !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Archive this vendor?</DialogTitle>
          <DialogDescription>
            {vendor ? (
              <>
                <span className="font-medium text-foreground">{vendor.name}</span> will move to
                Archived. This is a soft-delete — <strong>not a hard delete</strong>. The record,
                notes, ratings and history are kept and it can be restored.
              </>
            ) : null}
          </DialogDescription>
        </DialogHeader>
        <p className="flex items-start gap-2 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
          <Info aria-hidden className="mt-0.5 size-3.5 shrink-0" />
          iVendorz never hard-deletes a vendor through My Vendor Directory — the lifecycle moves
          active → archived, and back on restore.
        </p>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" size="sm">
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => vendor && onConfirm(vendor)}
          >
            Archive vendor
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
