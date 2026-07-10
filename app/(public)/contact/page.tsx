import { ContactForm } from "./contact-form";

// Public Contact / Support route (`/contact`) — P-PUB-24 (Doc-7D Public surface · T-STATIC · TB-NONE;
// screen_specifications §P-PUB-24). A SERVER COMPONENT mounted in the Doc-7C `(public)` shell,
// footer-reached. ROUTING + COMPOSITION ONLY; the interactive form is the `ContactForm` client island.
//
// SCOPE: presentation-only. The contact form is NOT wired (honest no-op — see contact-form.tsx). The page
// fabricates no phone number, email address, office location, or support SLA. The optional FAQ states only
// TRUE platform facts already established elsewhere (CLAUDE.md §1). Binds no Doc-5 contract; this page owns
// the single `<h1>`.
export const metadata = {
  title: "Contact & support — iVendorz",
  description: "Get in touch with the iVendorz team.",
};

const FAQ = [
  {
    q: "Does iVendorz handle payments?",
    a: "No. iVendorz never handles payment between buyers and vendors — there is no escrow, wallet, or settlement. Payments happen off the platform.",
  },
  {
    q: "Who is iVendorz for?",
    a: "Industrial buyers — factories, plants, EPC contractors, and procurement teams — and the suppliers who serve them.",
  },
  {
    q: "How do I get started?",
    a: "Create an account to post your first RFQ or to build a supplier microsite and start receiving RFQs.",
  },
];

export default function ContactPage() {
  return (
    <>
      {/* Intro. */}
      <section className="border-b border-border bg-background">
        <div className="mx-auto w-full max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-20">
          <p className="text-sm font-semibold uppercase tracking-wide text-iv-brand-600">
            Contact &amp; support
          </p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-iv-ink-heading sm:text-5xl">
            Get in touch
          </h1>
          <p className="mx-auto mt-5 text-lg text-iv-ink-secondary">
            Have a question about iVendorz? Send us a message and we’ll get back to you.
          </p>
        </div>
      </section>

      {/* Form. */}
      <section className="bg-muted/30">
        <div className="mx-auto w-full max-w-2xl px-4 py-14 sm:px-6">
          <ContactForm />
        </div>
      </section>

      {/* FAQ. */}
      <section className="border-t border-border bg-background">
        <div className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6">
          <h2 className="text-2xl font-bold tracking-tight text-iv-ink-heading sm:text-3xl">
            Frequently asked
          </h2>
          <dl className="mt-8 space-y-6">
            {FAQ.map((item) => (
              <div key={item.q}>
                <dt className="text-base font-semibold text-foreground">{item.q}</dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
}
