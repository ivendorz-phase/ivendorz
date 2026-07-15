// Kit lib: the SINGLE rich-note HTML sanitizer — the one allow-list gate every
// `dangerouslySetInnerHTML` injection point in the app passes through.
//
// WHY THIS EXISTS (security fix, 2026-07-15): the prior implementation was a hand-rolled regex
// BLOCKLIST duplicated in two places (`rich-note-editor.sanitizeRichNoteHtml` +
// `quotation-document.scrubHtml`, byte-identical). It stripped `<script>…</script>` and QUOTED
// `on*="…"` / `on*='…'` handlers only, so every unquoted-attribute payload walked straight through:
//
//     <img src=x onerror=alert(1)>      ← no quotes → the regex never matched → survived
//     <svg onload=alert(1)>             ← same
//     <a href="javascript:alert(1)">    ← href scheme was never inspected at all
//
// A blocklist enumerates what is forbidden and therefore leaks by construction; an ALLOW-LIST
// enumerates what is permitted and fails closed on everything else. This module is the allow-list.
// Never re-introduce a regex scrub, and never inject rich HTML without routing it through here.
//
// SSR: DOMPurify needs a DOM. Both current injection points sit inside a `"use client"` tree, but
// Next.js still server-renders client components for the initial HTML — a browser-only DOMPurify
// would throw on the server (or, with a text-only server fallback, desync hydration). The isomorphic
// build supplies a server DOM, so server and client return IDENTICAL output and hydration matches.
//
// The allow-list is derived from what `RichNoteEditor` can actually author (bold + three fixed
// colors + line breaks — `document.execCommand("bold" | "foreColor")`); it is deliberately NARROWER
// than DOMPurify's default. Anything the editor cannot produce is not permitted to render.

import DOMPurify from "isomorphic-dompurify";

/**
 * Tags the rich-note editor can legitimately author. `execCommand("bold")` emits `<b>`/`<strong>`;
 * `execCommand("foreColor")` emits `<font color>` or `<span style="color:…">` depending on the
 * browser's `styleWithCSS` state; Enter emits `<div>`/`<br>`. Nothing else is admissible — notably
 * NO `<img>`, `<svg>`, `<a>`, `<iframe>`, or `<script>`, which is what closes the bypasses above.
 */
const ALLOWED_TAGS = ["b", "strong", "i", "em", "u", "br", "div", "p", "span", "font"] as const;

/**
 * Attributes permitted on the tags above: the two colour carriers only. DOMPurify parses and
 * sanitizes `style` values, so a CSS-borne payload does not survive. No `href`/`src` is allowed on
 * any tag, so no URL scheme (`javascript:`, `data:`) is reachable in the first place.
 */
const ALLOWED_ATTR = ["color", "style"] as const;

/**
 * Sanitize author-supplied rich-note HTML to the allow-list above, returning markup that is safe to
 * pass to `dangerouslySetInnerHTML`.
 *
 * Fails closed: any tag or attribute not named above is dropped, so an unknown or hostile construct
 * degrades to its text content rather than executing.
 *
 * @param html the untrusted HTML (authored via `RichNoteEditor`, or — once persisted — arriving from
 *             another organization's user; treat every caller as untrusted).
 */
export function sanitizeRichNoteHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [...ALLOWED_TAGS],
    ALLOWED_ATTR: [...ALLOWED_ATTR],
    // Belt-and-braces over the tag allow-list: even if a future edit widens ALLOWED_TAGS, these can
    // never come back.
    FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "img", "svg", "a", "form"],
    FORBID_ATTR: ["srcset", "href", "src", "xlink:href", "formaction", "action"],
    // Return a string (not a TrustedHTML/Node), which is what the injection points consume.
    RETURN_TRUSTED_TYPE: false,
  });
}
