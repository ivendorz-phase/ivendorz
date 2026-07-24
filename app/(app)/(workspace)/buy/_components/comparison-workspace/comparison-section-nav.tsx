"use client";

// Comparison Workspace — SECTION NAVIGATION (§2.11A.3). An in-page navigator over the compare surface's
// sections (desktop = sticky pills, mobile = a select). It changes ONLY scroll position and safe
// presentation state — never data, order, or arithmetic. Active section is conveyed by `aria-current` AND a
// visual treatment (not colour alone). The "Document" entry switches the workspace mode instead of scrolling.
//
// The active pill is tracked locally by an IntersectionObserver (with a short click-lock so a click's intent
// wins over the observer). Only an explicit CLICK writes `section` to the URL (a safe, deep-linkable
// presentation state) — the observer never thrashes the URL on scroll.

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/frontend/lib/cn";
import { useWorkspaceView, type WorkspaceMode } from "./workspace-url-state";

interface SectionDef {
  key: string;
  label: string;
  /** DOM id to scroll to (compare-mode anchor). */
  anchor?: string;
  /** Switch the workspace mode instead of scrolling. */
  mode?: WorkspaceMode;
}

const SECTIONS: SectionDef[] = [
  { key: "overview", label: "Overview", anchor: "cw-overview" },
  { key: "technical", label: "Technical", anchor: "cw-matrix" },
  { key: "line-items", label: "Line items", anchor: "cw-line-items" },
  { key: "commercial", label: "Commercial terms", anchor: "cw-commercial" },
  { key: "evaluation", label: "Buyer evaluation", anchor: "cw-evaluation" },
  { key: "document", label: "Document", mode: "document" },
];

const ANCHORS = SECTIONS.filter((s) => s.anchor);

export function ComparisonSectionNav() {
  const { section, setSection, setMode } = useWorkspaceView();
  const [active, setActive] = useState<string>(section ?? "overview");
  const lockRef = useRef(false);

  const go = useCallback(
    (def: SectionDef) => {
      if (def.mode) {
        setMode(def.mode);
        return;
      }
      const el = def.anchor ? document.getElementById(def.anchor) : null;
      if (!el) return;
      lockRef.current = true;
      setActive(def.key);
      setSection(def.key);
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      window.setTimeout(() => {
        lockRef.current = false;
      }, 800);
    },
    [setMode, setSection],
  );

  // Observe the section anchors; the topmost intersecting one becomes active (unless a click holds the lock).
  useEffect(() => {
    const idToKey = new Map<string, string>();
    const observed: HTMLElement[] = [];
    for (const s of ANCHORS) {
      if (!s.anchor) continue;
      idToKey.set(s.anchor, s.key);
      const el = document.getElementById(s.anchor);
      if (el) observed.push(el);
    }
    if (observed.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (lockRef.current) return;
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) {
          const key = idToKey.get(visible.target.id);
          if (key) setActive(key);
        }
      },
      { rootMargin: "-96px 0px -55% 0px", threshold: 0 },
    );
    observed.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Deep-link restore: if the URL names a section, scroll to it once on mount.
  useEffect(() => {
    if (!section) return;
    const def = SECTIONS.find((s) => s.key === section);
    if (def?.anchor) {
      const el = document.getElementById(def.anchor);
      if (el) {
        lockRef.current = true;
        setActive(def.key);
        el.scrollIntoView({ block: "start" });
        window.setTimeout(() => {
          lockRef.current = false;
        }, 300);
      }
    }
    // Run once on mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <nav aria-label="Comparison sections" className="sticky top-16 z-10">
      {/* Desktop: pills */}
      <div className="hidden flex-wrap gap-1 rounded-lg border border-border bg-card/95 p-1.5 backdrop-blur sm:flex">
        {SECTIONS.map((s) => {
          const isActive = active === s.key;
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => go(s)}
              aria-current={isActive ? "true" : undefined}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive
                  ? "bg-accent text-accent-foreground ring-1 ring-border"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
              )}
            >
              {s.label}
            </button>
          );
        })}
      </div>
      {/* Mobile: select */}
      <div className="sm:hidden">
        <label className="sr-only" htmlFor="cw-section-select">
          Jump to section
        </label>
        <select
          id="cw-section-select"
          value={active}
          onChange={(e) => {
            const def = SECTIONS.find((s) => s.key === e.target.value);
            if (def) go(def);
          }}
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {SECTIONS.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
    </nav>
  );
}
