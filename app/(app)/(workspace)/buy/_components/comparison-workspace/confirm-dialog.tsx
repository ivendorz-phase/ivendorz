"use client";

// Comparison Workspace — a small reusable confirm/info dialog controller over the kit `Dialog` primitive
// (no new dialog primitive is coined). Used by the leave guard, the two reset actions, and the vendor-
// removal confirm (§2.11A.8/.9/.11). A `null` cancel label makes it a single-button INFO dialog (e.g. the
// keyboard-shortcuts help). Session-local only — nothing here persists or is written to the server.

import { type ReactNode, useCallback, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/frontend/primitives/dialog";
import { Button } from "@/frontend/primitives/button";

export interface ConfirmConfig {
  title: string;
  description?: ReactNode;
  /** Extra body content rendered below the description (e.g. a shortcuts list). */
  body?: ReactNode;
  /** Confirm button label. Omit + `cancelLabel: null` for a single-button info dialog. */
  confirmLabel?: string;
  /** `null` → single-button info dialog (no cancel, no confirm action). */
  cancelLabel?: string | null;
  /** Style the confirm button as destructive (e.g. leave-without-saving, remove vendor). */
  danger?: boolean;
  onConfirm?: () => void;
}

export function useConfirmDialog() {
  const [config, setConfig] = useState<ConfirmConfig | null>(null);

  const confirm = useCallback((next: ConfirmConfig) => setConfig(next), []);
  const close = useCallback(() => setConfig(null), []);

  const onConfirm = useCallback(() => {
    config?.onConfirm?.();
    setConfig(null);
  }, [config]);

  const infoOnly = config?.cancelLabel === null;

  const dialogNode: ReactNode = (
    <Dialog open={config !== null} onOpenChange={(open) => !open && close()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{config?.title}</DialogTitle>
          {config?.description ? <DialogDescription>{config.description}</DialogDescription> : null}
        </DialogHeader>
        {config?.body ? <div className="text-sm text-foreground">{config.body}</div> : null}
        <DialogFooter>
          {infoOnly ? (
            <Button type="button" onClick={close}>
              Close
            </Button>
          ) : (
            <>
              <Button type="button" variant="outline" onClick={close}>
                {config?.cancelLabel ?? "Cancel"}
              </Button>
              <Button
                type="button"
                variant={config?.danger ? "destructive" : "primary"}
                onClick={onConfirm}
              >
                {config?.confirmLabel ?? "Confirm"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return { confirm, close, dialogNode };
}
