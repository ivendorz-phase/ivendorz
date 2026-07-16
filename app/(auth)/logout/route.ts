// Sign-out route (`POST /logout`) — the ONE place the Supabase session is actually cleared (Doc-7E §2
// auth-exit, the mirror of the login action). ROUTING + COMPOSITION ONLY (REPOSITORY_STRUCTURE §8):
// Supabase Auth sign-out (authentication only — CLAUDE.md §2), then a 303 redirect to the login
// screen's signed-out confirmation.
//
// POST-only, and why it must be: a GET sign-out is CSRF-triggerable and — worse in Next — a `<Link>`
// GET is prefetched on hover, so a GET logout would clear the session just by opening the account
// menu. The account menu submits a real `<form method="post">`; there is deliberately no GET handler.
//
// 303 See Other: the POST result becomes a GET navigation to `/login` (never a re-POST on refresh).
// The Set-Cookie session-clear written by the Supabase server client (via next/headers `cookies()`) is
// merged onto this response by Next.

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/server/auth";

export async function POST(request: Request): Promise<NextResponse> {
  const supabase = await createSupabaseServerClient();
  // Best-effort: even if the SDK reports an error, the session cookies are cleared and we still send
  // the user to the signed-out screen — never leave them sitting on an authenticated affordance.
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/login?signed_out=1", request.url), { status: 303 });
}
