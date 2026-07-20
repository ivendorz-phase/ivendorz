// DS-W1 · Project Portfolio editor — authoring form for one case study.
//
// FIELD PROVENANCE (see `types.ts`): the case-study fields are OWNER-RULED under plan G5 and are
// carried in the frozen `content_jsonb` until the `[ESC-6-SCHEMA-SHOWCASE]` additive patch binds them
// as columns; `display_order` and `is_visible` are the FROZEN interim columns. Nothing here coins a
// status enum — visibility is the frozen boolean.
//
// Presentation-only: uncontrolled inputs, no client state, no mock business logic. Save/Publish are
// disabled because `update_showcase_project.v1` / `publish_showcase_project.v1` are unimplemented —
// an honest pre-wiring state, never a fake success. Publishing emits NO event (none exists to emit —
// Doc-5D Pass2:115). RSC-friendly (no hooks).
import { Button } from "@/frontend/primitives/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/primitives/card";
import { Input } from "@/frontend/primitives/input";
import { FormField } from "@/frontend/components/form-field";
import { PresentationFormNote, VENDOR_SELECT_CLASS, vendorTextareaClass } from "../shared";
import type { ShowcaseProjectView } from "./types";

const TEXTAREA_CLASS = vendorTextareaClass("min-h-[80px]");

export interface ProjectFormProps {
  project?: ShowcaseProjectView;
}

export function ProjectForm({ project }: ProjectFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Project details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField id="project-title" label="Title">
          <Input
            id="project-title"
            name="title"
            defaultValue={project?.title ?? ""}
            placeholder="e.g. High-pressure valve skid replacement"
          />
        </FormField>

        <FormField
          id="project-sector"
          label="Sector"
          description="The industry this project served."
        >
          <Input id="project-sector" name="sector" defaultValue={project?.sector ?? ""} />
        </FormField>

        <FormField
          id="project-client"
          label="Client descriptor"
          description="Describe the client type — for example “state-owned fertilizer producer”. Do not name the client."
        >
          <Input
            id="project-client"
            name="client_descriptor"
            defaultValue={project?.client_descriptor ?? ""}
          />
        </FormField>

        <FormField
          id="project-period"
          label="Year or period"
          description="When the work was delivered."
        >
          <Input id="project-period" name="period" defaultValue={project?.period ?? ""} />
        </FormField>

        <FormField id="project-summary" label="Summary">
          <textarea
            id="project-summary"
            name="summary"
            rows={3}
            defaultValue={project?.summary ?? ""}
            className={TEXTAREA_CLASS}
          />
        </FormField>

        <FormField
          id="project-scope"
          label="Scope highlights"
          description="One per line. These render as the case-study list on your public showcase."
        >
          <textarea
            id="project-scope"
            name="scope_highlights"
            rows={3}
            defaultValue={project?.scope_highlights?.join("\n") ?? ""}
            className={TEXTAREA_CLASS}
          />
        </FormField>

        <FormField
          id="project-gallery"
          label="Gallery"
          description="Image uploads are not available yet."
        >
          {/* Blob upload rides M0 storage (`file_ref`); the vendor-side upload seam is the open
              `ESC-7-API/upload`. Disabled — never a fabricated image source. */}
          <Button id="project-gallery" type="button" variant="outline" size="sm" disabled>
            Add images
          </Button>
        </FormField>

        <FormField
          id="project-order"
          label="Display order"
          description="Lower numbers appear first."
        >
          <Input
            id="project-order"
            name="display_order"
            inputMode="numeric"
            defaultValue={project?.display_order ?? ""}
          />
        </FormField>

        <FormField
          id="project-visibility"
          label="Visibility"
          description="Drafts stay private to your organization. Published projects appear on your public showcase."
        >
          <select
            id="project-visibility"
            name="is_visible"
            defaultValue={project?.is_visible ? "true" : "false"}
            className={VENDOR_SELECT_CLASS}
          >
            <option value="false">Draft — private to your organization</option>
            <option value="true">Published — public case study</option>
          </select>
        </FormField>

        <div className="flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
          <PresentationFormNote />
          <div className="flex gap-2">
            <Button type="button" variant="outline" disabled>
              Save
            </Button>
            <Button type="button" disabled>
              Publish
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
