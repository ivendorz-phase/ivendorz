import { handleInviteIngress } from "@/server/auth/invite-ingress";

// `GET /invite?token=…` — the P2-A2 URL-redacting ingress (Doc-7E_GrowthHub_Patch_v1.0.1 §2(b);
// Doc-5C v1.0.1 §3 token hygiene). Thin delegate: the behavior (HttpOnly cookie carriage +
// 303 redirect to the token-free `/invite/welcome`) lives in `src/server/auth/invite-ingress`
// (REPOSITORY_STRUCTURE §8 — `app/` is composition only). The raw token never rests in a URL
// past this hop and is never logged.

export const dynamic = "force-dynamic";

export function GET(request: Request): Promise<Response> {
  return handleInviteIngress(request);
}
