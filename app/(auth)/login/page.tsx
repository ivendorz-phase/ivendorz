// Login route (`/login`) — the auth-entry screen in the (auth) route group (Doc-7C §2.1; Doc-7E
// §2 / ER2). Unauthenticated; no active-org context (Doc-7C §2.1). RSC shell composing the client
// sign-in form. Authentication via Supabase Auth ONLY (Doc-7C §3.1); no `create_user` coined
// (Doc-7E §2 / [ESC-7-API-SIGNUP]). Minimal placeholder chrome — the Doc-7B kit + full Doc-7E
// content land in their own wave.

import { LoginForm } from "./login-form";

export const metadata = {
  title: "Sign in — iVendorz",
};

export default function LoginPage() {
  return (
    <main>
      <h1>Sign in</h1>
      <LoginForm />
    </main>
  );
}
