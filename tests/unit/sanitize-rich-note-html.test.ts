import { describe, expect, it } from "vitest";
import { sanitizeRichNoteHtml } from "@/frontend/lib/sanitize-html";

// Security regression guard for the rich-note HTML allow-list (`src/frontend/lib/sanitize-html.ts`)
// — the single gate in front of every `dangerouslySetInnerHTML` injection point.
//
// These cases pin the EXACT payloads that defeated the prior regex BLOCKLIST (which stripped
// `<script>…</script>` and QUOTED `on*="…"` / `on*='…'` handlers only, so unquoted-attribute
// payloads survived). The blocklist was duplicated byte-identically in `rich-note-editor` and
// `quotation-document`; both now delegate here. If someone reintroduces a regex scrub, these fail.
//
// Threat model: an RFQ item description is authored by a BUYER and rendered to every invited VENDOR
// (and a quotation line note travels the other way). Once that content is persisted, any surviving
// handler is a STORED cross-tenant XSS — hence "assume every caller is untrusted".

describe("sanitizeRichNoteHtml — allow-list gate (XSS regression guard)", () => {
  describe("payloads that defeated the prior regex blocklist", () => {
    it("neutralizes an UNQUOTED onerror handler (the primary bypass)", () => {
      const out = sanitizeRichNoteHtml("<img src=x onerror=alert(1)>");
      expect(out).not.toContain("onerror");
      expect(out).not.toContain("<img");
    });

    it("neutralizes an unquoted svg onload handler", () => {
      const out = sanitizeRichNoteHtml("<svg onload=alert(1)></svg>");
      expect(out).not.toContain("onload");
      expect(out).not.toContain("<svg");
    });

    it("strips a javascript: URL (the href scheme the blocklist never inspected)", () => {
      const out = sanitizeRichNoteHtml('<a href="javascript:alert(1)">click</a>');
      expect(out).not.toContain("javascript:");
      expect(out).not.toContain("href");
    });

    it("strips an UNCLOSED script tag (the blocklist required a closing tag)", () => {
      const out = sanitizeRichNoteHtml("<script src=//evil.example/x.js>");
      expect(out).not.toContain("<script");
    });
  });

  describe("the general blocklist-leak class", () => {
    it.each([
      ["quoted handler", '<div onclick="alert(1)">x</div>'],
      ["single-quoted handler", "<div onclick='alert(1)'>x</div>"],
      ["closed script", "<script>alert(1)</script>"],
      ["iframe", '<iframe src="//evil.example"></iframe>'],
      ["nested-mangled script", "<scr<script>ipt>alert(1)</script>"],
      ["body onload", "<body onload=alert(1)>"],
      ["data URI object", '<object data="data:text/html,<script>alert(1)</script>"></object>'],
    ])("neutralizes %s", (_label, payload) => {
      const out = sanitizeRichNoteHtml(payload);
      expect(out).not.toMatch(/<(script|iframe|object|embed|svg|img)\b/i);
      expect(out).not.toMatch(/\son\w+\s*=/i);
      expect(out).not.toContain("javascript:");
    });
  });

  describe("legitimate editor output survives", () => {
    // What `RichNoteEditor` can actually author: execCommand("bold") + execCommand("foreColor")
    // (emitting `<font color>` or `<span style="color:…">` per the browser's styleWithCSS state)
    // + Enter line breaks. The allow-list is derived from exactly this set.
    it("preserves bold", () => {
      expect(sanitizeRichNoteHtml("<b>bold</b>")).toContain("<b>bold</b>");
      expect(sanitizeRichNoteHtml("<strong>bold</strong>")).toContain("<strong>bold</strong>");
    });

    it("preserves the font-color carrier", () => {
      const out = sanitizeRichNoteHtml('<font color="#1f3154">navy</font>');
      expect(out).toContain("navy");
      expect(out).toContain("#1f3154");
    });

    it("preserves the span style-color carrier", () => {
      const out = sanitizeRichNoteHtml('<span style="color: rgb(31, 49, 84)">navy</span>');
      expect(out).toContain("navy");
      expect(out).toContain("color");
    });

    it("preserves line breaks and plain text", () => {
      expect(sanitizeRichNoteHtml("line one<br>line two")).toContain("<br>");
      expect(sanitizeRichNoteHtml("MS plate 10mm")).toBe("MS plate 10mm");
    });

    it("keeps the text content of a stripped tag (degrades, never blanks)", () => {
      expect(sanitizeRichNoteHtml("<a href=/x>10mm plate</a>")).toContain("10mm plate");
    });
  });

  it("returns an empty string for empty input", () => {
    expect(sanitizeRichNoteHtml("")).toBe("");
  });
});
