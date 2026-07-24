"use client";

// P-BUY-RFQ (P-BUY-07) Phase 2 — THE NEW-RFQ CLIENT SURFACE (D1). A single client form surface that
// owns ONE `RfqDraftForm` state object (the frozen model, unchanged) and derives all per-field and
// per-section validation from the Doc-3 §1.2 submission FIXED-set mirror. Two zones:
//   • Zone 1 gate — locked entry; Continue disabled until `category_id` AND ≥1 `work_nature[]`
//     (Doc-4E §E4.1 marks both Required). No draft can exist server-side without them.
//   • Main canvas — section rail (left) · 8 sections (center) · readiness panel (right).
//
// NO PRODUCTION WRITES (Wave 4 PARKED): Save/Submit are SIMULATED with explicit "simulated" copy; no
// fetch/XHR/sendBeacon; category data runs on the stub adapter; upload is a presentation list. The
// browser never sets `Iv-Active-Organization` (Inv #5) and never coins a field (Inv #9). D4 guardrails
// hold: no invitation/targeting, no matching weights, no public/private toggle (Privacy callout stays),
// no payment/incoterms/tax, no AI drafting; "Preferred vendor" is a hint.
//
// D6: the category picker is the CANONICAL kit `Combobox` (promoted from this prototype, owner ruling
// D6 2026-07-24) — the RFQ layer owns the category data/rules; the kit owns the interaction.

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ChevronDown, Circle, Lock, Save, AlertCircle } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { Card, CardContent } from "@/frontend/primitives/card";
import { Input } from "@/frontend/primitives/input";
import { Combobox, type ComboboxOption, type ComboboxStatus } from "@/frontend/primitives/combobox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/frontend/primitives/dialog";
import { cn } from "@/frontend/lib/cn";
import { Callout } from "../callout";
import { Select, CheckboxRow, Textarea } from "../form-controls";
import {
  ROUTING_MODE_OPTIONS,
  FINANCIAL_TIER_OPTIONS,
  CONDITION_OPTIONS,
  DELIVERY_SITE_OPTIONS,
  URGENCY_OPTIONS,
  CONTACT_TIME_OPTIONS,
} from "./rfq-options";
import { STUB_CATEGORY_GROUPS, categoryPathById } from "./rfq-draft-seams";
import { PROCUREMENT_MODES } from "./rfq-procurement-modes";
import { RequirednessBadge, RequirednessLegend } from "./rfq-requiredness";
import { RFQ_SECTIONS, SectionRail, sectionAnchorId } from "./section-rail";
import { ReadinessPanel } from "./readiness-panel";
import { RfqPreviewDocument } from "./rfq-preview-document";
import { ItemRequirementsTable } from "./item-requirements-table";
import { UploadArea } from "./upload-area";
import { TermsConditionsSection } from "./terms-conditions-section";
import {
  evaluateReadiness,
  scopeLength,
  parseAmount,
  type ReadinessItem,
  type RfqSectionId,
} from "./rfq-draft-validation";
import type { RfqDraftForm as RfqDraftFormModel, WorkNature, RoutingMode } from "./rfq-form-models";

// Delivery districts — dev-doc presentation list (delivery_geography is jsonb; coins no enum).
const DISTRICT_OPTIONS = [
  "Dhaka",
  "Gazipur",
  "Narayanganj",
  "Chattogram",
  "Khulna",
  "Rajshahi",
  "Sylhet",
].map((d) => ({ value: d, label: d }));

function nowLabel() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/** A canvas section card with an anchor id + a requiredness badge on the right of its header. */
function CanvasSection({
  id,
  title,
  badge,
  children,
}: {
  id: RfqSectionId;
  title: string;
  badge: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card id={sectionAnchorId(id)} className="scroll-mt-4">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <span className="flex-1" />
        {badge}
      </div>
      <CardContent className="p-4">{children}</CardContent>
    </Card>
  );
}

function FieldLabel({
  htmlFor,
  children,
  badge,
}: {
  htmlFor?: string;
  children: React.ReactNode;
  badge?: React.ReactNode;
}) {
  return (
    <div className="mb-1.5 flex items-center gap-2">
      <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
        {children}
      </label>
      {badge}
    </div>
  );
}

export interface RfqDraftFormProps {
  /** POLICY `rfq.min_scope_chars` — SERVER-PROVIDED via the seam (never hardcoded in a field). */
  minScopeChars: number;
  /** When true, the simulated Save resolves to a FAILURE state (server-driven demo seam, no server). */
  simulateSaveFailure?: boolean;
}

export function RfqDraftForm({ minScopeChars, simulateSaveFailure }: RfqDraftFormProps) {
  const router = useRouter();

  // ── the single form state object (the frozen model, unchanged) ──
  const [form, setForm] = React.useState<RfqDraftFormModel>({ currency: "BDT" });
  const [categoryPath, setCategoryPath] = React.useState("");
  const [selectedMode, setSelectedMode] = React.useState<string | null>(null);

  // ── UI-only state (presentation; never persisted) ──
  const [view, setView] = React.useState<"zone1" | "canvas">("zone1");
  const [dirty, setDirty] = React.useState(false);
  const [savedAt, setSavedAt] = React.useState<string | null>(null);
  const [saveState, setSaveState] = React.useState<"idle" | "saving" | "error">("idle");
  const [activeSection, setActiveSection] = React.useState<RfqSectionId | null>("requirement");
  const [modal, setModal] = React.useState<null | "leave" | "discard" | "review">(null);
  const [pendingHref, setPendingHref] = React.useState<string | null>(null);
  const [comboStatus] = React.useState<ComboboxStatus>("ready");
  const [submittedSimulated, setSubmittedSimulated] = React.useState(false);
  // Bumped on discard to remount the self-stated reused widgets (item table / terms).
  const [resetKey, setResetKey] = React.useState(0);

  // First emission from a reused self-stated widget is its mount echo — not a user edit.
  const itemsMounted = React.useRef(false);
  const termsMounted = React.useRef(false);

  const categoryOptions: ComboboxOption[] = React.useMemo(
    () =>
      STUB_CATEGORY_GROUPS.flatMap((g) =>
        g.items.map((it) => ({
          value: it.id,
          label: it.label,
          description: it.path,
          group: g.group,
        })),
      ),
    [],
  );

  const snapshot = React.useMemo(
    () => evaluateReadiness(form, minScopeChars),
    [form, minScopeChars],
  );

  const markDirty = React.useCallback(() => {
    setDirty(true);
    setSaveState((s) => (s === "error" ? "idle" : s));
    setSubmittedSimulated(false);
  }, []);

  const patch = React.useCallback(
    (p: Partial<RfqDraftFormModel>) => {
      setForm((f) => ({ ...f, ...p }));
      markDirty();
    },
    [markDirty],
  );

  // ── Zone 1 ──
  const canContinue = !!form.categoryId && (form.workNature ?? []).length > 0;

  function selectCategory(value: string | null, option: ComboboxOption | null) {
    if (!value || !option) {
      setForm((f) => ({ ...f, categoryId: undefined, categoryLabel: undefined }));
      setCategoryPath("");
    } else {
      setForm((f) => ({ ...f, categoryId: value, categoryLabel: option.label }));
      setCategoryPath(categoryPathById(value));
    }
    markDirty();
  }

  function selectMode(modeKey: string, workNature: WorkNature[]) {
    setSelectedMode(modeKey);
    patch({ workNature });
  }

  // ── navigation / scroll-spy ──
  const navigate = React.useCallback((section: RfqSectionId, focusId?: string) => {
    const el = document.getElementById(sectionAnchorId(section));
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => {
      const target = focusId
        ? document.getElementById(focusId)
        : el?.querySelector<HTMLElement>(
            "input,select,textarea,[contenteditable=true],[role=combobox]",
          );
      target?.focus({ preventScroll: true });
    }, 320);
  }, []);

  const jumpToItem = React.useCallback(
    (item: ReadinessItem) => navigate(item.section, item.focusId),
    [navigate],
  );

  React.useEffect(() => {
    if (view !== "canvas") return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id.replace(/^rfq-sec-/, "") as RfqSectionId;
          setActiveSection(id);
        });
      },
      { rootMargin: "-10% 0px -75% 0px" },
    );
    RFQ_SECTIONS.forEach((s) => {
      const el = document.getElementById(sectionAnchorId(s.id));
      if (el) observer.observe(el);
    });
    // Bottom-of-page fallback: the final short section can't scroll high enough to enter the
    // observer's activation band, so it would never light up. When the page bottoms out, activate
    // the last section directly so the rail reflects what's actually in view.
    const onScroll = () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        setActiveSection(RFQ_SECTIONS[RFQ_SECTIONS.length - 1].id);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [view]);

  // ── D2 — leave guards ──
  React.useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  function guardedNavigate(href: string) {
    if (dirty) {
      setPendingHref(href);
      setModal("leave");
    } else {
      router.push(href);
    }
  }

  // ── D2 — simulated save (no server; explicit "simulated" copy) ──
  function simulateSave(after?: () => void) {
    setSaveState("saving");
    window.setTimeout(() => {
      if (simulateSaveFailure) {
        setSaveState("error");
        return;
      }
      setSaveState("idle");
      setDirty(false);
      setSavedAt(nowLabel());
      after?.();
    }, 700);
  }

  function discardChanges() {
    setForm({ currency: "BDT" });
    setCategoryPath("");
    setSelectedMode(null);
    setDirty(false);
    setSaveState("idle");
    setSubmittedSimulated(false);
    itemsMounted.current = false;
    termsMounted.current = false;
    setResetKey((k) => k + 1);
    setModal(null);
    setView("zone1");
  }

  // ── save-state line copy ──
  const saveLine1 = dirty ? "Unsaved changes" : savedAt ? "All changes saved" : "No changes yet";
  const saveLine2 =
    saveState === "error"
      ? "Couldn’t save — your changes are still here. Try again."
      : savedAt
        ? dirty
          ? `Last saved ${savedAt}`
          : `Last saved ${savedAt} · simulated — nothing left the browser`
        : "Draft not saved yet";

  // ════════════════════════════════════════════════════════════════════════════════════════════
  // ZONE 1 — the gate
  // ════════════════════════════════════════════════════════════════════════════════════════════
  if (view === "zone1") {
    return (
      <div className="mx-auto max-w-3xl pb-16">
        <Breadcrumb onNavigate={guardedNavigate} />

        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">What do you need?</h1>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            Two answers start your request. Everything else is authored on one canvas afterwards,
            and you can change these at any time before you submit.
          </p>
        </div>

        <Card className="mt-6">
          <CardContent className="p-6">
            <p className="mb-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-iv-brand-600">
              <span className="inline-flex size-5 items-center justify-center rounded-full bg-iv-brand-600 text-2xs text-white">
                1
              </span>
              Start your RFQ
            </p>

            {/* Category — canonical kit combobox (D6) */}
            <div className="mb-5">
              <FieldLabel htmlFor="rfq-category" badge={<RequirednessBadge level="start" />}>
                Category
              </FieldLabel>
              <Combobox
                id="rfq-category"
                options={categoryOptions}
                value={form.categoryId ?? null}
                onValueChange={selectCategory}
                status={comboStatus}
                placeholder="Search the category tree…"
                emptyMessage={(q) =>
                  `No categories match ${q ? `“${q}”` : "your search"}. Try a broader word, e.g. “pump” or “cable”.`
                }
                aria-describedby="rfq-category-help"
              />
              <p id="rfq-category-help" className="mt-1.5 text-xs text-muted-foreground">
                Type to search, ↑ ↓ to move, Enter to select, Esc to close. Categories shown are{" "}
                <b className="font-medium">illustrative</b> — the live picker reads{" "}
                <code className="font-mono text-2xs">marketplace.list_categories.v1</code>.
              </p>
              {form.categoryId ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  Selected: <span className="font-medium text-foreground">{categoryPath}</span>
                </p>
              ) : null}
            </div>

            {/* Procurement mode → work_nature[] */}
            <div>
              <FieldLabel badge={<RequirednessBadge level="start" />}>
                What kind of work is this?
              </FieldLabel>
              <div
                role="group"
                aria-label="Procurement mode"
                className="grid grid-cols-2 gap-2 sm:grid-cols-3"
              >
                {PROCUREMENT_MODES.map((m) => {
                  const pressed = selectedMode === m.key;
                  return (
                    <button
                      key={m.key}
                      type="button"
                      aria-pressed={pressed}
                      onClick={() => selectMode(m.key, m.workNature)}
                      className={cn(
                        "rounded-lg border p-2.5 text-left transition-colors",
                        pressed
                          ? "border-iv-brand-500 bg-iv-brand-50 ring-1 ring-iv-brand-500"
                          : "border-border bg-card hover:border-iv-brand-300",
                      )}
                    >
                      <span className="block text-sm font-semibold text-foreground">{m.label}</span>
                      <span className="mt-0.5 block font-mono text-2xs text-muted-foreground">
                        {m.workNature.join(" · ")}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 rounded-md border border-border bg-secondary/40 px-3 py-2 text-xs text-muted-foreground">
                Stored as{" "}
                <span className="font-mono font-semibold text-foreground">work_nature[]</span> —{" "}
                {(form.workNature ?? []).length > 0 ? (
                  <span className="font-mono">[{(form.workNature ?? []).join(", ")}]</span>
                ) : (
                  "nothing selected yet"
                )}
                . The buyer-facing label maps onto the frozen capability set; it coins nothing.
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-5 flex items-center gap-3">
          <Callout icon={<Lock aria-hidden />} className="flex-1">
            <span className="font-medium text-foreground">Privacy by Design</span> — your RFQ is
            never publicly published.
          </Callout>
          <Button
            type="button"
            disabled={!canContinue}
            onClick={() => {
              if (!canContinue) return; // gate enforced at the handler, not only the disabled attr
              setView("canvas");
              setActiveSection("requirement");
              window.scrollTo(0, 0);
            }}
          >
            Continue
            <ArrowRight aria-hidden />
          </Button>
        </div>
        <p className="mt-2 text-right text-xs text-muted-foreground">
          Continues to the authoring canvas. In production this is where{" "}
          <code className="font-mono">create_rfq</code> mints the draft — not in this build.
        </p>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════════════════════
  // MAIN CANVAS
  // ════════════════════════════════════════════════════════════════════════════════════════════
  const workNatureLabel =
    (form.workNature ?? []).length > 0 ? (form.workNature ?? []).join(" · ") : "—";

  return (
    <div className="pb-4">
      <Breadcrumb onNavigate={guardedNavigate} canvas />

      <div className="mb-4 flex items-start gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Create a request for quotation
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Draft · <span className="font-mono text-foreground">{form.categoryLabel ?? "—"}</span> ·{" "}
            <span className="font-mono text-foreground">{workNatureLabel}</span>
            <button
              type="button"
              onClick={() => setView("zone1")}
              className="ml-2 font-medium text-iv-brand-600 hover:underline"
            >
              Change
            </button>
          </p>
        </div>
        <span className="flex-1" />
        <span className="inline-flex items-center gap-1.5 rounded-full bg-iv-neutral-subtle px-2.5 py-1 text-2xs font-bold uppercase tracking-wide text-muted-foreground">
          <Circle aria-hidden className="size-2.5" />
          Draft
        </span>
      </div>

      {submittedSimulated ? (
        <Callout icon={<AlertCircle aria-hidden />} tone="warning" className="mb-4">
          Simulated submit — no RFQ was created and nothing was sent to a server. Writes are parked
          behind the Wave-4 milestone.
        </Callout>
      ) : null}

      <RequirednessLegend className="mb-4" />

      <div className="grid items-start gap-5 lg:grid-cols-[180px_minmax(0,1fr)] xl:grid-cols-[196px_minmax(0,1fr)_272px]">
        <SectionRail
          statuses={snapshot.sections}
          activeSection={activeSection}
          onNavigate={(id) => navigate(id)}
        />

        {/* ── the 8 sections ── */}
        <div className="flex min-w-0 flex-col gap-4">
          {/* 1 · Requirement */}
          <CanvasSection
            id="requirement"
            title="Requirement"
            badge={<RequirednessBadge level="start" label="Category & work type set in Zone 1" />}
          >
            <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel>Category</FieldLabel>
                <div className="flex items-center gap-2">
                  <span className="min-w-0 truncate font-mono text-sm font-semibold text-foreground">
                    {categoryPath || "—"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setView("zone1")}
                    className="shrink-0 text-xs font-medium text-iv-brand-600 hover:underline"
                  >
                    Change
                  </button>
                </div>
              </div>
              <div>
                <FieldLabel>
                  Work nature{" "}
                  <span className="font-mono text-2xs font-normal text-muted-foreground">
                    work_nature[]
                  </span>
                </FieldLabel>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-semibold text-foreground">
                    {(form.workNature ?? []).length > 0
                      ? `[${(form.workNature ?? []).join(", ")}]`
                      : "—"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setView("zone1")}
                    className="shrink-0 text-xs font-medium text-iv-brand-600 hover:underline"
                  >
                    Change
                  </button>
                </div>
              </div>
            </div>
            <FieldLabel badge={<RequirednessBadge level="optional" />}>
              Item requirements
            </FieldLabel>
            <ItemRequirementsTable
              key={`items-${resetKey}`}
              onRowsChange={(rows) => {
                setForm((f) => ({ ...f, itemRows: rows }));
                if (itemsMounted.current) markDirty();
                else itemsMounted.current = true;
              }}
            />
          </CanvasSection>

          {/* 2 · Specification */}
          <CanvasSection
            id="specification"
            title="Specification"
            badge={<RequirednessBadge level="conditional" label="Attachment or written scope" />}
          >
            <Callout icon={<AlertCircle aria-hidden />} className="mb-4">
              <span className="font-medium text-foreground">Conditional requirement.</span> Doc-3
              §1.2 requires <b>either</b> at least one spec attachment <b>or</b>{" "}
              <code className="font-mono text-2xs">no_formal_spec</code> plus written scope of at
              least the server-provided minimum. The FE never hardcodes the threshold.
            </Callout>
            <div className="mb-4">
              <FieldLabel
                htmlFor="rfq-scope"
                badge={
                  form.noFormalSpec ? (
                    <RequirednessBadge level="submit" />
                  ) : (
                    <RequirednessBadge level="conditional" />
                  )
                }
              >
                Scope &amp; acceptance criteria
              </FieldLabel>
              <Textarea
                id="rfq-scope"
                rows={4}
                className="min-h-24 resize-y"
                value={form.scopeText ?? ""}
                onChange={(e) => patch({ scopeText: e.target.value })}
                placeholder="Specification, scope of supply, acceptance criteria, testing and inspection expectations…"
              />
              {form.noFormalSpec ? (
                <div className="mt-2">
                  <div className="h-1.5 overflow-hidden rounded-full bg-border">
                    <div
                      className={cn(
                        "h-full transition-[width,background-color] duration-200 ease-iv-out",
                        scopeLength(form) >= minScopeChars
                          ? "bg-iv-success-base"
                          : "bg-iv-warning-base",
                      )}
                      style={{
                        width: `${Math.min(100, Math.round((scopeLength(form) / minScopeChars) * 100))}%`,
                      }}
                    />
                  </div>
                  <p
                    className={cn(
                      "mt-1.5 text-xs",
                      scopeLength(form) >= minScopeChars
                        ? "text-iv-success-base"
                        : "text-muted-foreground",
                    )}
                  >
                    {scopeLength(form)} of {minScopeChars} characters{" "}
                    <span className="font-mono text-2xs text-muted-foreground/80">
                      · POLICY rfq.min_scope_chars (server-provided)
                    </span>
                  </p>
                </div>
              ) : null}
            </div>
            <div className="mb-4">
              <CheckboxRow
                id="rfq-nospec"
                label={
                  <span>
                    I don&rsquo;t have a formal specification document
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      <span className="font-mono">no_formal_spec</span> — turns on the written-scope
                      minimum instead of requiring an attachment.
                    </span>
                  </span>
                }
                checked={!!form.noFormalSpec}
                onChange={(e) => patch({ noFormalSpec: e.target.checked })}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField
                id="rfq-brand"
                label="Brand preference"
                value={form.brandPreference}
                onChange={(v) => patch({ brandPreference: v })}
                placeholder="Preferred brand"
              />
              <TextField
                id="rfq-altbrand"
                label="Alternative brand"
                value={form.alternativeBrand}
                onChange={(v) => patch({ alternativeBrand: v })}
                placeholder="Acceptable alternative"
              />
              <div>
                <FieldLabel htmlFor="rfq-condition" badge={<RequirednessBadge level="optional" />}>
                  Product condition
                </FieldLabel>
                <Select
                  id="rfq-condition"
                  options={CONDITION_OPTIONS}
                  placeholder="Select condition"
                  value={form.productCondition ?? ""}
                  onChange={(e) => patch({ productCondition: e.target.value })}
                />
              </div>
              <TextField
                id="rfq-standards"
                label="Standards"
                value={form.standards}
                onChange={(v) => patch({ standards: v })}
                placeholder="e.g. ASTM A36, ISO 9001"
              />
              <TextField
                id="rfq-certs"
                label="Certifications"
                value={form.certifications}
                onChange={(v) => patch({ certifications: v })}
                placeholder="e.g. EN 10204 3.1, mill test cert"
              />
            </div>
          </CanvasSection>

          {/* 3 · Attachments */}
          <CanvasSection
            id="attachments"
            title="Attachments"
            badge={<RequirednessBadge level="conditional" label="Attachment or written scope" />}
          >
            <UploadArea attachments={form.attachments} />
            <p className="mt-2.5 text-xs text-muted-foreground">
              Real upload is gated by <code className="font-mono text-2xs">[ESC-7-API/upload]</code>
              ; files resolve to <code className="font-mono text-2xs">spec_document_ids[]</code> at
              wiring. Nothing is uploaded here.
            </p>
          </CanvasSection>

          {/* 4 · Terms & conditions */}
          <CanvasSection
            id="terms"
            title="Terms & conditions"
            badge={<RequirednessBadge level="optional" />}
          >
            <TermsConditionsSection
              key={`terms-${resetKey}`}
              onTermsChange={(terms) => {
                setForm((f) => ({ ...f, termsAndConditions: terms }));
                if (termsMounted.current) markDirty();
                else termsMounted.current = true;
              }}
            />
          </CanvasSection>

          {/* 5 · Delivery */}
          <CanvasSection
            id="delivery"
            title="Delivery"
            badge={<RequirednessBadge level="submit" label="District required before submission" />}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel htmlFor="rfq-district" badge={<RequirednessBadge level="submit" />}>
                  Delivery district
                </FieldLabel>
                <Select
                  id="rfq-district"
                  options={DISTRICT_OPTIONS}
                  placeholder="Select district"
                  value={form.district ?? ""}
                  onChange={(e) => patch({ district: e.target.value })}
                />
                <p className="mt-1.5 text-xs text-muted-foreground">
                  <span className="font-mono">delivery_geography</span> — Doc-3 §1.2 requires at
                  least district level.
                </p>
              </div>
              <div>
                <FieldLabel htmlFor="rfq-site" badge={<RequirednessBadge level="optional" />}>
                  Delivery site
                </FieldLabel>
                <Select
                  id="rfq-site"
                  options={DELIVERY_SITE_OPTIONS}
                  placeholder="Factory / Warehouse / Site"
                  value={form.deliverySite ?? ""}
                  onChange={(e) => patch({ deliverySite: e.target.value })}
                />
              </div>
              <TextField
                id="rfq-location"
                label="Delivery location"
                value={form.deliveryLocation}
                onChange={(v) => patch({ deliveryLocation: v })}
                placeholder="Site / address"
              />
              <div>
                <FieldLabel htmlFor="rfq-date" badge={<RequirednessBadge level="optional" />}>
                  Required delivery date
                </FieldLabel>
                <Input
                  id="rfq-date"
                  type="date"
                  value={form.deliveryDate ?? ""}
                  onChange={(e) => patch({ deliveryDate: e.target.value })}
                />
              </div>
            </div>
            <div className="mt-4">
              <FieldLabel htmlFor="rfq-dinstr" badge={<RequirednessBadge level="optional" />}>
                Delivery instructions
              </FieldLabel>
              <Textarea
                id="rfq-dinstr"
                rows={2}
                className="min-h-16 resize-y"
                value={form.deliveryInstructions ?? ""}
                onChange={(e) => patch({ deliveryInstructions: e.target.value })}
                placeholder="Access, unloading, timing, packaging…"
              />
            </div>
          </CanvasSection>

          {/* 6 · Vendor routing */}
          <CanvasSection
            id="routing"
            title="Vendor routing"
            badge={<RequirednessBadge level="submit" label="Routing required before submission" />}
          >
            <div className="mb-4">
              <FieldLabel htmlFor="rfq-routing" badge={<RequirednessBadge level="submit" />}>
                Routing breadth
              </FieldLabel>
              <Select
                id="rfq-routing"
                options={ROUTING_MODE_OPTIONS}
                placeholder="Select routing breadth"
                value={form.routingMode ?? ""}
                onChange={(e) => patch({ routingMode: e.target.value as RoutingMode })}
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                You choose how <b>broadly</b> to route (
                <span className="font-mono">routing_mode</span>). The matching engine still decides
                which vendors are invited — routing preferences never make an RFQ public and never
                set matching weights.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel
                  htmlFor="rfq-pvendor"
                  badge={<RequirednessBadge level="optional" label="Optional hint" />}
                >
                  Preferred vendor
                </FieldLabel>
                <Input
                  id="rfq-pvendor"
                  value={form.preferredVendor ?? ""}
                  onChange={(e) => patch({ preferredVendor: e.target.value })}
                  placeholder="Search your network…"
                />
                <p className="mt-1.5 text-xs text-muted-foreground">
                  A preference hint only — never an invitation or a dispatch.
                </p>
              </div>
              <div>
                <FieldLabel
                  htmlFor="rfq-ftier"
                  badge={<RequirednessBadge level="optional" label="Optional hint" />}
                >
                  Preferred financial tier
                </FieldLabel>
                <Select
                  id="rfq-ftier"
                  options={FINANCIAL_TIER_OPTIONS}
                  placeholder="Any tier"
                  value={form.financialTier ?? ""}
                  onChange={(e) =>
                    patch({
                      financialTier: (e.target.value || undefined) as typeof form.financialTier,
                    })
                  }
                />
                <p className="mt-1.5 text-xs text-muted-foreground">
                  The frozen A–E capability tier — not a subscription plan.
                </p>
              </div>
            </div>
            <div className="mt-3 flex flex-col gap-2">
              <CheckboxRow
                id="rfq-verifiedonly"
                label="Verified vendors only"
                checked={!!form.verifiedOnly}
                onChange={(e) => patch({ verifiedOnly: e.target.checked })}
              />
              <CheckboxRow
                id="rfq-acceptalt"
                label="Accept alternative products / brands"
                checked={!!form.acceptAlternatives}
                onChange={(e) => patch({ acceptAlternatives: e.target.checked })}
              />
            </div>
          </CanvasSection>

          {/* 7 · Estimated value */}
          <CanvasSection
            id="value"
            title="Estimated value & priority"
            badge={<RequirednessBadge level="submit" />}
          >
            <Callout icon={<Lock aria-hidden />} className="mb-4">
              <span className="font-medium text-foreground">Internal-only (conservative).</span>{" "}
              Whether an invited vendor sees the estimated value is an open Board disclosure
              question; until it is ruled, the review document shows it under{" "}
              <b>Internal — not sent to vendors</b>. The same applies to routing breadth.
            </Callout>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel
                  htmlFor="rfq-estimated-value"
                  badge={<RequirednessBadge level="submit" />}
                >
                  Estimated value
                </FieldLabel>
                <Input
                  id="rfq-estimated-value"
                  inputMode="numeric"
                  value={form.budget ?? ""}
                  onChange={(e) => patch({ budget: e.target.value })}
                  placeholder="e.g. 1,800,000"
                  aria-invalid={dirty && parseAmount(form.budget) <= 0 ? true : undefined}
                />
                <p className="mt-1.5 text-xs text-muted-foreground">
                  In <b>BDT</b> — <span className="font-mono">currency</span> is BDT at create; no
                  selector. Internal guidance that sizes and routes your request; it is not a
                  commitment, and the platform moves no money. Non-blocking while drafting, but
                  required before submission.
                </p>
              </div>
              <div>
                <FieldLabel htmlFor="rfq-urgency" badge={<RequirednessBadge level="optional" />}>
                  Urgency
                </FieldLabel>
                <Select
                  id="rfq-urgency"
                  options={URGENCY_OPTIONS}
                  placeholder="Standard"
                  value={form.urgency ?? ""}
                  onChange={(e) => patch({ urgency: e.target.value })}
                />
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Commercial terms — payment, incoterms, tax — are defined by the <b>vendor</b> in
                  its quotation, not requested here.
                </p>
              </div>
            </div>
            <div className="mt-4">
              <FieldLabel htmlFor="rfq-specinstr" badge={<RequirednessBadge level="optional" />}>
                Special instructions
              </FieldLabel>
              <Textarea
                id="rfq-specinstr"
                rows={2}
                className="min-h-16 resize-y"
                value={form.specialInstructions ?? ""}
                onChange={(e) => patch({ specialInstructions: e.target.value })}
                placeholder="Anything else vendors should know — not commercial terms (those come in the quote)…"
              />
            </div>
          </CanvasSection>

          {/* 8 · Communication */}
          <CanvasSection
            id="communication"
            title="Communication"
            badge={<RequirednessBadge level="optional" />}
          >
            <div className="mb-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField
                id="rfq-cperson"
                label="RFQ contact person"
                value={form.contactPersonName}
                onChange={(v) => patch({ contactPersonName: v })}
                placeholder="e.g. Engr. Kamrul Hassan"
              />
              <TextField
                id="rfq-cnum"
                label="Contact number"
                value={form.contactPersonNumber}
                onChange={(v) => patch({ contactPersonNumber: v })}
                placeholder="+880 1XXXXXXXXX"
                type="tel"
              />
            </div>
            <p className="mb-2 text-xs text-muted-foreground">
              Platform messages stay on — they are the official record and audit trail. The channels
              below are optional and shared only with vendors who receive this RFQ.
            </p>
            <div className="flex flex-col gap-2">
              <CheckboxRow
                id="rfq-cm-platform"
                label="Platform messages (always on)"
                defaultChecked
                disabled
              />
              <CheckboxRow
                id="rfq-cphone"
                label="Phone call"
                checked={!!form.contactPhone}
                onChange={(e) => patch({ contactPhone: e.target.checked })}
              />
              <CheckboxRow
                id="rfq-cwa"
                label="WhatsApp"
                checked={!!form.contactWhatsapp}
                onChange={(e) => patch({ contactWhatsapp: e.target.checked })}
              />
              <CheckboxRow
                id="rfq-cmail"
                label="Email"
                checked={!!form.contactEmail}
                onChange={(e) => patch({ contactEmail: e.target.checked })}
              />
            </div>
            <div className="mt-4 max-w-xs">
              <FieldLabel htmlFor="rfq-ctime" badge={<RequirednessBadge level="optional" />}>
                Preferred contact time
              </FieldLabel>
              <Select
                id="rfq-ctime"
                options={CONTACT_TIME_OPTIONS}
                placeholder="Anytime"
                value={form.preferredContactTime ?? ""}
                onChange={(e) => patch({ preferredContactTime: e.target.value })}
              />
            </div>
          </CanvasSection>
        </div>

        {/* ── readiness panel ── */}
        {/* self-stretch: the grid sets `items-start`, which would size this column to its content
            height and make THAT the sticky containing block — killing the panel's sticky travel (D3
            requires it persistent). Stretching the column to the full grid-row height gives the inner
            sticky aside room to travel, mirroring the (direct-grid-child) section rail. */}
        <div className="self-stretch lg:col-span-2 xl:col-span-1">
          <ReadinessPanel snapshot={snapshot} onJump={jumpToItem} />
        </div>
      </div>

      {/* ── sticky action bar (D2) ── */}
      <div className="sticky bottom-0 z-30 mt-2 flex flex-wrap items-center gap-3 border-t border-border bg-background/95 px-1 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex min-w-0 flex-col gap-0.5 text-xs">
          <span className="inline-flex items-center gap-1.5 font-semibold text-muted-foreground">
            {dirty ? <span aria-hidden className="size-2 rounded-full bg-iv-warning-base" /> : null}
            {saveLine1}
          </span>
          <span
            className={cn(
              "text-2xs",
              saveState === "error"
                ? "font-semibold text-iv-danger-base"
                : "text-muted-foreground/80",
            )}
          >
            {saveLine2}
          </span>
        </div>
        <span className="inline-flex items-center gap-1.5 text-2xs text-muted-foreground/80">
          <AlertCircle aria-hidden className="size-3.5" />
          <span className="hidden xl:inline">
            There is no autosave — your draft is saved only when you choose{" "}
            <b className="font-semibold">Save draft</b>.
          </span>
          <span className="xl:hidden">
            No autosave — use <b className="font-semibold">Save draft</b>.
          </span>
        </span>
        <span className="flex-1" />
        <Button
          type="button"
          variant="ghost"
          onClick={() => (dirty ? setModal("discard") : undefined)}
          disabled={!dirty}
        >
          Discard changes
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => simulateSave()}
          disabled={saveState === "saving"}
        >
          <Save aria-hidden />
          {saveState === "saving" ? "Saving…" : "Save draft"}
        </Button>
        <Button type="button" onClick={() => setModal("review")}>
          {snapshot.state === "ready" ? "Review & submit" : "Review request"}
        </Button>
      </div>

      {/* ── D2 leave guard ── */}
      <Dialog open={modal === "leave"} onOpenChange={(o) => !o && setModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Leave without saving?</DialogTitle>
            <DialogDescription>
              You have unsaved changes to this RFQ draft. Drafts are saved only when you choose{" "}
              <b>Save draft</b> — there is no autosave, so leaving now discards them.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                const href = pendingHref;
                setModal(null);
                setDirty(false);
                if (href) router.push(href);
              }}
            >
              Leave &amp; discard
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setModal(null)}>
                Keep editing
              </Button>
              <Button
                type="button"
                onClick={() => {
                  const href = pendingHref;
                  simulateSave(() => {
                    setModal(null);
                    if (href) router.push(href);
                  });
                }}
              >
                Save draft
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── D2 discard confirm ── */}
      <Dialog open={modal === "discard"} onOpenChange={(o) => !o && setModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Discard your changes?</DialogTitle>
            <DialogDescription>
              Everything typed since your last save is removed. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setModal(null)}>
              Keep editing
            </Button>
            <Button type="button" variant="destructive" onClick={discardChanges}>
              Discard changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── review document + simulated submit ── */}
      <Dialog open={modal === "review"} onOpenChange={(o) => !o && setModal(null)}>
        <DialogContent className="max-h-[88vh] max-w-4xl gap-0 overflow-hidden p-0">
          <DialogHeader className="border-b border-border p-5 text-left">
            <DialogTitle>Review your request</DialogTitle>
            <DialogDescription>
              Read-only — the whole request at a glance. Everything above the lock line is what an
              invited vendor receives; below it is internal and stays with you. You can still edit
              anything before submitting.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto bg-secondary/40 p-5">
            <RfqPreviewDocument form={form} categoryPath={categoryPath} />
          </div>
          <DialogFooter className="items-center border-t border-border bg-card p-4 sm:justify-between">
            <ReviewGate snapshot={snapshot} />
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setModal(null)}>
                Back to editing
              </Button>
              <Button
                type="button"
                disabled={snapshot.state === "not-ready"}
                onClick={() => {
                  setModal(null);
                  setSubmittedSimulated(true);
                  window.scrollTo(0, 0);
                }}
              >
                Submit RFQ
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── small helpers ─────────────────────────────────────────────────────────────────────────────

/** A plain optional text field with the "Optional" badge (reduces the section boilerplate). */
function TextField({
  id,
  label,
  value,
  onChange,
  placeholder,
  type,
}: {
  id: string;
  label: string;
  value?: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <FieldLabel htmlFor={id} badge={<RequirednessBadge level="optional" />}>
        {label}
      </FieldLabel>
      <Input
        id={id}
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

/** The review-modal gate text — the server re-checks; this is guidance, not the decision. */
function ReviewGate({ snapshot }: { snapshot: ReturnType<typeof evaluateReadiness> }) {
  const unmet = snapshot.blockers.filter((b) => !b.met);
  if (unmet.length > 0) {
    return (
      <p className="text-xs text-muted-foreground">
        <b className="text-iv-danger-base">
          {unmet.length} item{unmet.length > 1 ? "s" : ""} still required
        </b>{" "}
        — {unmet.map((u) => u.label).join("; ")}
      </p>
    );
  }
  return (
    <p className="text-xs text-muted-foreground">
      <b className="font-semibold text-iv-success-base">Ready to submit.</b> The server re-checks
      the submission gate — this preview is guidance, not the decision. Submit is simulated in this
      build.
    </p>
  );
}

/** Breadcrumb with a leave-guard on the Dashboard link (D2 — nav-click-while-dirty). */
function Breadcrumb({
  onNavigate,
  canvas,
}: {
  onNavigate: (href: string) => void;
  canvas?: boolean;
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground"
    >
      <button
        type="button"
        onClick={() => onNavigate("/buy/dashboard")}
        className="hover:text-iv-brand-600"
      >
        Dashboard
      </button>
      {canvas ? (
        <>
          <ChevronDown aria-hidden className="size-3.5 -rotate-90 text-muted-foreground/60" />
          <button
            type="button"
            onClick={() => onNavigate("/buy/rfqs")}
            className="hover:text-iv-brand-600"
          >
            RFQs
          </button>
        </>
      ) : null}
      <ChevronDown aria-hidden className="size-3.5 -rotate-90 text-muted-foreground/60" />
      <span className="font-medium text-foreground">New RFQ</span>
    </nav>
  );
}
