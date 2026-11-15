import {
  decodeJwtJson,
  fetchJwks,
  hasAudience,
  type Jwk,
  readJwt,
  verifyJwtSignature,
} from "./jwks.server";

export interface SessionConfig {
  authUrl: string;
  aud: string;
}

interface Claims {
  iss?: string;
  aud?: string | string[];
  sub?: string;
  email?: string;
  sid?: string;
  exp?: number;
  nbf?: number;
}

export type SessionResult = { ok: true; email: string; sub: string; sid: string } | { ok: false };

/** True only for an unexpired ES256 token signed by our auth Worker for this audience. */
export async function verifySessionJwt(
  token: string | undefined,
  config: SessionConfig,
  deps: { fetch?: typeof fetch; now?: number } = {},
): Promise<SessionResult> {
  const parts = readJwt(token);
  if (!parts || !config.authUrl) return { ok: false };
  const fetchImpl = deps.fetch ?? fetch;
  const now = deps.now ?? Date.now();
  const jwksUrl = `${config.authUrl}/.well-known/jwks.json`;

  try {
    const header = decodeJwtJson<{ alg?: string; kid?: string }>(parts.head);
    const claims = decodeJwtJson<Claims>(parts.body);
    if (header.alg !== "ES256") return { ok: false };
    if (claims.iss !== config.authUrl) return { ok: false };
    if (typeof claims.exp !== "number" || claims.exp * 1000 <= now) return { ok: false };
    if (typeof claims.nbf === "number" && claims.nbf * 1000 > now + 60_000) return { ok: false };
    if (typeof claims.sub !== "string" || typeof claims.sid !== "string") return { ok: false };
    if (!hasAudience(claims.aud, config.aud)) return { ok: false };

    const verify = async (keys: Jwk[]) => {
      const jwk = keys.find(
        (key) => key.kid === header.kid && key.kty === "EC" && key.crv === "P-256",
      );
      return jwk ? verifyJwtSignature("ES256", jwk, parts) : false;
    };

    let valid = await verify(await fetchJwks(jwksUrl, now, fetchImpl));
    if (!valid) valid = await verify(await fetchJwks(jwksUrl, now, fetchImpl, true));

    return valid
      ? {
          ok: true,
          email: typeof claims.email === "string" ? claims.email : "",
          sub: claims.sub,
          sid: claims.sid,
        }
      : { ok: false };
  } catch {
    return { ok: false };
  }
}

export function readCookie(header: string | null | undefined, name: string): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) {
      try {
        return decodeURIComponent(rest.join("="));
      } catch {
        return rest.join("=");
      }
    }
  }
  return undefined;
}
