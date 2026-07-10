"use client";

// Notification preferences — P-ACC-15 (Doc-7E · T-SETTINGS). Client Component holding only ephemeral form
// state (Doc-7C §2.3). PRESENTATION-ONLY: toggles flip optimistically but saving changes nothing (honest
// interim) — the server owns the user's NotificationPreferences.
//
// FIELD DISCIPLINE (invent nothing):
//  • CHANNELS are the frozen M6 delivery channels: in-app + email (available now); SMS + WhatsApp are a
//    later wave (Doc-7E P-ACC-15 "Future"; Doc-2 §2 Outbound Log per-channel structures) — shown here as
//    disabled "coming soon" columns, never as live coined controls.
//  • The preference DATA is Identity-owned (`users.NotificationPreferences` JSONB, Doc-2 §2 / Doc-4C;
//    Doc-4H freeze audit) and consumed read-only by M6 for delivery; the exact JSONB key shape and the
//    write seam (page_inventory: Doc-5H) are resolved at wiring [OBS].
//  • Notification TYPES are grouped by FROZEN MODULE DOMAINS (M3 RFQ / M4 Operations / M5 Trust /
//    M6 Communication / M1 Identity). The fine per-event taxonomy is owned by the §8 event catalog
//    (Doc-2 §8 / Doc-4J) — these domain rows are a presentation grouping over it, honestly flagged, and
//    coin no event name.
import { useMemo, useState } from "react";
import { Info } from "lucide-react";
import { cn } from "@/frontend/lib/cn";
import { Card, CardContent } from "@/frontend/primitives/card";
import { Button } from "@/frontend/primitives/button";

type ActiveChannel = "in_app" | "email";
interface Category {
  key: string;
  label: string;
  description: string;
}

const CATEGORIES: Category[] = [
  { key: "rfq", label: "RFQs & quotations", description: "Invitations, quotes, and awards." },
  {
    key: "operations",
    label: "Orders & documents",
    description: "Post-award POs, challans, and invoices.",
  },
  {
    key: "trust",
    label: "Verification & trust",
    description: "Verification outcomes and status changes.",
  },
  { key: "messages", label: "Messages", description: "Direct and RFQ thread messages." },
  {
    key: "account",
    label: "Account & security",
    description: "Sign-in, roles, and membership changes.",
  },
];

type Prefs = Record<string, Record<ActiveChannel, boolean>>;

// Presentation seed (a wired build resolves these from the user's NotificationPreferences).
const INITIAL: Prefs = {
  rfq: { in_app: true, email: true },
  operations: { in_app: true, email: true },
  trust: { in_app: true, email: false },
  messages: { in_app: true, email: false },
  account: { in_app: true, email: true },
};

function clone(p: Prefs): Prefs {
  return Object.fromEntries(Object.entries(p).map(([k, v]) => [k, { ...v }]));
}

function Toggle({
  checked,
  disabled,
  label,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  label: string;
  onChange?: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onChange}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
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

export function NotificationPreferences() {
  const [prefs, setPrefs] = useState<Prefs>(() => clone(INITIAL));
  const [saved, setSaved] = useState(false);

  const dirty = useMemo(
    () =>
      CATEGORIES.some(
        (c) =>
          prefs[c.key].in_app !== INITIAL[c.key].in_app ||
          prefs[c.key].email !== INITIAL[c.key].email,
      ),
    [prefs],
  );

  function toggle(catKey: string, channel: ActiveChannel) {
    // Optimistic flip (Doc-7E success delta) — persistence is deferred to Save (honest interim).
    setPrefs((prev) => {
      const next = clone(prev);
      next[catKey][channel] = !next[catKey][channel];
      return next;
    });
    setSaved(false);
  }

  function onSave() {
    // Presentation-only: nothing is written (the server owns the update) — honest interim.
    setSaved(true);
  }

  function onReset() {
    setPrefs(clone(INITIAL));
    setSaved(false);
  }

  return (
    <div className="max-w-2xl space-y-4">
      {saved ? (
        <div
          role="status"
          className="flex items-start gap-2 rounded-md border border-border bg-iv-info-subtle px-3 py-2 text-sm text-iv-info-muted"
        >
          <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <p>Notification preferences aren’t wired in this preview — nothing was saved.</p>
        </div>
      ) : null}

      <Card className="overflow-hidden p-0">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[40rem] border-collapse text-sm">
              <caption className="sr-only">Notification preferences by type and channel</caption>
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th scope="col" className="px-4 py-3 font-medium">
                    Notification
                  </th>
                  <th scope="col" className="px-4 py-3 text-center font-medium">
                    In-app
                  </th>
                  <th scope="col" className="px-4 py-3 text-center font-medium">
                    Email
                  </th>
                  <th scope="col" className="px-4 py-3 text-center font-medium">
                    SMS
                  </th>
                  <th scope="col" className="px-4 py-3 text-center font-medium">
                    WhatsApp
                  </th>
                </tr>
              </thead>
              <tbody>
                {CATEGORIES.map((c) => (
                  <tr key={c.key} className="border-b border-border last:border-0">
                    <th scope="row" className="px-4 py-3 text-left font-normal">
                      <span className="block font-medium text-foreground">{c.label}</span>
                      <span className="block text-xs text-muted-foreground">{c.description}</span>
                    </th>
                    <td className="px-4 py-3 text-center">
                      <Toggle
                        checked={prefs[c.key].in_app}
                        label={`${c.label} via in-app`}
                        onChange={() => toggle(c.key, "in_app")}
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Toggle
                        checked={prefs[c.key].email}
                        label={`${c.label} via email`}
                        onChange={() => toggle(c.key, "email")}
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Toggle checked={false} disabled label={`${c.label} via SMS (coming soon)`} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Toggle
                        checked={false}
                        disabled
                        label={`${c.label} via WhatsApp (coming soon)`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        SMS and WhatsApp notifications are coming soon. Critical security messages are always sent.
      </p>

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
