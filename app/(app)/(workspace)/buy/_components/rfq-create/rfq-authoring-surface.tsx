"use client";

// P-BUY-RFQ — the authoring surface. ONE client component owns the whole draft; every field below
// is controlled from this state object (owner rulings D1/D2/D3, 2026-07-24).
//
// SHAPE (D1): gated Zone 1 → anchored single-canvas workspace → review-and-submit gate.
// A conventional nine-step wizard is NOT implemented.
//
// STILL PRESENTATION-ONLY: no `create_rfq` / `update_rfq` / `submit_rfq` (Wave 4, PARKED). Save is
// simulated and says so; nothing is written to the server or to `localStorage` (D2). The browser
// never calls a Doc-5 contract and never sets `Iv-Active-Organization` (Inv #5 / Doc-7C SR3).

import * as React from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/frontend/primitives/dialog";
import { ErrorState } from "@/frontend/components/error-state";
import { Breadcrumbs } from "../../../../_components/shell";
import { Callout } from "../callout";
import { UploadArea } from "./upload-area";
import { CommunicationSection } from "./communication-section";
import { TermsConditionsSection } from "./terms-conditions-section";
import { RfqPreviewDocument } from "./rfq-preview-document";
import { RfqZoneOne } from "./rfq-zone-one";
import { RfqCanvasRail, type RailSection } from "./rfq-canvas-rail";
import { RfqReadinessPanel } from "./rfq-readiness-panel";
import { RfqActionBar, type SaveState } from "./rfq-action-bar";
import { RequirednessLegend } from "./rfq-requiredness";
import {
  TitledCard,
  RequirementSection,
  TechnicalSection,
  DeliverySection,
  VendorSection,
  BudgetSection,
} from "./rfq-sections";
import {
  blockersBySection,
  canStartDraft,
  evaluateReadiness,
  meaningfulItemRows,
  usableAttachments,
  type RfqCheck,
  type RfqSectionId,
} from "./rfq-readiness";
import type { RfqCreateData, RfqDraftForm } from "./rfq-form-models";

const SECTION_DOM_ID: Record<RfqSectionId, string> = {
  requirement: "rfq-section-requirement",
  specification: "rfq-section-specification",
  attachments: "rfq-section-attachments",
  terms: "rfq-section-terms",
  delivery: "rfq-section-delivery",
  vendor: "rfq-section-vendor",
  value: "rfq-section-value",
  communication: "rfq-section-communication",
};

export function RfqAuthoringSurface({
  data,
  minScopeChars,
}: {
  data: RfqCreateData;
  /** POLICY `rfq.min_scope_chars` — SERVER-PROVIDED. Never hardcode it in a component. */
  minScopeChars: number;
}) {
  const [form, setForm] = React.useState<RfqDraftForm>(data.form);
  const [savedForm, setSavedForm] = React.useState<RfqDraftForm>(data.form);
  const [inCanvas, setInCanvas] = React.useState(() => canStartDraft(data.form));
  const [saveState, setSaveState] = React.useState<SaveState>("idle");
  const [lastSavedLabel, setLastSavedLabel] = React.useState<string>();
  const [activeSection, setActiveSection] = React.useState<RfqSectionId>("requirement");
  const [discardOpen, setDiscardOpen] = React.useState(false);
  const [reviewOpen, setReviewOpen] = React.useState(false);

  const dirty = React.useMemo(
    () => JSON.stringify(form) !== JSON.stringify(savedForm),
    [form, savedForm],
  );

  const update = React.useCallback((patch: Partial<RfqDraftForm>) => {
    setForm((current) => ({ ...current, ...patch }));
    setSaveState("idle");
  }, []);

  const readiness = React.useMemo(
    () => evaluateReadiness(form, minScopeChars),
    [form, minScopeChars],
  );

  // Leave guard (D2). The in-app intercept lives on the links this surface owns; `beforeunload`
  // covers reload/close. There is no autosave, so leaving dirty really does lose the changes.
  React.useEffect(() => {
    if (!dirty) return;
    function onBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  // Scroll-spy for the rail.
  React.useEffect(() => {
    if (!inCanvas) return;
    const ids = Object.entries(SECTION_DOM_ID);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const hit = ids.find(([, domId]) => domId === entry.target.id);
          if (hit) setActiveSection(hit[0] as RfqSectionId);
        }
      },
      { rootMargin: "-10% 0px -75% 0px" },
    );
    for (const [, domId] of ids) {
      const node = document.getElementById(domId);
      if (node) observer.observe(node);
    }
    return () => observer.disconnect();
  }, [inCanvas]);

  function jumpTo(section: RfqSectionId, focusId?: string) {
    document.getElementById(SECTION_DOM_ID[section])?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    if (focusId) {
      window.setTimeout(() => {
        document.getElementById(focusId)?.focus({ preventScroll: true });
      }, 320);
    }
  }

  function onReadinessJump(check: RfqCheck) {
    if (check.inZoneOne) {
      setInCanvas(false);
      window.scrollTo({ top: 0 });
      return;
    }
    jumpTo(check.section, check.focusId);
  }

  // Simulated save. At Phase 4 this becomes one `update_rfq` with `expected_version_no` and the
  // governed revision-reason interaction — never a keystroke autosave (D2).
  function saveDraft() {
    setSaveState("saving");
    window.setTimeout(() => {
      setSavedForm(form);
      setSaveState("saved");
      setLastSavedLabel(
        new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }),
      );
    }, 500);
  }

  function discardChanges() {
    setForm(savedForm);
    setSaveState("idle");
    setDiscardOpen(false);
  }

  const railSections: RailSection[] = React.useMemo(() => {
    const blockers = blockersBySection(readiness);
    const attachments = usableAttachments(form).length;
    const terms = (form.termsAndConditions ?? []).filter((t) => t.trim().length > 0).length;
    return [
      {
        id: "requirement",
        label: "Requirement",
        complete: Boolean(form.categoryId) && (form.workNature ?? []).length > 0,
        blockers: blockers.requirement ?? 0,
      },
      {
        id: "specification",
        label: "Specification",
        complete: (form.scopeText ?? "").trim().length > 0,
        blockers: blockers.specification ?? 0,
      },
      {
        id: "attachments",
        label: "Attachments",
        complete: attachments > 0,
        blockers: blockers.attachments ?? 0,
      },
      { id: "terms", label: "Terms", complete: terms > 0, blockers: blockers.terms ?? 0 },
      {
        id: "delivery",
        label: "Delivery",
        complete: Boolean(form.district),
        blockers: blockers.delivery ?? 0,
      },
      {
        id: "vendor",
        label: "Vendor routing",
        complete: Boolean(form.routingMode),
        blockers: blockers.vendor ?? 0,
      },
      {
        id: "value",
        label: "Estimated value",
        complete: (form.budget ?? "").trim().length > 0,
        blockers: blockers.value ?? 0,
      },
      {
        id: "communication",
        label: "Communication",
        complete: Boolean(form.contactPersonName),
        blockers: blockers.communication ?? 0,
      },
    ];
  }, [form, readiness]);

  if (!inCanvas) {
    return (
      <>
        <Breadcrumbs
          items={[{ label: "Dashboard", href: "/buy/dashboard" }, { label: "New RFQ" }]}
          className="mb-4"
        />
        <RfqZoneOne form={form} onChange={update} onContinue={() => setInCanvas(true)} />
      </>
    );
  }

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/buy/dashboard" },
          { label: "RFQs", href: "/buy/rfqs" },
          { label: "New RFQ" },
        ]}
        className="mb-4"
      />

      <header className="mb-4 flex flex-wrap items-start gap-3 border-b border-border pb-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Create a request for quotation
          </h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
            <span>Draft</span>
            <span aria-hidden>·</span>
            <span className="font-medium text-foreground">{form.categoryLabel ?? "—"}</span>
            <span aria-hidden>·</span>
            <span className="font-mono text-xs">{(form.workNature ?? []).join(" · ") || "—"}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setInCanvas(false);
                window.scrollTo({ top: 0 });
              }}
            >
              Change
            </Button>
          </p>
        </div>
      </header>

      {data.submission === "error" ? (
        <ErrorState
          errorClass="DEPENDENCY"
          message="We couldn’t submit your request just now. Your draft is safe — please try again."
          className="mb-4"
          action={
            <Button asChild variant="secondary" size="sm">
              <Link href="/buy/rfqs/new">Try again</Link>
            </Button>
          }
        />
      ) : null}

      <Callout icon={<Lock aria-hidden />} className="mb-4">
        <span className="font-medium text-foreground">Privacy by Design</span> — your RFQ is never
        publicly published.
      </Callout>

      <RequirednessLegend className="mb-4" />

      <div className="grid grid-cols-1 items-start gap-5 pb-6 lg:grid-cols-[minmax(0,1fr)_17rem] xl:grid-cols-[12rem_minmax(0,1fr)_17rem]">
        <RfqCanvasRail
          sections={railSections}
          activeId={activeSection}
          onJump={(id) => jumpTo(id)}
          className="hidden xl:block"
        />

        <div className="flex min-w-0 flex-col gap-4">
          <div id={SECTION_DOM_ID.requirement} className="scroll-mt-4">
            <RequirementSection form={form} onChange={update} />
          </div>
          <div id={SECTION_DOM_ID.specification} className="scroll-mt-4">
            <TechnicalSection form={form} onChange={update} minScopeChars={minScopeChars} />
          </div>
          <div id={SECTION_DOM_ID.attachments} className="scroll-mt-4">
            <TitledCard title="Attachments">
              <UploadArea
                attachments={form.attachments}
                onChange={(attachments) => update({ attachments })}
              />
            </TitledCard>
          </div>
          <div id={SECTION_DOM_ID.terms} className="scroll-mt-4">
            <TermsConditionsSection
              terms={form.termsAndConditions}
              onChange={(termsAndConditions) => update({ termsAndConditions })}
            />
          </div>
          <div id={SECTION_DOM_ID.delivery} className="scroll-mt-4">
            <DeliverySection form={form} onChange={update} />
          </div>
          <div id={SECTION_DOM_ID.vendor} className="scroll-mt-4">
            <VendorSection form={form} onChange={update} />
          </div>
          <div id={SECTION_DOM_ID.value} className="scroll-mt-4">
            <BudgetSection form={form} onChange={update} />
          </div>
          <div id={SECTION_DOM_ID.communication} className="scroll-mt-4">
            <CommunicationSection form={form} onChange={update} />
          </div>
        </div>

        <RfqReadinessPanel readiness={readiness} onJump={onReadinessJump} className="min-w-0" />
      </div>

      <RfqActionBar
        dirty={dirty}
        saveState={saveState}
        lastSavedLabel={lastSavedLabel}
        readyToSubmit={readiness.state === "ready"}
        onSave={saveDraft}
        onDiscard={() => setDiscardOpen(true)}
        onReview={() => setReviewOpen(true)}
      />

      {/* Discard confirm (D2). */}
      <Dialog open={discardOpen} onOpenChange={setDiscardOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Discard your changes?</DialogTitle>
            <DialogDescription>
              Everything typed since your last save is removed. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setDiscardOpen(false)}>
              Keep editing
            </Button>
            <Button type="button" onClick={discardChanges}>
              Discard changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review — the whole request at a glance, split by the disclosure boundary. */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="flex h-[92dvh] w-[96vw] max-w-5xl flex-col gap-0 overflow-hidden p-0">
          <DialogHeader className="border-b border-border px-6 py-4">
            <DialogTitle>Review your request</DialogTitle>
            <DialogDescription>
              Read-only — the whole request at a glance. Everything above the lock line is what an
              invited vendor receives; below it is internal and stays with you.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto bg-slate-100 px-4 py-6 sm:px-6">
            <RfqPreviewDocument form={form} />
          </div>
          <DialogFooter className="items-center gap-3 border-t border-border px-6 py-4 sm:justify-between">
            <p className="text-xs text-muted-foreground">
              {readiness.unmetBlockers.length > 0 ? (
                <>
                  <b className="text-destructive">
                    {readiness.unmetBlockers.length} item
                    {readiness.unmetBlockers.length === 1 ? "" : "s"} still required
                  </b>{" "}
                  — {readiness.unmetBlockers.map((b) => b.label).join("; ")}
                </>
              ) : (
                "The platform re-checks the submission gate — this preview is guidance, not the decision."
              )}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" variant="outline" onClick={() => setReviewOpen(false)}>
                Back to editing
              </Button>
              <Button type="button" disabled={readiness.unmetBlockers.length > 0}>
                Submit RFQ
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/** Exported for the review dialog's item count and for tests. */
export { meaningfulItemRows };
