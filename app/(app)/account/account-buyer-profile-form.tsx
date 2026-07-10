"use client";

// Account buyer-profile WRITE form — the D7 `upsert_buyer_profile` create/edit affordance (Doc-7E §3.1,
// the Wave-2 write leg the READ view deferred). A CLIENT island mounted by the server `page.tsx` BESIDE
// the read `AccountView` (the read view stays form-free — its WP-1.6 test asserts that). It POSTs to the
// OWN `POST /api/identity/buyer_profiles` endpoint (Doc-4C §C10) — the one client self-fetch the screen
// does (the write is a USER ACTION, not a server-rendered read). Minimal LOCAL Tailwind (the Doc-7B kit is
// the design-system home); a11y: labelled inputs, a single section heading, `role="status"` text feedback.
//
// CONTENT ≠ PRESENTATION (Invariant #9): this owns NO business rule. It collects input, posts it, and
// renders the wire result. The audit-on-write, authorization, and optimistic concurrency all live BEHIND
// the endpoint (the M1 command) — never re-derived here.

import { useState, type FormEvent } from "react";
import type { BuyerProfileView } from "@/modules/identity/contracts";

type SubmitState =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "saved"; created: boolean }
  | { kind: "error"; message: string };

/** Serialize a current jsonb value to a textarea-editable JSON string ("" when empty). */
function toJsonText(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  return JSON.stringify(value, null, 2);
}

/** Parse an optional JSON textarea — "" → undefined (omit/unchanged); else `JSON.parse` (throws on bad JSON). */
function parseJsonField(text: string): unknown {
  const trimmed = text.trim();
  if (trimmed.length === 0) return undefined;
  return JSON.parse(trimmed);
}

export function AccountBuyerProfileForm({ profile }: { profile: BuyerProfileView | null }) {
  const [industry, setIndustry] = useState(profile?.industry ?? "");
  const [factoryInfo, setFactoryInfo] = useState(toJsonText(profile?.factoryInfo));
  const [deliveryLocations, setDeliveryLocations] = useState(
    toJsonText(profile?.deliveryLocations),
  );
  const [procurementPreferences, setProcurementPreferences] = useState(
    toJsonText(profile?.procurementPreferences),
  );
  const [state, setState] = useState<SubmitState>({ kind: "idle" });

  async function onSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setState({ kind: "saving" });

    let body: Record<string, unknown>;
    try {
      body = {
        industry: industry.trim().length > 0 ? industry.trim() : null,
        factory_info: parseJsonField(factoryInfo),
        delivery_locations: parseJsonField(deliveryLocations),
        procurement_preferences: parseJsonField(procurementPreferences),
      };
    } catch {
      setState({
        kind: "error",
        message:
          "Factory information, delivery locations, and procurement preferences must be valid JSON.",
      });
      return;
    }

    try {
      const res = await fetch("/api/identity/buyer_profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.status === 200 || res.status === 201) {
        setState({ kind: "saved", created: res.status === 201 });
        return;
      }
      const payload = (await res.json().catch(() => null)) as {
        error?: { message?: string };
      } | null;
      setState({
        kind: "error",
        message: payload?.error?.message ?? `Could not save (HTTP ${res.status}).`,
      });
    } catch {
      setState({ kind: "error", message: "Network error — please try again." });
    }
  }

  const heading = profile === null ? "Create buyer profile" : "Edit buyer profile";

  return (
    <section aria-labelledby="bp-form-heading" className="mx-auto mt-2 max-w-2xl p-6">
      <h2 id="bp-form-heading" className="text-lg font-semibold text-neutral-900">
        {heading}
      </h2>
      <form onSubmit={onSubmit} className="mt-4 space-y-4">
        <div>
          <label htmlFor="bp-industry" className="block text-sm font-medium text-neutral-700">
            Industry
          </label>
          <input
            id="bp-industry"
            type="text"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <JsonField
          id="bp-factory"
          label="Factory information (JSON)"
          value={factoryInfo}
          onChange={setFactoryInfo}
        />
        <JsonField
          id="bp-delivery"
          label="Delivery locations (JSON)"
          value={deliveryLocations}
          onChange={setDeliveryLocations}
        />
        <JsonField
          id="bp-procurement"
          label="Procurement preferences (JSON)"
          value={procurementPreferences}
          onChange={setProcurementPreferences}
        />
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={state.kind === "saving"}
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
          >
            {state.kind === "saving" ? "Saving…" : "Save buyer profile"}
          </button>
          <p role="status" aria-live="polite" className="text-sm">
            {state.kind === "saved" && (
              <span className="text-green-700">
                {state.created ? "Buyer profile created." : "Buyer profile updated."}
              </span>
            )}
            {state.kind === "error" && <span className="text-red-700">{state.message}</span>}
          </p>
        </div>
      </form>
    </section>
  );
}

function JsonField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-neutral-700">
        {label}
      </label>
      <textarea
        id={id}
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 font-mono text-xs"
      />
    </div>
  );
}
