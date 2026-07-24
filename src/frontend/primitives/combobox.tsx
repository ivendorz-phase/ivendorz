"use client";

// Primitive: Combobox (Doc-7B BR2 tier). The canonical accessible single-select typeahead —
// promoted from the `new-rfq` Stage-3 prototype once its interaction behaviour was validated
// (owner ruling D6, 2026-07-24). It replaces the pattern of every surface hand-rolling a
// "searchable select" out of an Input + a floating div.
//
// OWNERSHIP (D6, binding): the kit owns the INTERACTION — keyboard navigation, filtering,
// listbox semantics, focus management, and the empty/loading/error presentation. The kit owns
// NO business meaning: option eligibility, hierarchy semantics, validation, matching behaviour
// and defaults all belong to the calling application layer. Options arrive as data; this file
// never fetches, never sorts by a business rule, and never decides what is selectable.
//
// A11y: WAI-ARIA 1.2 combobox + listbox. The input carries role=combobox, aria-expanded,
// aria-controls and aria-activedescendant; options carry role=option + aria-selected. Focus never
// leaves the input (aria-activedescendant pattern), so screen-reader users keep their typing
// context while arrowing through options.
//
// Uncontrolled DOM value is deliberately unsupported: a combobox's text box and its selected value
// are different things, so `value`/`onValueChange` are required. A form surface owns the state.

import * as React from "react";
import { cn } from "../lib/cn";

export interface ComboboxOption {
  /** The stable value handed back through `onValueChange` (e.g. an opaque id). */
  value: string;
  /** The primary line, and what the input shows once selected. */
  label: string;
  /** Optional secondary line — a path, code, or qualifier. Also searched. */
  description?: string;
  /** Optional group heading; options sharing a group render under one heading, in array order. */
  group?: string;
  disabled?: boolean;
}

/** Data state of the option source. `error` and `loading` are the caller's to report. */
export type ComboboxStatus = "ready" | "loading" | "error";

export interface ComboboxProps {
  options: ComboboxOption[];
  /** Selected option value, or null when nothing is selected. Controlled — always supply both. */
  value: string | null;
  onValueChange: (value: string | null, option: ComboboxOption | null) => void;
  /** Wired by `FormField` when composed inside one; otherwise supply your own labelling. */
  id?: string;
  placeholder?: string;
  disabled?: boolean;
  status?: ComboboxStatus;
  /** Rendered inside the list when `status === "error"`. Keep it short and actionable. */
  errorMessage?: string;
  onRetry?: () => void;
  /** Rendered when the filter matches nothing. `(query) => node`, so the caller can echo the term. */
  emptyMessage?: (query: string) => React.ReactNode;
  /** Called as the user types. Supply it to filter server-side; omit for local filtering. */
  onQueryChange?: (query: string) => void;
  /** Set when `onQueryChange` does the filtering, so this component does not filter again. */
  externalFilter?: boolean;
  className?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
}

function matches(option: ComboboxOption, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    option.label.toLowerCase().includes(q) || (option.description ?? "").toLowerCase().includes(q)
  );
}

export function Combobox({
  options,
  value,
  onValueChange,
  id,
  placeholder = "Search…",
  disabled,
  status = "ready",
  errorMessage = "We couldn’t load the list.",
  onRetry,
  emptyMessage,
  onQueryChange,
  externalFilter,
  className,
  "aria-describedby": describedBy,
  "aria-invalid": invalid,
}: ComboboxProps) {
  const rootId = React.useId();
  const listId = `${rootId}-list`;
  const inputId = id ?? `${rootId}-input`;

  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [activeIndex, setActiveIndex] = React.useState(-1);

  const rootRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  const selected = React.useMemo(
    () => options.find((o) => o.value === value) ?? null,
    [options, value],
  );

  // Visible options: flat, in the caller's order, grouped only for presentation.
  const visible = React.useMemo(() => {
    if (status !== "ready") return [];
    if (externalFilter) return options;
    return options.filter((o) => matches(o, query));
  }, [options, query, status, externalFilter]);

  // The text box shows the selection while closed, and the raw query while open.
  const inputValue = open ? query : (selected?.label ?? "");

  const close = React.useCallback(() => {
    setOpen(false);
    setActiveIndex(-1);
    setQuery("");
  }, []);

  const openList = React.useCallback(() => {
    if (disabled) return;
    setOpen(true);
    setActiveIndex(value ? visible.findIndex((o) => o.value === value) : -1);
  }, [disabled, value, visible]);

  const pick = React.useCallback(
    (option: ComboboxOption) => {
      if (option.disabled) return;
      onValueChange(option.value, option);
      close();
      inputRef.current?.focus();
    },
    [onValueChange, close],
  );

  // Close on outside pointer-down (not click — a mousedown inside the list must not blur first).
  React.useEffect(() => {
    if (!open) return;
    function onDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) close();
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, close]);

  // Keep the active option in view while arrowing.
  React.useEffect(() => {
    if (!open || activeIndex < 0) return;
    const node = listRef.current?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`);
    node?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  function move(delta: number) {
    if (!visible.length) return;
    const next = activeIndex < 0 ? (delta > 0 ? 0 : visible.length - 1) : activeIndex + delta;
    setActiveIndex(Math.max(0, Math.min(visible.length - 1, next)));
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (!open) openList();
        else move(1);
        break;
      case "ArrowUp":
        event.preventDefault();
        if (!open) openList();
        else move(-1);
        break;
      case "Home":
        if (open) {
          event.preventDefault();
          setActiveIndex(0);
        }
        break;
      case "End":
        if (open) {
          event.preventDefault();
          setActiveIndex(visible.length - 1);
        }
        break;
      case "Enter":
        if (open && activeIndex >= 0 && visible[activeIndex]) {
          event.preventDefault();
          pick(visible[activeIndex]);
        }
        break;
      case "Escape":
        if (open) {
          // Stop here — a combobox inside a Dialog must not close the Dialog too.
          event.stopPropagation();
          close();
        }
        break;
      case "Tab":
        if (open) close();
        break;
      default:
        break;
    }
  }

  // Group headings render in first-appearance order; ungrouped options come out flat.
  let lastGroup: string | undefined;

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <div
        className={cn(
          "flex h-9 w-full items-center gap-2 rounded-md border border-input bg-background px-3 text-sm shadow-iv-xs transition-colors",
          "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background",
          invalid && "border-destructive",
          disabled && "cursor-not-allowed opacity-50",
        )}
      >
        <SearchIcon />
        <input
          ref={inputRef}
          id={inputId}
          role="combobox"
          type="text"
          autoComplete="off"
          spellCheck={false}
          disabled={disabled}
          className="min-w-0 flex-1 bg-transparent text-iv-ink-strong outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
          placeholder={placeholder}
          value={inputValue}
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-describedby={describedBy}
          aria-invalid={invalid}
          aria-activedescendant={
            open && activeIndex >= 0 && visible[activeIndex]
              ? `${rootId}-opt-${activeIndex}`
              : undefined
          }
          onFocus={openList}
          onKeyDown={onKeyDown}
          onChange={(event) => {
            const next = event.target.value;
            if (!open) openList();
            setQuery(next);
            setActiveIndex(0);
            onQueryChange?.(next);
          }}
        />
        {selected && !disabled ? (
          <button
            type="button"
            aria-label="Clear selection"
            className="inline-flex size-5 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => {
              onValueChange(null, null);
              setQuery("");
              inputRef.current?.focus();
            }}
          >
            <ClearIcon />
          </button>
        ) : null}
        <ChevronIcon open={open} />
      </div>

      {open ? (
        <div
          ref={listRef}
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 max-h-72 overflow-y-auto rounded-md border border-border bg-popover p-1 shadow-iv-md"
        >
          {status === "loading" ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">Loading…</p>
          ) : status === "error" ? (
            <div className="px-3 py-6 text-center text-sm">
              <p className="text-destructive">{errorMessage}</p>
              {onRetry ? (
                <button
                  type="button"
                  className="mt-1 font-medium text-iv-brand-600 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={onRetry}
                >
                  Try again
                </button>
              ) : null}
            </div>
          ) : visible.length === 0 ? (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
              {emptyMessage ? emptyMessage(query) : "No matches."}
            </div>
          ) : (
            visible.map((option, index) => {
              const heading = option.group && option.group !== lastGroup ? option.group : null;
              lastGroup = option.group;
              return (
                <React.Fragment key={option.value}>
                  {heading ? (
                    <p
                      role="presentation"
                      className="px-2 pb-1 pt-2 text-2xs font-semibold uppercase tracking-wide text-muted-foreground"
                    >
                      {heading}
                    </p>
                  ) : null}
                  <div
                    id={`${rootId}-opt-${index}`}
                    data-index={index}
                    role="option"
                    aria-selected={option.value === value}
                    aria-disabled={option.disabled || undefined}
                    className={cn(
                      "flex cursor-pointer items-start gap-2 rounded-sm px-2 py-1.5 text-sm",
                      index === activeIndex && "bg-secondary",
                      option.value === value && "font-medium text-iv-brand-700",
                      option.disabled && "cursor-not-allowed opacity-50",
                    )}
                    onMouseMove={() => setActiveIndex(index)}
                    onMouseDown={(event) => {
                      event.preventDefault();
                      pick(option);
                    }}
                  >
                    <span className="min-w-0 flex-1">
                      {option.label}
                      {option.description ? (
                        <span className="block text-xs text-muted-foreground">
                          {option.description}
                        </span>
                      ) : null}
                    </span>
                    {option.value === value ? <CheckIcon /> : null}
                  </div>
                </React.Fragment>
              );
            })
          )}
        </div>
      ) : null}
    </div>
  );
}

// Inline icons — the kit does not pull lucide into a primitive (Doc-7B: primitives stay dependency-light).
function SearchIcon() {
  return (
    <svg
      aria-hidden
      className="size-4 shrink-0 text-muted-foreground"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-3" fill="none" stroke="currentColor" strokeWidth={2.4}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden
      className="size-4 shrink-0 text-iv-brand-600"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden
      className={cn(
        "size-4 shrink-0 text-muted-foreground transition-transform duration-150 ease-iv-out",
        open && "rotate-180",
      )}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
