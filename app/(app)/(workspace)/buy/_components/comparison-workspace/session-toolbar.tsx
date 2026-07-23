"use client";

// Comparison Workspace — SESSION TOOLBAR (the mode-tab row's trailing controls). Hosts three session-level
// affordances, all presentation-only / session-local:
//  • Unsaved-session indicator (§2.11A.7) — shown while any PRIVATE field is edited (never for selection).
//  • Reset actions (§2.11A.9) — two SEPARATELY-confirmed scopes: "Reset session edits" (edits only) and
//    "Reset selection and edits" (also restores the frozen default selection). The scopes are never merged.
//  • Keyboard shortcuts (§2.11A.15) — a visible button + an info dialog; a global handler binds Alt+1/2/E/D/P
//    and `?`. Shortcuts are disabled while typing and never override a browser/OS-critical (Ctrl/Cmd) combo;
//    every shortcut has a visible equivalent control.

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Keyboard, RotateCcw } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { StatusChip } from "@/frontend/components/status-chip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/frontend/primitives/dropdown-menu";
import { useComparisonWorkspace } from "./comparison-workspace-state";
import { useWorkspaceView } from "./workspace-url-state";
import { useConfirmDialog } from "./confirm-dialog";

const SHORTCUTS: { keys: string; label: string }[] = [
  { keys: "Alt + 1", label: "Compare mode" },
  { keys: "Alt + 2", label: "Document preview mode" },
  { keys: "Alt + E", label: "Jump to private evaluation" },
  { keys: "Alt + D", label: "Toggle “show differences only”" },
  { keys: "Alt + P", label: "Open the printable document" },
  { keys: "Esc", label: "Close an open dialog, sheet, or tooltip" },
  { keys: "?", label: "Show this shortcuts list" },
];

function ShortcutsList() {
  return (
    <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
      {SHORTCUTS.map((s) => (
        <div key={s.keys} className="contents">
          <dt>
            <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-2xs font-medium text-foreground">
              {s.keys}
            </kbd>
          </dt>
          <dd className="text-muted-foreground">{s.label}</dd>
        </div>
      ))}
    </dl>
  );
}

export function SessionToolbar({ printableHref }: { printableHref: string }) {
  const { dirty, resetEdits, setSelection, defaultSelection } = useComparisonWorkspace();
  const { setSel, setMode, differencesOnly, setDifferencesOnly } = useWorkspaceView();
  const router = useRouter();
  const { confirm, dialogNode } = useConfirmDialog();

  function openShortcuts() {
    confirm({
      title: "Keyboard shortcuts",
      description: "Every shortcut also has a visible control.",
      body: <ShortcutsList />,
      cancelLabel: null,
    });
  }

  function confirmResetEdits() {
    confirm({
      title: "Reset session edits?",
      description:
        "Your private evaluation, procurement purpose, and signatory names will be cleared. The quotation selection is unchanged.",
      confirmLabel: "Reset edits",
      danger: true,
      onConfirm: resetEdits,
    });
  }

  function confirmResetAll() {
    confirm({
      title: "Reset selection and edits?",
      description:
        "The comparison returns to the default quotation set and all private edits are cleared.",
      confirmLabel: "Reset selection & edits",
      danger: true,
      onConfirm: () => {
        resetEdits();
        setSelection(defaultSelection);
        setSel(defaultSelection);
      },
    });
  }

  // Global keyboard shortcuts — Alt-modified so they never collide with Ctrl/Cmd/OS combos; disabled while
  // typing in a field; every action also reachable by a visible control (mode tabs, differences checkbox,
  // evaluation panel, printable link, shortcuts button).
  useEffect(() => {
    function isTyping(target: EventTarget | null): boolean {
      const el = target as HTMLElement | null;
      if (!el) return false;
      return (
        el.tagName === "INPUT" ||
        el.tagName === "TEXTAREA" ||
        el.tagName === "SELECT" ||
        el.isContentEditable
      );
    }
    function onKey(e: KeyboardEvent) {
      if (isTyping(e.target)) return;
      if (e.key === "?" && !e.altKey && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        openShortcuts();
        return;
      }
      if (!e.altKey || e.ctrlKey || e.metaKey) return;
      const k = e.key.toLowerCase();
      if (k === "1") {
        e.preventDefault();
        setMode("compare");
      } else if (k === "2") {
        e.preventDefault();
        setMode("document");
      } else if (k === "d") {
        e.preventDefault();
        setDifferencesOnly(!differencesOnly);
      } else if (k === "e") {
        e.preventDefault();
        setMode("compare");
        window.setTimeout(() => {
          document
            .getElementById("cw-evaluation")
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 60);
      } else if (k === "p") {
        e.preventDefault();
        router.push(printableHref);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setMode, setDifferencesOnly, differencesOnly, router, printableHref]);

  return (
    <div className="flex items-center gap-2">
      {dirty ? (
        <span role="status">
          <StatusChip label="Unsaved session changes" tone="warning" />
        </span>
      ) : null}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <RotateCcw aria-hidden /> Reset
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={confirmResetEdits}>Reset session edits</DropdownMenuItem>
          <DropdownMenuItem onSelect={confirmResetAll}>Reset selection and edits</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="ghost"
        size="sm"
        onClick={openShortcuts}
        aria-label="Keyboard shortcuts"
        title="Keyboard shortcuts (?)"
      >
        <Keyboard aria-hidden />
      </Button>

      {dialogNode}
    </div>
  );
}
