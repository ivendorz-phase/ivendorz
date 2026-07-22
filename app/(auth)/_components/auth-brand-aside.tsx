// Auth brand aside — the dark, industrial left panel shared by the (auth) entry screens
// (Login · Signup). PURE SERVER COMPONENT: static marketing chrome, zero hydration. Reuses the
// landing hero pattern (Image `fill priority` + a token-safe scrim) so auth reads as one brand with
// the public landing. GOVERNANCE: renders the OFFICIAL BrandMark verbatim (the full lockup is navy
// `#032A4A` and would not read on dark; the mark carries its own light field) — the brand is never
// recolored or re-drawn (Doc-7B brand contract). Copy is capability-true only — no fabricated
// metrics or named testimonials (honest-numbers precedent, GI-03/GI-12). Hidden below `lg` (the
// form panel stands alone on mobile).
import Link from "next/link";
import Image from "next/image";
import { Check, ShieldCheck } from "lucide-react";
import { BrandMark } from "@/frontend/brand";

export interface AuthBrandAsideProps {
  /** Panel headline (short, benefit-led). */
  headline: string;
  /** One-sentence supporting line. */
  subcopy: string;
  /** Capability-true trust points (no invented numbers). */
  points: string[];
  /** Optional honest footer note (e.g. a real platform property like default-private tenancy). */
  footNote?: string;
}

export function AuthBrandAside({ headline, subcopy, points, footNote }: AuthBrandAsideProps) {
  return (
    <aside className="relative isolate hidden flex-col justify-between overflow-hidden p-11 text-white lg:flex">
      {/* Industrial backdrop — decorative (empty alt); the copy carries the meaning. */}
      <Image
        src="/hero/hero-bg.jpg"
        alt=""
        fill
        priority
        sizes="(min-width: 1024px) 52vw, 0px"
        className="-z-20 object-cover"
      />
      {/* Scrim — heavier than the landing band so white copy stays AA-legible across the whole panel. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(150deg, rgba(8,14,28,0.93) 0%, rgba(12,22,45,0.84) 52%, rgba(18,32,66,0.64) 100%)",
        }}
      />

      <Link
        href="/"
        aria-label="iVendorz home"
        className="inline-flex w-fit rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
      >
        <BrandMark height={44} />
      </Link>

      <div className="max-w-md">
        <h2 className="text-[2rem] font-extrabold leading-[1.15] tracking-tight">{headline}</h2>
        <p className="mt-4 text-base leading-relaxed text-white/80">{subcopy}</p>
        <ul className="mt-7 space-y-3">
          {points.map((point) => (
            <li key={point} className="flex items-center gap-3 text-sm text-white/90">
              <Check aria-hidden="true" className="size-[18px] shrink-0 text-iv-amber-400" />
              {point}
            </li>
          ))}
        </ul>
      </div>

      {footNote ? (
        <p className="flex items-start gap-2.5 border-l-2 border-iv-amber-400 pl-4 text-[13.5px] leading-relaxed text-white/75">
          <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-iv-amber-400" />
          <span>{footNote}</span>
        </p>
      ) : null}
    </aside>
  );
}
