"use client";

// Workflow settings — P-ACC-13 (Doc-7E · T-SETTINGS). Client Component holding only ephemeral form state
// (Doc-7C §2.3). PRESENTATION-ONLY: saving shows an honest interim and changes nothing — the server owns
// the org workflow settings.
//
// FIELD DISCIPLINE (invent nothing):
//  • Maps to the frozen `identity.update_workflow_settings.v1` (Doc-4C §C11:714,
//    `can_manage_workflow_settings`): `rfq_approval_mode : enum(none|single|multi_step)` (the three
//    values are used verbatim); `approval_chain : list<object> (approval_chain_jsonb)`; and the
//    financial/award approval threshold within `financial_permissions` (Doc-3 §12.3).
//  • NO AUTO-APPROVE: an RFQ never auto-approves; silence never equals consent for financial-relevant
//    actions (Doc-3 §1.2, §5 FIXED). The mode governs human approval; it never removes a required check.
//  • The approval CHAIN persists as `approval_chain_jsonb` (Doc-3 §12.3); its exact object shape is not
//    field-enumerated in the wired contract, so each step is modelled by its APPROVER — a frozen Org Role
//    (Invariant #2) whose holder must carry `can_approve_rfq` at act time (Doc-3 §110 escalates to the
//    Owner if none). The role-per-step model + the concrete threshold key are resolved at wiring [OBS].
//  • Award threshold is multi-currency-ready — value stored per currency; BDT shown by default.
import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Info, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { cn } from "@/frontend/lib/cn";
import { FormField } from "@/frontend/components/form-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/primitives/card";
import { Button } from "@/frontend/primitives/button";
import { Input } from "@/frontend/primitives/input";

type ApprovalMode = "none" | "single" | "multi_step";
type OrgRole = "Owner" | "Director" | "Manager" | "Officer";

const APPROVER_ROLES: OrgRole[] = ["Owner", "Director", "Manager", "Officer"];

const MODES: Array<{ value: ApprovalMode; label: string; description: string }> = [
  {
    value: "none",
    label: "No approval required",
    description: "RFQs are submitted without an internal approval step.",
  },
  {
    value: "single",
    label: "Single approver",
    description: "One approver must approve an RFQ before it is submitted.",
  },
  {
    value: "multi_step",
    label: "Multi-step chain",
    description: "A sequence of approvers, each approving in order.",
  },
];

// Presentation seed (a wired build resolves these from get_workflow_settings).
const INITIAL_MODE: ApprovalMode = "multi_step";
const INITIAL_CHAIN: OrgRole[] = ["Director", "Manager"];
const INITIAL_THRESHOLD = "500000";

const selectClass =
  "h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function WorkflowSettings() {
  const [mode, setMode] = useState<ApprovalMode>(INITIAL_MODE);
  const [chain, setChain] = useState<OrgRole[]>(INITIAL_CHAIN);
  const [threshold, setThreshold] = useState(INITIAL_THRESHOLD);
  const [addRole, setAddRole] = useState<OrgRole>("Manager");
  const [errors, setErrors] = useState<{ chain?: string; threshold?: string }>({});
  const [saved, setSaved] = useState(false);

  const dirty = useMemo(() => {
    if (mode !== INITIAL_MODE) return true;
    if (threshold !== INITIAL_THRESHOLD) return true;
    if (chain.length !== INITIAL_CHAIN.length) return true;
    return chain.some((r, i) => r !== INITIAL_CHAIN[i]);
  }, [mode, chain, threshold]);

  function touch() {
    setSaved(false);
  }

  function move(index: number, delta: number) {
    setChain((prev) => {
      const next = [...prev];
      const target = index + delta;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    touch();
  }

  function removeStep(index: number) {
    setChain((prev) => prev.filter((_, i) => i !== index));
    touch();
  }

  function addStep() {
    setChain((prev) => [...prev, addRole]);
    touch();
  }

  function onSave() {
    const next: { chain?: string; threshold?: string } = {};
    if (mode === "single" && chain.length !== 1)
      next.chain = "Choose exactly one approver for single-approver mode.";
    if (mode === "multi_step" && chain.length === 0)
      next.chain = "Add at least one approver to the chain.";
    const amount = Number(threshold);
    if (threshold.trim() === "" || Number.isNaN(amount) || amount < 0)
      next.threshold = "Enter a valid threshold amount (0 or more).";
    setErrors(next);
    // Presentation-only: nothing is written (the server owns the update) — honest interim.
    if (Object.keys(next).length === 0) setSaved(true);
  }

  function onReset() {
    setMode(INITIAL_MODE);
    setChain(INITIAL_CHAIN);
    setThreshold(INITIAL_THRESHOLD);
    setErrors({});
    setSaved(false);
  }

  // Single-approver mode uses one selected role (chain[0]); default it when switching.
  const singleApprover: OrgRole = chain[0] ?? "Director";

  return (
    <div className="max-w-2xl space-y-6">
      {saved ? (
        <div
          role="status"
          className="flex items-start gap-2 rounded-md border border-border bg-iv-info-subtle px-3 py-2 text-sm text-iv-info-muted"
        >
          <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <p>Workflow settings aren’t wired in this preview — nothing was saved.</p>
        </div>
      ) : null}

      {/* RFQ approval. */}
      <Card>
        <CardHeader>
          <CardTitle as="h2" className="flex items-center gap-2 text-base">
            <ShieldCheck aria-hidden="true" className="size-4 text-iv-navy-700" />
            RFQ approval
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <fieldset>
            <legend className="text-sm font-medium text-foreground">Approval mode</legend>
            <div role="radiogroup" aria-label="Approval mode" className="mt-3 space-y-2">
              {MODES.map((m) => (
                <label
                  key={m.value}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-md border px-3 py-2.5 text-sm transition-colors focus-within:ring-2 focus-within:ring-ring",
                    mode === m.value
                      ? "border-iv-brand-500 bg-iv-brand-50"
                      : "border-border hover:bg-muted/50",
                  )}
                >
                  <input
                    type="radio"
                    name="approval-mode"
                    value={m.value}
                    checked={mode === m.value}
                    onChange={() => {
                      setMode(m.value);
                      touch();
                    }}
                    className="mt-0.5 size-4 accent-iv-brand-500"
                  />
                  <span className="min-w-0">
                    <span className="block font-medium text-foreground">{m.label}</span>
                    <span className="block text-muted-foreground">{m.description}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Single approver. */}
          {mode === "single" ? (
            <FormField
              id="single-approver"
              label="Approver"
              description="The role that must approve. The approver must hold RFQ-approval permission."
            >
              <select
                id="single-approver"
                className={selectClass}
                value={singleApprover}
                onChange={(e) => {
                  setChain([e.target.value as OrgRole]);
                  touch();
                }}
              >
                {APPROVER_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </FormField>
          ) : null}

          {/* Multi-step chain. */}
          {mode === "multi_step" ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Approval chain</p>
              <p className="text-xs text-muted-foreground">
                Approvers act in order. Each must hold RFQ-approval permission.
              </p>
              {errors.chain ? <p className="text-sm text-iv-danger-muted">{errors.chain}</p> : null}
              <ol className="space-y-2">
                {chain.map((role, i) => (
                  <li
                    key={`${role}-${i}`}
                    className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2 text-sm"
                  >
                    <span className="flex items-center gap-3">
                      <span className="inline-flex size-6 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                        {i + 1}
                      </span>
                      <span className="font-medium text-foreground">{role}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Move ${role} up`}
                        disabled={i === 0}
                        onClick={() => move(i, -1)}
                      >
                        <ArrowUp aria-hidden="true" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Move ${role} down`}
                        disabled={i === chain.length - 1}
                        onClick={() => move(i, 1)}
                      >
                        <ArrowDown aria-hidden="true" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Remove ${role}`}
                        className="text-iv-danger-muted hover:text-iv-danger-muted"
                        onClick={() => removeStep(i)}
                      >
                        <Trash2 aria-hidden="true" />
                      </Button>
                    </span>
                  </li>
                ))}
              </ol>
              <div className="flex items-center gap-2 pt-1">
                <label className="sr-only" htmlFor="add-approver">
                  Add approver role
                </label>
                <select
                  id="add-approver"
                  className={selectClass}
                  value={addRole}
                  onChange={(e) => setAddRole(e.target.value as OrgRole)}
                >
                  {APPROVER_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <Button type="button" variant="outline" size="sm" onClick={addStep}>
                  <Plus aria-hidden="true" />
                  Add approver
                </Button>
              </div>
            </div>
          ) : null}

          <div className="flex items-start gap-2 rounded-md border border-border bg-muted px-3 py-2 text-xs text-muted-foreground">
            <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <p>
              RFQs never auto-approve — an approver must act, and silence is never treated as
              consent.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Award approval threshold. */}
      <Card>
        <CardHeader>
          <CardTitle as="h2" className="text-base">
            Award approval
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FormField
            id="award-threshold"
            label="Approval threshold"
            description="Awards at or above this value require approval."
            error={errors.threshold}
          >
            <div className="flex items-center gap-2">
              <Input
                id="award-threshold"
                name="threshold"
                type="number"
                inputMode="numeric"
                min={0}
                value={threshold}
                onChange={(e) => {
                  setThreshold(e.target.value);
                  touch();
                }}
                className="max-w-[16rem]"
              />
              <span className="text-sm font-medium text-muted-foreground">BDT</span>
            </div>
          </FormField>
        </CardContent>
      </Card>

      {/* Save bar. */}
      {dirty ? (
        <div className="sticky bottom-0 z-10 -mx-4 mt-8 flex flex-col gap-3 border-t border-border bg-card/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-sm text-muted-foreground">You have unsaved changes.</p>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onReset}>
              Discard
            </Button>
            <Button type="button" onClick={onSave}>
              Save changes
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
