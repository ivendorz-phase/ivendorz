// Shared create/edit surface for P-VND-09 Spec Library entries — one Dialog component driving both
// the toolbar "New entry" trigger (create) and each row's "Edit" trigger (edit mode via `entry`).
// Binds ONLY the frozen `marketplace.create_spec_library_entry.v1` / `update_spec_library_entry.v1`
// request fields (Doc-4D PassB §D7.2): `name` (required), `summary` (optional), `category_id`
// (optional FK → categories). Unlike Ads (no update contract), Spec Library Entry has a real,
// symmetric create/update pair, so editing an existing entry here is genuinely grounded, not
// invented. All fields disabled in the presentation phase — saving connects in the integration
// phase; native textarea is the sanctioned interim for the kit `Textarea` gap ([ESC-7B-TEXTAREA]).
// Uncontrolled Radix Dialog (no local state) — RSC-friendly even though the primitive is a client
// component internally.
import type { ReactNode } from "react";
import { Button } from "@/frontend/primitives/button";
import { FormField } from "@/frontend/components/form-field";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/frontend/primitives/dialog";
import { PresentationFormNote } from "../shared";
import type { SpecLibraryEntryView } from "./types";

// Matches kit `Input`'s full class string (contact-form.tsx precedent) — RV-0110 finding 5 /
// RV-0110 Review-B MINOR: the shorter string (also present in product-content-form.tsx, untouched
// here — out of scope) omits `text-iv-ink-strong`, so entered text would render off-token once
// enabled in the integration phase.
const TEXTAREA_CLASS =
  "flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-iv-ink-strong shadow-iv-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-destructive";

export interface SpecEntryDialogProps {
  trigger: ReactNode;
  /** Present = edit mode (`update_spec_library_entry.v1`); absent = create (`create_spec_library_entry.v1`). */
  entry?: SpecLibraryEntryView;
}

export function SpecEntryDialog({ trigger, entry }: SpecEntryDialogProps) {
  const isEdit = Boolean(entry);

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit spec entry" : "New spec entry"}</DialogTitle>
          <DialogDescription>
            Reusable specification entries can be linked to any of your products from the product
            editor.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" aria-label={isEdit ? "Edit spec entry" : "New spec entry"}>
          <FormField
            id="spec-entry-name"
            label="Name"
            required
            inputProps={{
              name: "name",
              defaultValue: entry?.name ?? "",
              placeholder: "e.g. ISO 9001 quality requirements",
              disabled: true,
            }}
          />
          <FormField id="spec-entry-summary" label="Summary" description="Optional.">
            <textarea
              id="spec-entry-summary"
              name="summary"
              defaultValue={entry?.summary ?? ""}
              disabled
              className={TEXTAREA_CLASS}
            />
          </FormField>
          <FormField
            id="spec-entry-category"
            label="Category"
            description="Optional — links this entry to a taxonomy category."
            inputProps={{
              name: "category_id",
              defaultValue: entry?.category_id ?? "",
              disabled: true,
            }}
          />
          <PresentationFormNote />
        </form>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" disabled>
            {isEdit ? "Save changes" : "Create entry"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
