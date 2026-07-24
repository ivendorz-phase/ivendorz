"use client";

// TagInput — chip list + free-text entry for the jsonb-shaped CUSTOM procurement tags
// (`ESC-VENDIR-FIELDS` R5 interim ruling — persisted via `details_jsonb`, never coined columns).
// PRESENTATION-ONLY: local input state; the tag list round-trips through props, nothing persists.
// Tags render as OUTLINE badges per the `directory-display.ts` encoding rule (jsonb-shaped ≠
// frozen status). ⭐ Preferred (frozen `vendor_favorites`) and Approved/Conditional/Blacklisted
// (frozen `buyer_vendor_statuses`) are NEVER offered or accepted as suggestions here — the
// surface passes `SUGGESTED_PROCUREMENT_TAGS`, which excludes them by construction.
// Buyer-private data (Inv #11): never vendor-facing.

import * as React from "react";
import { Plus, X } from "lucide-react";
import { Badge } from "@/frontend/primitives/badge";
import { Input } from "@/frontend/primitives/input";

export interface TagInputProps {
  /** The current tag list (controlled by the form surface). */
  value: string[];
  onChange: (value: string[]) => void;
  /** Offered quick-add suggestions (e.g. `SUGGESTED_PROCUREMENT_TAGS`); already-added ones hide. */
  suggestions?: readonly string[];
  disabled?: boolean;
  className?: string;
}

export function TagInput({ value, onChange, suggestions, disabled, className }: TagInputProps) {
  const [draft, setDraft] = React.useState("");

  function addTag(raw: string) {
    if (disabled) return;
    const tag = raw.trim();
    if (!tag) return;
    // Case-insensitive de-dupe — a tag is a label, "backup vendor" == "Backup Vendor".
    if (value.some((t) => t.toLowerCase() === tag.toLowerCase())) {
      setDraft("");
      return;
    }
    onChange([...value, tag]);
    setDraft("");
  }

  function removeTag(tag: string) {
    if (disabled) return;
    onChange(value.filter((t) => t !== tag));
  }

  const offered = (suggestions ?? []).filter(
    (s) => !value.some((t) => t.toLowerCase() === s.toLowerCase()),
  );

  return (
    <div className={className}>
      {value.length > 0 ? (
        <ul role="list" className="mb-2 flex flex-wrap items-center gap-1.5">
          {value.map((tag) => (
            <li key={tag}>
              <Badge variant="neutral" className="gap-1 bg-transparent normal-case tracking-normal">
                {tag}
                <button
                  type="button"
                  aria-label={`Remove tag ${tag}`}
                  disabled={disabled}
                  className="-mr-0.5 rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => removeTag(tag)}
                >
                  <X aria-hidden className="size-3" />
                </button>
              </Badge>
            </li>
          ))}
        </ul>
      ) : null}

      <Input
        value={draft}
        disabled={disabled}
        aria-label="Add a tag"
        placeholder="Add a tag and press Enter"
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            addTag(draft);
          }
        }}
      />

      {offered.length > 0 ? (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Suggestions:</span>
          {offered.map((s) => (
            <button
              key={s}
              type="button"
              disabled={disabled}
              className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => addTag(s)}
            >
              <Badge
                variant="neutral"
                className="gap-1 bg-transparent normal-case tracking-normal transition-colors hover:bg-secondary"
              >
                <Plus aria-hidden className="size-3" />
                {s}
              </Badge>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
