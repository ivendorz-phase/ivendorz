"use client";

// Platform shell — user menu (IA §4.7). Distinct from the org-switcher (which changes tenant context).
// Account/settings link to the real `/account` surface (Doc-7E). Log out submits a real POST to the
// `/logout` route (Supabase sign-out — Doc-7E §2 auth-exit); it is a native `<form method="post">`, not
// a `<Link>`, because a GET logout is prefetched on hover and would clear the session unbidden. Reuses
// the frozen kit Avatar + DropdownMenu.
import Link from "next/link";
import { LifeBuoy, LogOut, Settings, User } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/frontend/primitives/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/frontend/primitives/dropdown-menu";
import { initials, type ShellUser } from "./types";

export function UserMenu({ user }: { user: ShellUser }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full" aria-label="Account menu">
          <Avatar className="size-8">
            {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt="" /> : null}
            <AvatarFallback>{initials(user.name)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col">
          <span className="truncate font-medium">{user.name}</span>
          <span className="truncate text-xs font-normal text-muted-foreground">{user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/account">
            <User aria-hidden="true" /> Account
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account">
            <Settings aria-hidden="true" /> Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/">
            <LifeBuoy aria-hidden="true" /> Help
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <form action="/logout" method="post">
          <DropdownMenuItem asChild>
            <button type="submit" className="w-full cursor-pointer">
              <LogOut aria-hidden="true" /> Log out
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
