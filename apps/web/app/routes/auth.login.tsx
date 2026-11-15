import { redirect } from "react-router";
import { getEnv } from "~/lib/db.server";
import { safeRedirect } from "~/lib/utils";
import type { Route } from "./+types/auth.login";

export const meta = () => pageMeta("Sign in");

import { pageMeta } from "~/lib/meta";

export async function loader({ request, context }: Route.LoaderArgs) {
  const env = getEnv(context);
  if (!env.AUTH_URL) {
    return new Response("Authentication is not configured.", { status: 503 });
  }
  const url = new URL(request.url);
  const next = safeRedirect(url.searchParams.get("next"), "/");
  const target = new URL(next, env.PUBLIC_URL).toString();
  return redirect(`${env.AUTH_URL}/login?next=${encodeURIComponent(target)}`);
}

export default function Login() {
  return null;
}
