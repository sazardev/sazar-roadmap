import { type LoaderFunctionArgs, redirect } from "react-router";
import { getEnv } from "~/lib/db.server";

export async function loader({ context }: LoaderFunctionArgs) {
  const env = getEnv(context);
  if (!env.AUTH_URL) return redirect("/");
  return redirect(`${env.AUTH_URL}/logout?next=${encodeURIComponent(env.PUBLIC_URL)}`);
}
