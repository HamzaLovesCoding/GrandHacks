// Where messages and the short-lived counters live: Upstash Redis, spoken to over its REST API, or,
// when it isn't connected and this is development, a JSON file at .data/messages.json with the
// counters in memory.
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Message, Status } from "./messages";

// How many times a key has been counted in its window, and how many seconds the window has left.
export type Tally = { n: number; ttl: number };

export type Store = {
  add(message: Message): Promise<void>;
  list(): Promise<Message[]>;
  mark(id: string, status: Status): Promise<Message | null>;
  remove(id: string): Promise<boolean>;
  // a window opens at the first count and closes `seconds` later
  count(key: string, seconds: number): Promise<Tally>;
  // restarts a key's window from now
  hold(key: string, seconds: number): Promise<void>;
  forget(key: string): Promise<void>;
};

// null when the forms aren't set up: no Upstash, and this isn't development. LOCAL_MESSAGES_FILE=1
// lets a production build on your own computer (next start) use the file too. Never set it on Vercel.
// The Vercel Marketplace names the variables KV_REST_API_*; Upstash's own setup names them UPSTASH_REDIS_REST_*.
export function openStore(): Store | null {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL,
    token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) return upstash(url.replace(/\/+$/, ""), token);
  if (process.env.NODE_ENV === "development" || process.env.LOCAL_MESSAGES_FILE === "1") return local;
  return null;
}

/* ---------- Upstash Redis ---------- */
// Each message is a field of one hash, as JSON, and its status a field of another, so a status
// change never rewrites the message. Counters are keys of their own with an expiry.
const MESSAGES = "gh:messages",
  STATUS = "gh:status",
  COUNT = "gh:count:";

type Command = (string | number)[];

// HGETALL comes back as [field, value, field, value, …]
function pairs(reply: unknown) {
  const out: Record<string, string> = {};
  if (Array.isArray(reply)) for (let i = 0; i + 1 < reply.length; i += 2) out[reply[i]] = reply[i + 1];
  return out;
}

function upstash(url: string, token: string): Store {
  // /pipeline runs the commands in order; /multi-exec runs them as one transaction.
  async function run(route: "pipeline" | "multi-exec", commands: Command[]) {
    const res = await fetch(`${url}/${route}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(commands),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    const out: unknown = await res.json().catch(() => null);
    if (!res.ok || !Array.isArray(out))
      throw new Error(`Upstash answered ${res.status}: ${(out as { error?: string })?.error ?? "no reply"}`);
    return out.map((r: { result?: unknown; error?: string }) => {
      if (r?.error) throw new Error(`Upstash: ${r.error}`);
      return r?.result ?? null;
    });
  }
  const parse = (json: string, id: string, status: Status): Message[] => {
    try {
      return [{ ...JSON.parse(json), id, status }];
    } catch {
      return [];
    }
  };
  return {
    async add(message) {
      const { status, ...rest } = message;
      await run("multi-exec", [
        ["HSET", MESSAGES, message.id, JSON.stringify(rest)],
        ["HSET", STATUS, message.id, status],
      ]);
    },
    async list() {
      const [all, marks] = await run("pipeline", [["HGETALL", MESSAGES], ["HGETALL", STATUS]]);
      const status = pairs(marks);
      return Object.entries(pairs(all)).flatMap(([id, json]) => parse(json, id, (status[id] as Status) ?? "new"));
    },
    async mark(id, status) {
      const [json] = await run("pipeline", [["HGET", MESSAGES, id]]);
      if (typeof json !== "string") return null;
      await run("pipeline", [["HSET", STATUS, id, status]]);
      return parse(json, id, status)[0] ?? null;
    },
    async remove(id) {
      const [gone] = await run("multi-exec", [
        ["HDEL", MESSAGES, id],
        ["HDEL", STATUS, id],
      ]);
      return gone === 1;
    },
    async count(key, seconds) {
      const [n, ttl] = (await run("pipeline", [["INCR", COUNT + key], ["TTL", COUNT + key]])) as number[];
      // a key INCR just made has no expiry yet
      if (ttl < 0) await run("pipeline", [["EXPIRE", COUNT + key, seconds]]);
      return { n, ttl: ttl < 0 ? seconds : ttl };
    },
    async hold(key, seconds) {
      await run("pipeline", [["EXPIRE", COUNT + key, seconds]]);
    },
    async forget(key) {
      await run("pipeline", [["DEL", COUNT + key]]);
    },
  };
}

/* ---------- Development: a file and memory ---------- */
const FILE = path.join(process.cwd(), ".data", "messages.json");

// On globalThis, so every route and every reload in development shares one queue and one set of counters.
const shared = globalThis as typeof globalThis & {
  ghQueue?: Promise<unknown>;
  ghCounts?: Map<string, { n: number; until: number }>;
};

async function readAll(): Promise<Message[]> {
  try {
    const all: unknown = JSON.parse(await readFile(FILE, "utf8"));
    return Array.isArray(all) ? all : [];
  } catch (error) {
    if ((error as { code?: string }).code === "ENOENT") return [];
    throw error;
  }
}

// One change at a time, so two sends close together can't overwrite each other.
function change<T>(edit: (all: Message[]) => T): Promise<T> {
  const next = (shared.ghQueue ?? Promise.resolve()).then(async () => {
    const all = await readAll();
    const result = edit(all);
    await mkdir(path.dirname(FILE), { recursive: true });
    await writeFile(FILE + ".tmp", JSON.stringify(all, null, 2));
    await rename(FILE + ".tmp", FILE);
    return result;
  });
  shared.ghQueue = next.catch(() => undefined);
  return next;
}

const counts = () => (shared.ghCounts ??= new Map());

const local: Store = {
  add: (message) =>
    change((all) => {
      all.push(message);
    }),
  list: async () => {
    await shared.ghQueue;
    return readAll();
  },
  mark: (id, status) =>
    change((all) => {
      const found = all.find((m) => m.id === id);
      if (found) found.status = status;
      return found ?? null;
    }),
  remove: (id) =>
    change((all) => {
      const at = all.findIndex((m) => m.id === id);
      if (at >= 0) all.splice(at, 1);
      return at >= 0;
    }),
  async count(key, seconds) {
    const now = Date.now();
    let c = counts().get(key);
    if (!c || c.until <= now) counts().set(key, (c = { n: 0, until: now + seconds * 1000 }));
    c.n++;
    return { n: c.n, ttl: Math.ceil((c.until - now) / 1000) };
  },
  async hold(key, seconds) {
    const c = counts().get(key);
    if (c) c.until = Date.now() + seconds * 1000;
  },
  async forget(key) {
    counts().delete(key);
  },
};
