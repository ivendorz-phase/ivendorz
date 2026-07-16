// MediaPlaceholder — the public surfaces' media frame for a slot whose real image is not available yet.
//
// ── OWNER RULING (2026-07-16), project-wide ───────────────────────────────────────────────────────
//   • Do NOT invent product, category, search or resource images.
//   • Do NOT reuse unrelated images as stand-ins.
//   • Do NOT use AI-generated or stock imagery where the slot represents real marketplace content.
//   • Until real media is available FROM THE BACKEND, render these as media placeholders using the
//     existing design system (image frame + icon/empty state), preserving the reference's layout and
//     proportions without implying real content.
//   • A DECORATIVE/HERO slot (not marketplace content) may reuse an existing approved project visual.
//
// This component is the first bullet-set, made reusable. It is NOT a new design language: it is the
// extraction of the idiom this codebase already established in `microsite/company-gallery.tsx`
// ("renders labelled DECORATIVE placeholder tiles — NO fabricated <img> sources") and
// `microsite/project-media-gallery.tsx` ("real vendor-uploaded photos/video render here once the
// asset pipeline is wired"). Those two were the first and second instances; the reference port needs
// it across category/product/search, so it is lifted here rather than copied a third time
// (re-implementing an established pattern per-surface is a duplication finding).
//
// WHY A PLACEHOLDER AND NOT AN IMAGE. These slots represent REAL MARKETPLACE CONTENT — a product's
// photo, a category's imagery, a search result's thumbnail. That media belongs to vendors and arrives
// through the M2 asset pipeline, which is not wired (wiring is a separate milestone). There is
// therefore no honest source: a stock or AI image would depict goods no vendor has listed, and
// reusing the one real project photograph would misrepresent an unrelated workshop as this product.
// The frame keeps the reference's proportions so the layout is exactly right the day real media lands.
//
// PRESENTATION ONLY: a Server Component, no hooks, no fetch (Content ≠ Presentation, Inv #9). It
// composes existing tokens only (`border-border`, `bg-muted`, `text-muted-foreground`) — no new token,
// no kit change.
//
// A11y: the frame is decorative and carries `aria-hidden` on its icon; `label` (when given) is real
// text, so the slot is never conveyed by icon alone (GI-06). The caller sizes the frame via
// `className` (e.g. `aspect-[4/3]`) so each surface keeps the reference's own proportion.
import type { ReactNode } from "react";
import { Image as ImageIcon } from "lucide-react";
import { cn } from "@/frontend/lib/cn";

export interface MediaPlaceholderProps {
  /** Sizing/aspect for this surface, e.g. `aspect-[4/3]` — the reference's proportion for the slot. */
  className?: string;
  /** Icon shown in the frame. Defaults to the lucide image glyph. Decorative. */
  icon?: ReactNode;
  /** Optional real text under the icon (e.g. a media label the read DOES carry). */
  label?: string;
  /** Optional secondary line. Presentation only — never a fabricated caption for a fabricated image. */
  caption?: string;
}

export function MediaPlaceholder({ className, icon, label, caption }: MediaPlaceholderProps) {
  return (
    <div
      className={cn(
        "flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-border bg-muted text-muted-foreground",
        className,
      )}
    >
      <span aria-hidden className="[&_svg]:size-6">
        {icon ?? <ImageIcon />}
      </span>
      {label ? (
        <span className="px-2 text-center text-xs font-medium text-foreground">{label}</span>
      ) : null}
      {caption ? <span className="px-2 text-center text-2xs">{caption}</span> : null}
    </div>
  );
}
