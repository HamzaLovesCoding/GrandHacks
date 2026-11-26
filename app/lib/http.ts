import { NextResponse } from "next/server";

// A form's answers are a few kilobytes at most.
const MOST = 32_000;

// Every answer from the forms' and the portal's routes: JSON that no cache along the way keeps.
export function json(data: unknown, status = 200, headers?: Record<string, string>) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store", ...headers } });
}

// The body as a JSON object, or undefined when it isn't one. Only a JSON request counts, so a plain
// HTML form on another site can't post here.
export async function readJson(request: Request): Promise<Record<string, unknown> | undefined> {
  if (!request.headers.get("content-type")?.includes("application/json")) return;
  if (Number(request.headers.get("content-length")) > MOST) return;
  const text = await request.text().catch(() => "");
  if (text.length > MOST) return;
  try {
    const body: unknown = JSON.parse(text);
    return body && typeof body === "object" && !Array.isArray(body) ? (body as Record<string, unknown>) : undefined;
  } catch {
    return undefined;
  }
}

// The visitor's address as Vercel passes it on. It's only ever part of a counter's key, which expires.
export function clientIp(request: Request) {
  const h = request.headers;
  return (h.get("x-real-ip") || h.get("x-forwarded-for")?.split(",")[0] || "").trim() || "unknown";
}
