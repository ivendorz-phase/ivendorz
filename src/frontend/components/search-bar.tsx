"use client";

// SearchBar (Doc-7B kit, App tier; promoted from the Public surface after M2.3 exercised its API). The
// real catalog search field: keyboard support (⌘K/Ctrl-K focus · Esc clear · Enter submit), a loading
// affordance, and URL SYNCHRONIZATION — on submit it navigates to the surface-supplied results route
// (route-agnostic). PRESENTATION-ONLY: it fetches nothing. ONE canonical implementation — differences via
// props (action, label), never a fork.
import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import { Input } from "../primitives/input";
import { Button } from "../primitives/button";
import { cn } from "../lib/cn";

export interface SearchBarProps {
  /** Results route to submit to — surface-supplied (route-agnostic). On submit → `${action}?q=…`. */
  action: string;
  /** Initial query — the surface reads `?q=` and passes it (kept in sync after navigation). */
  defaultQuery?: string;
  placeholder?: string;
  /** Accessible name for the search landmark + input. */
  label?: string;
  /** Autofocus on mount. */
  autoFocus?: boolean;
  className?: string;
}

export function SearchBar({
  action,
  defaultQuery = "",
  placeholder = "Search products, suppliers, categories…",
  label = "Search the marketplace",
  autoFocus = false,
  className,
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState(defaultQuery);
  const [pending, startTransition] = React.useTransition();
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Page-level ⌘K / Ctrl-K focuses the field.
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Keep the field in sync with the URL query after navigation (no React-key remount → focus survives).
  React.useEffect(() => {
    setQuery(defaultQuery);
  }, [defaultQuery]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    // URL synchronization (presentation): navigate to the results route with ?q=. No fetch here.
    startTransition(() => router.push(q ? `${action}?q=${encodeURIComponent(q)}` : action));
  }

  function onInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") setQuery("");
  }

  return (
    <form
      role="search"
      aria-label={label}
      aria-busy={pending}
      onSubmit={submit}
      className={cn("flex items-center gap-2", className)}
    >
      <label className="relative flex-1">
        <span className="sr-only">{label}</span>
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          ref={inputRef}
          type="search"
          autoComplete="off"
          autoFocus={autoFocus}
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onInputKeyDown}
          className="h-11 pl-9 pr-3 text-base"
        />
      </label>
      <Button
        type="submit"
        size="lg"
        aria-label={pending ? "Searching" : "Search"}
        disabled={pending}
      >
        {pending ? (
          <Loader2 aria-hidden="true" className="animate-spin" />
        ) : (
          <Search aria-hidden="true" />
        )}
      </Button>
      <span role="status" aria-live="polite" className="sr-only">
        {pending ? "Searching…" : ""}
      </span>
    </form>
  );
}
