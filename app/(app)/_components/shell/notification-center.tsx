"use client";

// Platform shell — global notification center (Doc-7C SR6 · IA §5.4). Doc-7C DEFINES this slot; it
// composes frozen kit primitives and renders M6 `Doc-5H` notification reads. PRESENTATION ONLY: items +
// unread count arrive by props; the mutations (`mark_notification_read` / `archive_notification`,
// Doc-5H §5) are DEFERRED. NON-DISCLOSURE-bound (CHK-7-040): renders only what is passed; the unread
// count is non-disclosure-safe (no excluded/blacklisted/buyer-private signal). Reuses the kit DropdownMenu.
import { Bell } from "lucide-react";
import { cn } from "@/frontend/lib/cn";
import { Button } from "@/frontend/primitives/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/frontend/primitives/dropdown-menu";
import type { NotificationItem } from "./types";

export function NotificationCenter({
  notifications = [],
  unreadCount = 0,
}: {
  notifications?: NotificationItem[];
  unreadCount?: number;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
        >
          <Bell />
          {unreadCount > 0 ? (
            <span
              aria-hidden="true"
              data-numeric
              className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-2xs font-semibold tabular-nums text-primary-foreground"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <p className="px-2 py-6 text-center text-sm text-muted-foreground">
            You&apos;re all caught up.
          </p>
        ) : (
          <ul className="max-h-80 overflow-y-auto">
            {notifications.map((n) => (
              <li key={n.id} className="flex flex-col gap-0.5 rounded-sm px-2 py-2">
                <div className="flex items-center gap-2">
                  {!n.read ? (
                    <>
                      <span
                        aria-hidden="true"
                        className="size-1.5 shrink-0 rounded-full bg-primary"
                      />
                      <span className="sr-only">Unread:</span>
                    </>
                  ) : null}
                  <span
                    className={cn(
                      "text-sm",
                      n.read ? "text-foreground" : "font-medium text-foreground",
                    )}
                  >
                    {n.title}
                  </span>
                  {n.timeLabel ? (
                    <span className="ml-auto shrink-0 text-2xs text-muted-foreground">
                      {n.timeLabel}
                    </span>
                  ) : null}
                </div>
                {n.body ? <span className="text-xs text-muted-foreground">{n.body}</span> : null}
              </li>
            ))}
          </ul>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
