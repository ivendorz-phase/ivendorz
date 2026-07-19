// Vendor Workspace — Messages (VX-03, owner directive 2026-07-17; matches the design's Communication
// "Messages" split-pane). PRESENTATION-ONLY SHELL: M6 (Communication) owns the `conversation-thread`
// embedded component and there is NO unified inbox read in the frozen corpus yet (same posture as the
// buyer `/messages` stub and the clarifications-thread SLOT). So this renders the split-pane STRUCTURE
// with genuine-empty states — no fabricated threads, names, or messages. The composer is disabled
// until the M6 send command is wired. Server Component; no hooks, no fetch (Content ≠ Presentation).
import { MessageSquare, Search, Paperclip } from "lucide-react";
import { PageHeader } from "../../shell";
import { Card } from "@/frontend/primitives/card";
import { Button } from "@/frontend/primitives/button";
import { Input } from "@/frontend/primitives/input";
import { EmptyState } from "@/frontend/components/empty-state";

// Filter presets from the design's conversation list. Presentation-only chips (no counts — a count
// over threads is an unwired aggregate); they carry no active state until the read + client filter
// land. Rendered as static, disabled chips so the structure is visible without faking data.
const FILTERS = ["All", "Unread", "RFQs", "Orders"] as const;

export function MessagesView() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Messages"
        description="Threaded conversations with the buyers you work with. Messages appear here once a conversation starts."
      />

      <Card className="grid min-h-[560px] grid-cols-1 overflow-hidden lg:grid-cols-[340px_1fr]">
        {/* Conversation list pane */}
        <div className="flex min-h-0 flex-col border-b border-border lg:border-b-0 lg:border-r">
          <div className="flex flex-col gap-3 border-b border-border p-4">
            <div className="relative">
              <Search
                aria-hidden
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                type="search"
                placeholder="Search conversations"
                aria-label="Search conversations"
                className="pl-9"
                disabled
              />
            </div>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter conversations">
              {FILTERS.map((f, i) => (
                <span
                  key={f}
                  aria-current={i === 0 ? "true" : undefined}
                  className={
                    i === 0
                      ? "rounded-full bg-iv-brand-600 px-3 py-1 text-xs font-semibold text-white"
                      : "rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground"
                  }
                >
                  {f}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-1 items-center justify-center p-6">
            <EmptyState
              icon={<MessageSquare aria-hidden />}
              title="No conversations yet"
              description="Threads with buyers appear here once a conversation begins."
            />
          </div>
        </div>

        {/* Thread pane */}
        <div className="flex min-h-0 flex-col">
          <div className="flex flex-1 items-center justify-center p-6">
            <EmptyState
              title="Select a conversation"
              description="Choose a thread on the left to read and reply."
            />
          </div>
          {/* Composer — disabled until the M6 send command is wired (never a faked send). */}
          <div className="flex items-end gap-2 border-t border-border p-3">
            <Button type="button" variant="outline" size="icon" aria-label="Attach file" disabled>
              <Paperclip aria-hidden className="size-4" />
            </Button>
            <Input placeholder="Write a message…" aria-label="Write a message" disabled />
            <Button disabled>Send</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
