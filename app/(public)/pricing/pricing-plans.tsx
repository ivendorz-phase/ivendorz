"use client";

// Public pricing / plans — P-PUB-04 (Doc-7D Public surface · T-STATIC · TB-NONE; screen_specifications
// §P-PUB-04). Client Component holding ONLY the ephemeral billing-cycle toggle state (a presentation
// toolbar delta). ANONYMOUS + PRESENTATION-ONLY: reads and mutates nothing; binds no Doc-5 contract.
//
// FIELD DISCIPLINE (invent nothing):
//  • Plan cards market the frozen public read `list_plans` (BC-BILL-1, Doc-4I) projection
//    `{ plan_id, name, billing_cycle, price, currency, status }`. Price shows the plan's own `currency`
//    (multi-currency-ready; BDT here). The billing-cycle toggle switches the monthly/annual `billing_cycle`
//    variants — a presentation control, not a mutation.
//  • FEATURES ARE MARKETED AS ENTITLEMENT VALUES, NEVER GATED BY PLAN NAME (Invariant #10; plan ≠ financial
//    tier). Each plan lists boolean/numeric/enum entitlement VALUES; the tier badge is marketing copy only.
//  • NO PLAN GATES MATCHING, ROUTING, OR AWARD (Doc-3 §11.8) — a subscription never influences the RFQ
//    engine. This is the moat and is stated on the page.
//  • Conversion CTAs route anonymously to sign-up (`/login`, Doc-7D PR5) — no `(auth)`/`get_subscription`
//    read is performed here. Choosing a plan while signed in continues to P-ACC-16 (account billing).
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Minus } from "lucide-react";
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
  tagline: string;
  priceMonthly: number;
  priceAnnual: number;
  currency: string;
  entitlements: Entitlement[];
  featured: boolean;
}

// Presentation seed (a wired build resolves these from the public `list_plans` + plan_entitlements).
const PLANS: Plan[] = [
  {
    id: "plan_starter",
    name: "Starter",
    tagline: "For teams getting their first RFQs out.",
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
    featured: false,
  },
  {
    id: "plan_growth",
    name: "Growth",
    tagline: "For procurement teams running at scale.",
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
    featured: true,
  },
  {
    id: "plan_enterprise",
    name: "Enterprise",
    tagline: "For factories and EPC contractors.",
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
    featured: false,
  },
];

function formatPrice(n: number): string {
  return n.toLocaleString("en-US");
}

export function PricingPlans() {
  const [cycle, setCycle] = useState<BillingCycle>("monthly");

  return (
    <div className="space-y-8">
      {/* Billing-cycle toggle (presentation toolbar delta). */}
      <div className="flex justify-center">
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
                "rounded px-4 py-1.5 font-medium capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                cycle === c
                  ? "bg-card text-foreground shadow-iv-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {c === "monthly" ? "Monthly" : "Annual"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {PLANS.map((plan) => {
          const price = cycle === "monthly" ? plan.priceMonthly : plan.priceAnnual;
          return (
            <Card
              key={plan.id}
              className={cn(
                "flex flex-col p-6",
                plan.featured && "border-iv-brand-500 ring-1 ring-iv-brand-500",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-lg font-semibold text-foreground">{plan.name}</h2>
                {plan.featured ? <Badge variant="brand">Most popular</Badge> : null}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{plan.tagline}</p>

              <p className="mt-4">
                <span className="text-3xl font-bold text-foreground">
                  {plan.currency} {formatPrice(price)}
                </span>
                <span className="text-sm text-muted-foreground">
                  {" "}
                  / {cycle === "monthly" ? "month" : "year"}
                </span>
              </p>

              <ul className="mt-5 flex-1 space-y-2.5">
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

              <div className="mt-6">
                <Button
                  asChild
                  className="w-full gap-2"
                  variant={plan.featured ? "primary" : "outline"}
                >
                  <Link href={`/login?plan=${plan.id}&cycle=${cycle}`}>
                    Get started <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
