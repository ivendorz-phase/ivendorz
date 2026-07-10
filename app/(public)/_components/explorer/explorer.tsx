"use client";

// P-PUB header Explorer entry — the LIGHT half of the preload ladder (FE-PUB-09, ARCH §9.5).
// Renders a static trigger button immediately (server HTML); the first SUSTAINED hover intent
// (~150–200ms, never pointer fly-by — R2-NITPICK-04) or focus preloads the heavy chunk
// (`explorer-menu.tsx`: panel code + taxonomy seed + overlay); a click loads it AND opens the
// panel on mount. Subsequent opens are instant (<100ms budget, ARCH §9.6). Hover preload is
// gated to fine pointers (R2-NITPICK-02) — touch devices load on tap only.

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/frontend/lib/cn";
import type { ExplorerMenuProps } from "./explorer-menu";

const HOVER_INTENT_MS = 150;

type ExplorerMenuComponent = React.ComponentType<ExplorerMenuProps>;

// FE-PUB-09 fix, take 2 (Review-B RV-0126 re-review REGRESSION): `next/dynamic({ ssr: false })`
// still didn't work — declaring the dynamic import at MODULE scope (whether via `React.lazy` or
// `next/dynamic`) registers the chunk in Next's client-reference-manifest for this route, and
// Turbopack's production bundler eagerly `<script async>`s anything in that manifest regardless
// of a runtime `if (!load)` guard, because `Explorer` is reachable from the root layout (shared by
// every route) — the manifest has no way to encode "only if this state flips true" at build time.
// The fix: no `React.lazy`/`next/dynamic` boundary at all. A bare `import()` call, made only
// INSIDE the preload handler (never referenced at module scope), is invisible to the
// component-hydration manifest — it's just a promise a browser event handler happens to create.
// ES module dynamic `import()` still code-splits (that's a language-level guarantee, not a
// React/Next feature), so the chunk is still its own file; it just isn't declared anywhere the
// bundler could treat as "this route might need it on load."
export function Explorer({ className }: { className?: string }) {
  const [load, setLoad] = React.useState(false);
  const [openOnMount, setOpenOnMount] = React.useState(false);
  const [Menu, setMenu] = React.useState<ExplorerMenuComponent | null>(null);
  const intent = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const importing = React.useRef(false);

  React.useEffect(() => {
    return () => {
      if (intent.current) clearTimeout(intent.current);
    };
  }, []);

  const preload = () => {
    setLoad(true);
    if (importing.current || Menu) return;
    importing.current = true;
    import("./explorer-menu").then((mod) => setMenu(() => mod.default));
  };
  const openNow = () => {
    setOpenOnMount(true);
    preload();
  };

  const placeholder = (
    <button
      type="button"
      aria-haspopup="true"
      aria-expanded={false}
      className={cn(
        "inline-flex h-9 items-center justify-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      )}
      onPointerEnter={(e) => {
        if (e.pointerType !== "mouse") return;
        if (intent.current) clearTimeout(intent.current);
        intent.current = setTimeout(preload, HOVER_INTENT_MS);
      }}
      onPointerLeave={() => {
        if (intent.current) clearTimeout(intent.current);
      }}
      onFocus={preload}
      onClick={openNow}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
          e.preventDefault();
          openNow();
        }
      }}
    >
      All Categories
      <ChevronDown aria-hidden className="size-3.5 shrink-0 text-muted-foreground" />
    </button>
  );

  if (!load || !Menu) return <div className={cn("hidden lg:block", className)}>{placeholder}</div>;

  return (
    <div className={cn("hidden lg:block", className)}>{<Menu defaultOpen={openOnMount} />}</div>
  );
}
