// Auth icon badge — the rounded-square, brand-tinted badge that sits above the heading on the
// (auth) secondary screens (forgot · reset · verify · 2fa). PURE SERVER COMPONENT. Token-only
// surface (iv brand chip), never raw hex. Hosts a single decorative lucide icon supplied by the
// caller; the icon is sized here so callers pass the bare glyph.
import type { ReactNode } from "react";

export function AuthIconBadge({ children }: { children: ReactNode }) {
  return (
    <span
      aria-hidden="true"
      className="mb-4 flex size-[52px] items-center justify-center rounded-xl bg-iv-brand-50 text-iv-brand-700 [&_svg]:size-[26px]"
    >
      {children}
    </span>
  );
}
