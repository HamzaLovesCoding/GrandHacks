// POST /api/messages/ takes one Contact or Sponsor form: { kind: "contact" | "sponsor", ...fields }.
import { randomUUID } from "node:crypto";
import { clientIp, json, readJson } from "../../lib/http";
import { check } from "../../lib/messages";
import { openStore } from "../../lib/store";

// about five sends from one address every ten minutes
const SENDS = 5,
  WINDOW = 10 * 60;

let warned = false;

export async function POST(request: Request) {
  const store = openStore();
  if (!store) {
    if (!warned) console.error("The forms aren't set up: they need Upstash Redis (KV_REST_API_URL and KV_REST_API_TOKEN). See SETUP-FORMS.md.");
    warned = true;
    return json({ ok: false, error: "Forms aren't set up yet" }, 503);
  }
  const body = await readJson(request);
  if (!body) return json({ ok: false, error: "Send the form's fields as JSON" }, 400);
  // Only a bot fills in the hidden field. It hears the same thanks, and nothing is kept.
  if (body.website) return json({ ok: true });
  const { value, problems } = check(body);
  if (!value) return json({ ok: false, error: "Some fields need a fix", problems }, 400);
  try {
    const sent = await store.count("send:" + clientIp(request), WINDOW);
    if (sent.n > SENDS)
      return json({ ok: false, error: "Too many messages. Try again in a few minutes." }, 429, {
        "Retry-After": String(sent.ttl),
      });
    // The address stops at the counter: the message itself never holds it.
    await store.add({ id: randomUUID(), createdAt: new Date().toISOString(), ...value, status: "new" });
    return json({ ok: true });
  } catch (error) {
    console.error("A message couldn't be saved:", (error as Error).message);
    return json({ ok: false, error: "The message couldn't be saved" }, 500);
  }
}
