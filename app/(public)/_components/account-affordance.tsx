"use client";

// Public header — authenticated-visitor affordance (Doc-7D §12, owner-approved 2026-07-22; the corpus
// fold of §12 into `Doc-7D_SERIES_FROZEN_v1.0` v1.2 → v1.3 is a human record action, NOT yet performed
// — see `governanceReviews/Doc-7D_SessionAwareHeader_Additive_Patch_PROPOSAL.md`).
//
// CLIENT-ONLY, OWN-IDENTITY-ONLY. This component answers one question — "is a session present, and if
// so, whose?" — and swaps navigation chrome on the answer. The bounds are binding:
//
//  • §12.1 — the auth session is read in the BROWSER ONLY. `(public)` must never read `cookies()`
//    server-side: that would make every public route dynamic and forfeit the SSG/CDN posture PR7
//    mandates. The server-rendered HTML ships the ANONYMOUS header (also what crawlers index); identity
//    fills in AFTER hydration. `present` starts false, so first paint == the server HTML.
//  • §12.3-A (owner, 2026-07-22 — reverses the same-day neutral-glyph ruling) — the menu renders the
//    viewer's OWN identity (email + initials avatar), for parity with the dashboard `UserMenu`. It is
//    still forbidden to render anything ORG-SCOPED — organization, participation, counts, private /
//    blacklist status (Inv #5, #11 untouched). The identity shown is the viewer's own, never a third
//    party's.
//  • §12.4.1 — NO new data call. Email comes from the SAME `getSession()` the presence probe already
//    makes (`session.user.email`); no Doc-5 contract call is added. The canonical display NAME is not
//    in the auth session — it is DB-resolved through the DEFERRED Doc-7C SR3 layer, which is why the
//    dashboard menu this mirrors is itself a neutral fixture today. So until SR3 wires, this shows the
//    real email (+ email-derived initials) and a name ONLY if the session already carries one
//    (`user_metadata`). No placeholder name is fabricated (no read ⇒ no figure; GI-03); the name
//    populates on BOTH surfaces together when SR3 lands.
//  • §12.4.4 — GATES NOTHING. Every destination re-validates server-side.
//  • §12.4.5 / §12.4.6 — both states occupy an equal CTA-region footprint (`MIN_W`, sized to the wider
//    anonymous cluster) so the swap does not resize the region; the swap fades via the token layer
//    (which honours `prefers-reduced-motion` globally), never a blocking skeleton.
//
// The Supabase client is imported through a bare `import()` inside the effect, NOT at module scope.
// `SiteHeader` is reachable from the root layout, so a module-scope import would pull `@supabase/ssr`
// into the chunk every route eagerly loads — the same bundling trap documented in `site-header.tsx`
// for the mobile Explorer.
import * as React from "react";
import Link from "next/link";
import { LayoutDashboard, LifeBuoy, LogOut, Settings, User } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { Avatar, AvatarFallback } from "@/frontend/primitives/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/frontend/primitives/dropdown-menu";
import { initials } from "@/frontend/lib/initials";

/** Canonical workspace entry (§12.2) — server-resolves which workspace to open; never decided here. */
const WORKSPACE_ENTRY = "/dashboard";
/** Sign-out endpoint (§12.2). POST, never a link: a GET logout is prefetched on hover and would end
 *  the session unbidden — the defect `user-menu.tsx` was fixed for. */
const SIGN_OUT_ACTION = "/logout";
/** Account surface (Doc-7E) — Account and Settings both resolve here, mirroring the dashboard menu. */
const ACCOUNT_HREF = "/account";
/** "Help" → the real `/contact` ("Contact & support"); no help-centre surface exists, so no href
 *  promises one. The dashboard's own "Help" is a placeholder link; here it points at a real page. */
const HELP_HREF = "/contact";

/**
 * §12.4.5 — equal CTA-region footprint across both states. Sized to the WIDER (anonymous) cluster —
 * `Sign in` (ghost) + `Get started` (outline) + `gap-2` ≈ 10.9rem — so the anonymous cluster fits
 * WITHIN this floor rather than exceeding it, and the narrower authenticated avatar is clamped UP to
 * the same width. Both states therefore occupy an identical, right-justified region: a value below the
 * anonymous cluster's natural width (the earlier 9.5rem) is only a floor and leaves the two states
 * different widths. The swap of content inside the region is the expected, accepted transition
 * (§12.4.6), and never appears in the indexed anonymous document (§12.1).
 */
const MIN_W = "min-w-[11.5rem]";

/** The viewer's OWN identity as the browser can see it (§12.3-A / §12.4.1). `email` is from the auth
 *  session; `name` is present only if the session carries one (`user_metadata`) — see the file header. */
export interface SessionIdentity {
  present: boolean;
  email: string | null;
  name: string | null;
}

const ANONYMOUS: SessionIdentity = { present: false, email: null, name: null };

/** Derive the own-identity view-model from a Supabase session (or its absence). Reads only the
 *  viewer's own email/name — never anything org-scoped (§12.3-A). */
function deriveIdentity(
  session: {
    user?: { email?: string | null; user_metadata?: Record<string, unknown> };
  } | null,
): SessionIdentity {
  if (!session) return ANONYMOUS;
  const meta = session.user?.user_metadata as { full_name?: string; name?: string } | undefined;
  const name =
    (typeof meta?.full_name === "string" && meta.full_name.trim()) ||
    (typeof meta?.name === "string" && meta.name.trim()) ||
    null;
  return { present: true, email: session.user?.email ?? null, name };
}

/**
 * Reads the browser auth session (§12.1) and returns the viewer's own identity. `present` is `false`
 * until resolved, so the first paint always matches the server-rendered anonymous HTML.
 *
 * "Present" means the auth client considers the visitor authenticated FOR NAVIGATION PURPOSES. Absent,
 * expired, or not-yet-established all count as anonymous — never an authorization decision (§12.4.4).
 */
export function useSessionIdentity(): SessionIdentity {
  const [identity, setIdentity] = React.useState<SessionIdentity>(ANONYMOUS);

  React.useEffect(() => {
    // Env is statically inlined by Next; when unset (local prototype runs, preview builds without auth
    // wired) there is no client to construct, and the visitor is simply anonymous.
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return;

    let active = true;
    let unsubscribe: (() => void) | undefined;

    import("@/server/auth/client")
      .then(async ({ createSupabaseBrowserClient }) => {
        const supabase = createSupabaseBrowserClient();
        const { data } = await supabase.auth.getSession();
        if (!active) return;
        setIdentity(deriveIdentity(data.session));

        // Sign-in/sign-out in another tab must not leave a stale header behind.
        const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
          if (active) setIdentity(deriveIdentity(session));
        });
        unsubscribe = () => sub.subscription.unsubscribe();
      })
      .catch(() => {
        // Identity is chrome. A failed probe means "anonymous" — never a blocked or broken header.
      });

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  return identity;
}

/**
 * Row-1 auth cluster. Anonymous: `Sign in` · `Get started` (PR5 — unchanged, §12.5). Authenticated: an
 * account menu carrying the viewer's own identity + the same item set as the dashboard `UserMenu`
 * (§12.3-A). The workspace entry (removed as a standalone button by §12.2-A) leads the menu — it is the
 * headline action, the reason this menu exists.
 */
export function PublicAccountAffordance({ session }: { session: SessionIdentity }) {
  if (!session.present) {
    return (
      <div className={`flex items-center justify-end gap-2 ${MIN_W}`}>
        <Button asChild variant="ghost" size="sm">
          <Link href="/login">Sign in</Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/login">Get started</Link>
        </Button>
      </div>
    );
  }

  // Own-identity only. Name shows when the session carries one; otherwise the email is the identity
  // line (never a fabricated name — §12.4.1 wiring note).
  const primaryLabel = session.name ?? session.email ?? "Signed in";
  const avatarSeed = session.name ?? session.email?.split("@")[0] ?? "";
  const avatarInitials = avatarSeed ? initials(avatarSeed) : <User aria-hidden="true" />;

  return (
    <div className={`flex animate-iv-fade-in items-center justify-end gap-2 ${MIN_W}`}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full" aria-label="Account menu">
            <Avatar className="size-8">
              <AvatarFallback>{avatarInitials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        {/* z-tier: this menu is launched from ROW 1 of a TWO-ROW sticky header, so its panel extends
            down across row 2 — which is inside the same `--iv-z-sticky` (200) element. The kit's
            default `--iv-z-dropdown` (100) therefore paints the first menu item UNDERNEATH row 2
            (verified: the first item was invisible). `--iv-z-mega-menu` (250) is the tier the kit
            documents as "above sticky header, below overlay/modal" (`navigation-menu.tsx`) and is the
            correct layer for chrome-launched surfaces. Row 2's own "More" dropdown does not need this
            — it opens downward into page content, not across sticky chrome. */}
        <DropdownMenuContent align="end" className="w-56 z-[var(--iv-z-mega-menu)]">
          {/* Own identity (§12.3-A). Name line renders only when the session carries a name; the email
              is always the secondary line (or the only line). No org line — org is org-scoped and
              stays forbidden (Inv #5/#11). */}
          <DropdownMenuLabel className="flex flex-col">
            <span className="truncate font-medium">{primaryLabel}</span>
            {session.name && session.email ? (
              <span className="truncate text-xs font-normal text-muted-foreground">
                {session.email}
              </span>
            ) : null}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {/* Same item set as the dashboard `UserMenu`, with the workspace entry leading (§12.2-A). */}
          <DropdownMenuItem asChild>
            <Link href={WORKSPACE_ENTRY}>
              <LayoutDashboard aria-hidden="true" /> Dashboard
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={ACCOUNT_HREF}>
              <User aria-hidden="true" /> Account
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={ACCOUNT_HREF}>
              <Settings aria-hidden="true" /> Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={HELP_HREF}>
              <LifeBuoy aria-hidden="true" /> Help
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <form action={SIGN_OUT_ACTION} method="post">
            <DropdownMenuItem asChild>
              <button type="submit" className="w-full cursor-pointer">
                <LogOut aria-hidden="true" /> Log out
              </button>
            </DropdownMenuItem>
          </form>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

/**
 * Presence-dependent destination for a conversion CTA (§12.2). The LABEL never changes — only where it
 * goes — so the anonymous copy PR5 governs is untouched and no layout shifts on hydration.
 *
 * Takes `present` rather than probing itself: the header resolves the session ONCE and threads it down.
 */
export function authedHref(present: boolean, anonymousHref: string, authenticatedHref: string) {
  return present ? authenticatedHref : anonymousHref;
}
