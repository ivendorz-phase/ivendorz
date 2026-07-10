"use client";

// Contact form — P-PUB-24 (Doc-7D Public surface). CLIENT COMPONENT holding only ephemeral form + a
// submitted-preview flag (Doc-7C §2.3). PRESENTATION-ONLY: it is NOT wired to any backend.
//
// FIELD DISCIPLINE: there is no public "submit contact" contract yet, so submission is an HONEST NO-OP —
// on submit the form does NOT send anything and does NOT fabricate a success toast or ticket id. It shows
// an inline, truthful status that messaging is not yet connected ([ESC-7-API]; a wired build POSTs to a
// real endpoint). Fields use the kit `FormField`; the Message control is a hand-rolled `<textarea>` styled
// like the kit `Input` (there is no kit Textarea primitive — this is a local control, NOT a duplicated
// primitive). No phone number, email address, office location, or SLA is fabricated.
import { useState } from "react";
import { Card } from "@/frontend/primitives/card";
import { Button } from "@/frontend/primitives/button";
import { FormField } from "@/frontend/components/form-field";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <Card className="p-6">
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault(); // No public submit contract yet — never send, never fake success.
          setSubmitted(true);
        }}
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField
            id="contact-name"
            label="Name"
            required
            inputProps={{ autoComplete: "name" }}
          />
          <FormField
            id="contact-email"
            label="Email"
            required
            inputProps={{ type: "email", autoComplete: "email" }}
          />
        </div>

        <FormField id="contact-subject" label="Subject" required />

        <FormField id="contact-message" label="Message" required>
          <textarea
            rows={6}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-iv-ink-strong shadow-iv-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-destructive"
          />
        </FormField>

        {submitted ? (
          <div
            role="status"
            className="rounded-md border border-iv-info-200 bg-iv-info-50 px-3 py-2 text-sm text-iv-info-700"
          >
            Thanks — but heads up: messaging isn’t connected yet, so nothing was sent. This form is
            a preview.
          </div>
        ) : null}

        <div className="flex items-center gap-3">
          <Button type="submit">Send message</Button>
          <p className="text-xs text-muted-foreground">
            We’ll add live messaging soon — for now this is a preview.
          </p>
        </div>
      </form>
    </Card>
  );
}
