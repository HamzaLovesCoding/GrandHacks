// PATCH /api/portal/messages/<id>/ sets { status: "new" | "replied" | "archived" }. DELETE removes it.
import type { NextRequest } from "next/server";
import { json, readJson } from "../../../../lib/http";
import { statuses } from "../../../../lib/messages";
import { gate } from "../../../../lib/portal";

type Context = { params: Promise<{ id: string }> };

// Every message's id is a random UUID, so anything else can't be one.
const ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const missing = () => json({ ok: false, error: "There's no message with that id" }, 404);

export async function PATCH(request: NextRequest, { params }: Context) {
  const { setup, denied } = gate(request);
  if (denied) return denied;
  const { id } = await params;
  if (!ID.test(id)) return missing();
  const body = await readJson(request);
  const status = statuses.find((s) => s === body?.status);
  if (!status) return json({ ok: false, error: "The status must be new, replied or archived" }, 400);
  try {
    const message = await setup.store.mark(id, status);
    return message ? json({ ok: true, message }) : missing();
  } catch (error) {
    console.error("A message's status couldn't be changed:", (error as Error).message);
    return json({ ok: false, error: "The change couldn't be saved" }, 500);
  }
}

export async function DELETE(request: NextRequest, { params }: Context) {
  const { setup, denied } = gate(request);
  if (denied) return denied;
  const { id } = await params;
  if (!ID.test(id)) return missing();
  try {
    return (await setup.store.remove(id)) ? json({ ok: true }) : missing();
  } catch (error) {
    console.error("A message couldn't be deleted:", (error as Error).message);
    return json({ ok: false, error: "The message couldn't be deleted" }, 500);
  }
}
