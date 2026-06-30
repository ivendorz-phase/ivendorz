"use client";

// S4 Quote Authoring — the staged step rail (companion §13.1). Seven steps, directly clickable in ANY
// order [M-Q1]; Preview is skippable. This is a thin client wrapper around the kit Tabs (the desktop
// rail; the mobile [ESC-7B-SEGMENTED] stepper is a pending kit addition); the seven section contents
// are server-rendered and passed in as props (no duplication, no business logic). RSC content streams
// through this boundary.
import type { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/frontend/primitives/tabs";

export interface QuotationBuilderStepsProps {
  price: ReactNode;
  delivery: ReactNode;
  warranty: ReactNode;
  compliance: ReactNode;
  attachments: ReactNode;
  preview: ReactNode;
  submit: ReactNode;
}

const STEPS: { value: string; label: string }[] = [
  { value: "price", label: "1 · Price" },
  { value: "delivery", label: "2 · Delivery" },
  { value: "warranty", label: "3 · Warranty" },
  { value: "compliance", label: "4 · Compliance" },
  { value: "attachments", label: "5 · Attachments" },
  { value: "preview", label: "6 · Preview" },
  { value: "submit", label: "7 · Submit" },
];

export function QuotationBuilderSteps(props: QuotationBuilderStepsProps) {
  const content: Record<string, ReactNode> = {
    price: props.price,
    delivery: props.delivery,
    warranty: props.warranty,
    compliance: props.compliance,
    attachments: props.attachments,
    preview: props.preview,
    submit: props.submit,
  };

  return (
    <Tabs defaultValue="price" className="w-full">
      <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
        {STEPS.map((step) => (
          <TabsTrigger key={step.value} value={step.value}>
            {step.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {STEPS.map((step) => (
        <TabsContent key={step.value} value={step.value} className="mt-4">
          {content[step.value]}
        </TabsContent>
      ))}
    </Tabs>
  );
}
