// Who may read the messages: whoever knows PORTAL_PASSCODE, for 12 hours at a time. A session is a
// cookie that holds its own expiry and an HMAC of it made with PORTAL_SECRET, so nothing about it is
// stored, and changing either variable signs everyone out.
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";
import { json } from "./http";
import { openStore, type Store } from "./store";

export const COOKIE = "gh_portal";
export const SESSION = 12 * 60 * 60;
// A short passcode can be guessed from enough addresses, so the portal stays shut until it's long.
const SHORTEST_PASSCODE = 12,
  SHORTEST_SECRET = 32;

export type Setup = { store: Store; passcode: string; secret: string };

let warned = false;
// null until Upstash (or the development file), PORTAL_PASSCODE and PORTAL_SECRET are all in place.
export function portalSetup(): Setup | null {
  const passcode = (process.env.PORTAL_PASSCODE ?? "").trim(),
    secret = (process.env.PORTAL_SECRET ?? "").trim(),
    store = openStore();
  const missing = [
    !store && "KV_REST_API_URL and KV_REST_API_TOKEN (Upstash Redis, from the Vercel Marketplace)",
    passcode.length < SHORTEST_PASSCODE && `PORTAL_PASSCODE (${SHORTEST_PASSCODE}+ characters)`,
    secret.length < SHORTEST_SECRET && `PORTAL_SECRET (${SHORTEST_SECRET}+ characters)`,
  ].filter(Boolean);
  if (missing.length) {
    if (!warned) console.error("The portal isn't set up. It needs " + missing.join(", ") + ". See SETUP-FORMS.md.");
    warned = true;
    return null;
  }
  return { store, passcode, secret };
}

const digest = (text: string) => createHash("sha256").update(text).digest();

// Both sides are hashed first, so the compare takes the same time whatever was typed, even its length.
export function passcodeMatches(given: string, setup: Setup) {
  return timingSafeEqual(digest(given.trim()), digest(setup.passcode));
}

function sign(expires: number, setup: Setup) {
  return createHmac("sha256", setup.secret)
    .update(`portal:${expires}:`)
    .update(digest(setup.passcode))
    .digest("base64url");
}

export function newSession(setup: Setup) {
  const expires = Math.floor(Date.now() / 1000) + SESSION;
  return `${expires}.${sign(expires, setup)}`;
}

export function signedIn(request: NextRequest, setup: Setup) {
  const found = /^(\d{1,12})\.([\w-]{43})$/.exec(request.cookies.get(COOKIE)?.value ?? "");
  if (!found) return false;
  const expires = Number(found[1]),
    now = Date.now() / 1000;
  if (expires <= now || expires > now + SESSION + 60) return false;
  const want = Buffer.from(sign(expires, setup)),
    got = Buffer.from(found[2]);
  return want.length === got.length && timingSafeEqual(want, got);
}

// Only the portal's own routes ever see the cookie, and no script on the page can read it.
export const cookie = (maxAge: number) => ({
  httpOnly: true,
  // Safari won't keep a Secure cookie from http://localhost, so it's only left off in development.
  secure: process.env.NODE_ENV !== "development",
  sameSite: "strict" as const,
  path: "/api/portal",
  maxAge,
});

export const notSetUp = () => json({ ok: false, error: "The portal isn't set up yet" }, 503);

// Every portal route starts here: no setup, 503; no valid session, 401; otherwise the store.
export function gate(request: NextRequest): { setup: Setup | null; denied: Response | null } {
  const setup = portalSetup();
  if (!setup) return { setup: null, denied: notSetUp() };
  if (!signedIn(request, setup)) return { setup: null, denied: json({ ok: false, error: "Sign in first" }, 401) };
  return { setup, denied: null };
}
