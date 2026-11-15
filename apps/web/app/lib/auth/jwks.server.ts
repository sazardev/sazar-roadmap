/**
 * JWT plumbing for the shared `sd_session` token issued by auth.sazardev.stream.
 *
 * The app only needs auth's public JWKS: no shared symmetric secret, and rotating auth's
 * signing key does not require redeploying every app. Adapted from the sazardev notes hub.
 */

export interface Jwk extends JsonWebKey {
  kty: string;
  kid?: string;
}

export interface JwtParts {
  head: string;
  body: string;
  signature: string;
  /** `head.body`, the bytes the signature covers. */
  signed: Uint8Array<ArrayBuffer>;
}

const KEY_TTL_MS = 60 * 60 * 1000;
const MAX_TOKEN_LENGTH = 6000;
const caches = new Map<string, { at: number; keys: Jwk[] }>();

function decodeBase64Url(part: string): Uint8Array<ArrayBuffer> {
  const base64 = part
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(part.length / 4) * 4, "=");
  return Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
}

export function readJwt(token: string | undefined): JwtParts | null {
  if (!token || token.length > MAX_TOKEN_LENGTH) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [head, body, signature] = parts as [string, string, string];
  return {
    head,
    body,
    signature,
    signed: new TextEncoder().encode(`${head}.${body}`) as Uint8Array<ArrayBuffer>,
  };
}

export const decodeJwtJson = <T>(part: string): T =>
  JSON.parse(new TextDecoder().decode(decodeBase64Url(part))) as T;

export async function fetchJwks(
  url: string,
  now: number,
  fetchImpl: typeof fetch,
  force = false,
): Promise<Jwk[]> {
  const hit = caches.get(url);
  if (!force && hit && now - hit.at < KEY_TTL_MS) return hit.keys;
  const response = await fetchImpl(url, { signal: AbortSignal.timeout(5000) });
  if (!response.ok) throw new Error("jwks");
  const keys = ((await response.json()) as { keys?: Jwk[] }).keys ?? [];
  caches.set(url, { at: now, keys });
  return keys;
}

export function resetJwksCache(): void {
  caches.clear();
}

export const hasAudience = (aud: unknown, expected: string): boolean =>
  ([] as unknown[]).concat(aud ?? []).includes(expected);

export async function verifyJwtSignature(
  algorithm: "RS256" | "ES256",
  jwk: Jwk,
  parts: JwtParts,
): Promise<boolean> {
  if (algorithm === "RS256") {
    if (jwk.kty !== "RSA") return false;
    const key = await crypto.subtle.importKey(
      "jwk",
      jwk,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["verify"],
    );
    return crypto.subtle.verify(
      "RSASSA-PKCS1-v1_5",
      key,
      decodeBase64Url(parts.signature) as BufferSource,
      parts.signed as BufferSource,
    );
  }

  if (jwk.kty !== "EC" || jwk.crv !== "P-256" || !jwk.x || !jwk.y) return false;
  const key = await crypto.subtle.importKey(
    "jwk",
    { kty: "EC", crv: "P-256", x: jwk.x, y: jwk.y, ext: true },
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["verify"],
  );
  return crypto.subtle.verify(
    { name: "ECDSA", hash: "SHA-256" },
    key,
    decodeBase64Url(parts.signature) as BufferSource,
    parts.signed as BufferSource,
  );
}
