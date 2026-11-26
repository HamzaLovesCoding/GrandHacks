// POST /api/portal/session/ signs in with { passcode }. DELETE signs out.
import type { NextRequest } from "next/server";
import { clientIp, json, readJson } from "../../../lib/http";
import { cookie, COOKIE, newSession, notSetUp, passcodeMatches, portalSetup, SESSION } from "../../../lib/portal";

// five wrong tries from one address, then a fifteen-minute pause
const TRIES = 5,
  PAUSE = 15 * 60;

const paused = (seconds: number) =>
  json({ ok: false, error: "Too many wrong tries", retryAfter: seconds }, 429, { "Retry-After": String(seconds) });

export async function POST(request: NextRequest) {
  const setup = portalSetup();
  if (!setup) return notSetUp();
  const body = await readJson(request);
  const given = typeof body?.passcode === "string" ? body.passcode.trim() : "";
  if (!given || given.length > 1000) return json({ ok: false, error: "Enter the passcode" }, 400);
  const key = "pass:" + clientIp(request);
  try {
    // Every try counts, the right one too, until it clears the count. A paused address isn't checked at all.
    const tries = await setup.store.count(key, PAUSE);
    if (tries.n > TRIES) return paused(tries.ttl);
    if (passcodeMatches(given, setup)) {
      await setup.store.forget(key);
      const res = json({ ok: true });
      res.cookies.set(COOKIE, newSession(setup), cookie(SESSION));
      return res;
    }
    if (tries.n === TRIES) {
      // the pause runs a full fifteen minutes from the last wrong try
      await setup.store.hold(key, PAUSE);
      return paused(PAUSE);
    }
    return json({ ok: false, error: "Wrong passcode", left: TRIES - tries.n }, 401);
  } catch (error) {
    console.error("The passcode couldn't be checked:", (error as Error).message);
    return json({ ok: false, error: "The passcode couldn't be checked" }, 500);
  }
}

// Signing out takes the cookie away. Nothing else needs to change, so this works even before setup.
export async function DELETE() {
  const res = json({ ok: true });
  res.cookies.set(COOKIE, "", cookie(0));
  return res;
}
