import { createRequestHandler, type ServerBuild } from "react-router";

declare module "react-router" {
  export interface AppLoadContext {
    cloudflare: {
      env: Env;
      ctx: ExecutionContext;
    };
  }
}

const requestHandler = createRequestHandler(
  // React Router's generated build type uses optional properties that exactOptionalPropertyTypes
  // does not accept directly; the runtime shape is the documented Cloudflare integration.
  () => import("virtual:react-router/server-build") as unknown as Promise<ServerBuild>,
  import.meta.env.MODE,
);

export default {
  fetch(request, env, ctx) {
    return requestHandler(request, {
      cloudflare: { env, ctx },
    });
  },
} satisfies ExportedHandler<Env>;
