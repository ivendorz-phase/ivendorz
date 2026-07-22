"use client";

// OTP input — a controlled N-box one-time-code field for the (auth) code screens (verify-email · 2fa).
// Client Component: it owns ONLY DOM focus orchestration (auto-advance, backspace, arrows, paste);
// the CODE VALUE is lifted to the parent form via `onChange`, and the parent owns submit plus all
// format/verify logic (presentation only — nothing is verified here). Composes native inputs styled
// with iv tokens (mono glyphs, brand focus ring) — the kit `Input` can't host per-digit focus, so
// this is a distinct field, not a re-implementation of it.
import { useId, useRef } from "react";
import { cn } from "@/frontend/lib/cn";

interface OtpInputProps {
  value: string;
  onChange: (next: string) => void;
  length?: number;
  disabled?: boolean;
  /** Announced label prefix for each box, e.g. "Digit". */
  label?: string;
  autoFocus?: boolean;
}

export function OtpInput({
  value,
  onChange,
  length = 6,
  disabled,
  label = "Digit",
  autoFocus,
}: OtpInputProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const groupId = useId();
  const chars = Array.from({ length }, (_, i) => value[i] ?? "");

  function setChar(index: number, char: string) {
    const next = chars.slice();
    next[index] = char;
    onChange(next.join("").slice(0, length));
  }

  function focus(index: number) {
    refs.current[Math.max(0, Math.min(length - 1, index))]?.focus();
  }

  return (
    <div className="flex gap-2.5" role="group" aria-label={`${length}-digit code`}>
      {chars.map((char, i) => (
        <input
          key={`${groupId}-${i}`}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={1}
          disabled={disabled}
          autoFocus={autoFocus && i === 0}
          aria-label={`${label} ${i + 1}`}
          value={char}
          onChange={(e) => {
            const digit = e.target.value.replace(/\D/g, "").slice(-1);
            setChar(i, digit);
            if (digit && i < length - 1) focus(i + 1);
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !chars[i] && i > 0) focus(i - 1);
            else if (e.key === "ArrowLeft") {
              e.preventDefault();
              focus(i - 1);
            } else if (e.key === "ArrowRight") {
              e.preventDefault();
              focus(i + 1);
            }
          }}
          onPaste={(e) => {
            e.preventDefault();
            const pasted = (e.clipboardData.getData("text") || "")
              .replace(/\D/g, "")
              .slice(0, length);
            if (!pasted) return;
            onChange(pasted);
            focus(pasted.length);
          }}
          className={cn(
            "aspect-square min-w-0 flex-1 rounded-xl border bg-background text-center font-mono text-2xl font-semibold text-iv-ink-strong shadow-iv-xs transition-colors",
            "focus-visible:border-iv-navy-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "disabled:cursor-not-allowed disabled:opacity-50",
            char ? "border-iv-navy-500" : "border-input",
          )}
        />
      ))}
    </div>
  );
}
