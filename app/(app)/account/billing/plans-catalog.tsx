"use client";

// Plans / catalog — P-ACC-16 (Doc-7E · T-LISTING · SK-CARD). Client Component holding only ephemeral
// billing-cycle state (Doc-7C §2.3). PRESENTATION-ONLY: reads and mutates nothing.
//
// FIELD DISCIPLINE (invent nothing):
//  • Plan cards map to the frozen `list_plans` / `get_plan` projection (BC-BILL-1, Doc-4I):
//    `{ plan_id, name, billing_cycle, price, currency, status }`. Price is shown with the plan's own
//    `currency` (multi-currency-ready; BDT here). The billing-cycle toggle switches between the
//    monthly/annual `billing_cycle` variants of a plan.
//  • FEATURES ARE GATED BY ENTITLEMENT VALUE, NEVER BY PLAN NAME (Invariant #10; plan ≠ financial tier).
//    Each plan lists its entitlements as boolean/numeric/enum VALUES (Doc-4I BC-BILL-1 `entitlements`),
//    resolved from the entitlement catalog; the "current plan" is derived from the org's entitlements
//    (subscription), not from a plan-name check.
//  • NO PLAN GATES MATCHING OR AWARD (Doc-3 §11.8) — a subscription never influences the RFQ engine.
import { useState } from "react";
import Link from "next/link";
import { Check, Minus } from "lucide-react";
import { cn } from "@/frontend/lib/cn";
import { Card } from "@/frontend/primitives/card";
import { Button } from "@/frontend/primitives/button";
import { Badge } from "@/frontend/primitives/badge";

type BillingCycle = "monthly" | "annual";

interface Entitlement {
  label: string;
  included: boolean;
}

interface Plan {
  id: string;
  name: string;
  priceMonthly: number;
  priceAnnual: number;
  currency: string;
  entitlements: Entitlement[];
  current: boolean;
}

// Presentation seed (a wired build resolves these from list_plans/get_plan + plan_entitlements).
const PLANS: Plan[] = [
  {
    id: "plan_starter",
    name: "Starter",
    priceMonthly: 2000,
    priceAnnual: 20000,
    currency: "BDT",
    entitlements: [
      { label: "5 vendor seats", included: true },
      { label: "100 lead credits / month", included: true },
      { label: "10 RFQs / month", included: true },
      { label: "Public microsite", included: false },
      { label: "Priority support", included: false },
    ],
    current: false,
  },
  {
    id: "plan_growth",
    name: "Growth",
    priceMonthly: 8000,
    priceAnnual: 80000,
    currency: "BDT",
    entitlements: [
      { label: "25 vendor seats", included: true },
      { label: "500 lead credits / month", included: true },
      { label: "50 RFQs / month", included: true },
      { label: "Public microsite", included: true },
      { label: "Priority support", included: false },
    ],
    current: true,
  },
  {
    id: "plan_enterprise",
    name: "Enterprise",
    priceMonthly: 25000,
    priceAnnual: 250000,
    currency: "BDT",
    entitlements: [
      { label: "Unlimited vendor seats", included: true },
      { label: "2,000 lead credits / month", included: true },
      { label: "Unlimited RFQs", included: true },
      { label: "Public microsite", included: true },
      { label: "Priority support", included: true },
    ],
    current: false,
  },
];

function formatPrice(n: number): string {
  return n.toLocaleString("en-US");
}

export function PlansCatalog() {
  const [cycle, setCycle] = useState<BillingCycle>("monthly");

  return (
    <div className="space-y-6">
      {/* Billing-cycle toggle. */}
      <div
        role="radiogroup"
        aria-label="Billing cycle"
        className="inline-flex rounded-md border border-border bg-muted p-0.5 text-sm"
      >
        {(["monthly", "annual"] as BillingCycle[]).map((c) => (
          <button
            key={c}
            type="button"
            role="radio"
            aria-checked={cycle === c}
            onClick={() => setCycle(c)}
            className={cn(
              "rounded px-3 py-1.5 font-medium capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              cycle === c
                ? "bg-card text-foreground shadow-iv-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {c === "monthly" ? "Monthly" : "Annual"}
          </button>
        ))}
      </div>

      {PLANS.length === 0 ? (
        <p className="text-sm text-muted-foreground">No plans available.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PLANS.map((plan) => {
            const price = cycle === "monthly" ? plan.priceMonthly : plan.priceAnnual;
            return (
              <Card
                key={plan.id}
                className={cn(
                  "flex flex-col p-5",
                  plan.current && "border-iv-brand-500 ring-1 ring-iv-brand-500",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-base font-semibold text-foreground">{plan.name}</h2>
                  {plan.current ? <Badge variant="brand">Current plan</Badge> : null}
                </div>

                <p className="mt-3">
                  <span className="text-2xl font-bold text-foreground">
                    {plan.currency} {formatPrice(price)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {" "}
                    / {cycle === "monthly" ? "month" : "year"}
                  </span>
                </p>

                <ul className="mt-4 flex-1 space-y-2">
                  {plan.entitlements.map((e) => (
                    <li
                      key={e.label}
                      className={cn(
                        "flex items-start gap-2 text-sm",
                        e.included ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {e.included ? (
                        <Check
                          aria-hidden="true"
                          className="mt-0.5 size-4 shrink-0 text-iv-success-muted"
                        />
                      ) : (
                        <Minus
                          aria-hidden="true"
                          className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                        />
                      )}
                      <span>{e.label}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-5">
                  {plan.current ? (
                    <Button type="button" variant="outline" className="w-full" disabled>
                      Current plan
                    </Button>
                  ) : (
                    <Button asChild className="w-full">
                      <Link href={`/account/subscription?plan=${plan.id}&cycle=${cycle}`}>
                        Select plan
                      </Link>
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Plans set your platform features and quotas. They never affect RFQ matching or awards.
      </p>
    </div>
  );
}
