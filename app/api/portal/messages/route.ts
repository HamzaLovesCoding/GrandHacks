// GET /api/portal/messages/ lists every message, newest first, to a signed-in organizer.
import type { NextRequest } from "next/server";
import { json } from "../../../lib/http";
import { gate } from "../../../lib/portal";

export async function GET(request: NextRequest) {
  const { setup, denied } = gate(request);
  if (denied) return denied;
  try {
    const messages = (await setup.store.list()).sort((a, b) =>
      a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0,
    );
    return json({ ok: true, messages });
  } catch (error) {
    console.error("The messages couldn't be read:", (error as Error).message);
    return json({ ok: false, error: "The messages couldn't be read" }, 500);
  }
}
