import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
} from "react-router";
import type { Route } from "./+types/root";
import { readCookie } from "./lib/auth/session.server";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
  { rel: "manifest", href: "/manifest.webmanifest" },
];

export async function loader({ request }: Route.LoaderArgs) {
  const theme = readCookie(request.headers.get("cookie"), "sd_theme");
  return {
    theme: theme === "light" || theme === "dark" ? theme : "system",
  };
}

export function meta() {
  return [
    { title: "Sazar Roadmap" },
    {
      name: "description",
      content:
        "A private learning operating system: guided roadmaps, deliberate practice, spaced review and an AI coach.",
    },
    { name: "robots", content: "noindex, nofollow" },
    { name: "theme-color", content: "#0a0a0a" },
  ];
}

const themeScript = `(function(){try{var c=document.cookie.match(/(?:^|; )sd_theme=(light|dark|system)/);var t=c?c[1]:'system';if(t==='system'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t;}catch(e){}})();`;

export function Layout({ children }: { children: React.ReactNode }) {
  const data = useRouteLoaderData<typeof loader>("root");
  const theme = data?.theme ?? "system";
  return (
    <html lang="en" data-theme={theme === "system" ? undefined : theme}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: the inline theme script must run before CSS to avoid a flash; it contains no user data */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let title = "Something went wrong";
  let detail = "An unexpected error interrupted this page.";
  let status = 500;

  if (isRouteErrorResponse(error)) {
    status = error.status;
    title = error.status === 404 ? "Page not found" : `Error ${error.status}`;
    detail =
      error.status === 404
        ? "The page you asked for does not exist, or it moved."
        : error.statusText || "The server rejected this request.";
  } else if (import.meta.env.DEV && error instanceof Error) {
    detail = error.message;
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center gap-6 px-6 py-16">
      <p className="font-mono text-sm text-muted">{status}</p>
      <div className="space-y-3">
        <h1 className="text-4xl font-semibold tracking-tight">{title}</h1>
        <p className="max-w-prose text-base leading-relaxed text-muted">{detail}</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <a
          href="/"
          className="inline-flex h-10 items-center rounded-md bg-ink px-4 text-sm font-medium text-canvas"
        >
          Back to the dashboard
        </a>
        <a
          href="/roadmaps"
          className="inline-flex h-10 items-center rounded-md border border-line px-4 text-sm font-medium"
        >
          Browse roadmaps
        </a>
      </div>
    </main>
  );
}
