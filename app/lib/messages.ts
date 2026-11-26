// What the Contact and Sponsor forms send, and the one check that both the form and the server run on it.
import { forms, sponsors } from "../content";

export type Kind = "contact" | "sponsor";
export type Method = "email" | "phone" | "other";
export type Status = "new" | "replied" | "archived";
export const methods: Method[] = ["email", "phone", "other"];
export const statuses: Status[] = ["new", "replied", "archived"];

// The most each answer can hold, in characters, and the least a contact message needs.
export const limits = { name: 100, organization: 120, email: 254, phone: 30, other: 120, message: 2000 };
export const shortest = 10;

export type Reach = { method: Method; value: string };
export type ContactFields = { kind: "contact"; name: string; role: string; reach: Reach; message: string };
export type SponsorFields = {
  kind: "sponsor";
  name: string;
  organization: string;
  reach: Reach;
  supports: string[];
  message: string;
};
export type Fields = ContactFields | SponsorFields;
export type Message = Fields & { id: string; createdAt: string; status: Status };
export type Problems = Partial<Record<"kind" | "name" | "organization" | "role" | "reach" | "supports" | "message", string>>;

// Plain text only: control characters and the marks that reorder text on screen come out.
const unseen = /[\p{Cc}\p{Bidi_Control}]/gu;
// one line, with runs of spaces squeezed to one
const line = (v: unknown) => (typeof v === "string" ? v.replace(unseen, " ").replace(/\s+/g, " ").trim() : "");
// a message keeps its line breaks (Windows ones and Unicode line and paragraph separators become \n) and tabs
const lines = (v: unknown) =>
  typeof v === "string"
    ? v
        .replace(/\r\n?|[\p{Zl}\p{Zp}]/gu, "\n")
        .replace(/[^\P{Cc}\n\t]|\p{Bidi_Control}/gu, "")
        .trim()
    : "";

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
// Loose on purpose: 7 to 15 digits, the usual + ( ) - . and spaces, and an optional extension.
function phoneOk(v: string) {
  const main = v.replace(/\s*(?:ext\.?|x)\s*\d{1,6}$/i, "");
  const digits = main.replace(/\D/g, "").length;
  return /^\+?[\d\s().-]+$/.test(main) && digits >= 7 && digits <= 15;
}

function reachOf(input: unknown, problems: Problems): Reach {
  const r = (input && typeof input === "object" ? input : {}) as { method?: unknown; value?: unknown };
  const method = methods.find((m) => m === r.method);
  const value = line(r.value);
  if (!method) problems.reach = forms.problems.method;
  else if (value.length > limits[method]) problems.reach = forms.problems.long(limits[method]);
  else if (method === "email" && !emailOk(value)) problems.reach = forms.problems.email;
  else if (method === "phone" && !phoneOk(value)) problems.reach = forms.problems.phone;
  else if (method === "other" && value.length < 2) problems.reach = forms.problems.other;
  return { method: method ?? "email", value };
}

// Takes anything (the form's own answers, or a request body nobody vouches for) and gives back the
// trimmed fields and nothing else, or, when something needs fixing, null and the problems by field.
export function check(input: unknown): { value: Fields | null; problems: Problems } {
  const o = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const problems: Problems = {};
  const name = line(o.name),
    reach = reachOf(o.reach, problems),
    message = lines(o.message);
  if (name.length > limits.name) problems.name = forms.problems.long(limits.name);
  if (message.length > limits.message) problems.message = forms.problems.long(limits.message);
  const done = (value: Fields) => ({ value: Object.keys(problems).length ? null : value, problems });

  if (o.kind === "contact") {
    const role = forms.roles.find((r) => r === o.role);
    if (!role) problems.role = forms.problems.role;
    if (message.length < shortest) problems.message = forms.problems.short(shortest);
    return done({ kind: "contact", name, role, reach, message });
  }
  if (o.kind === "sponsor") {
    const organization = line(o.organization);
    if (!name) problems.name = forms.problems.name;
    if (!organization) problems.organization = forms.problems.organization;
    else if (organization.length > limits.organization) problems.organization = forms.problems.long(limits.organization);
    // the chips, in the order they're shown
    const picked = o.supports === undefined ? [] : o.supports;
    if (!Array.isArray(picked) || picked.some((p) => !sponsors.chips.includes(p as string)))
      problems.supports = forms.problems.supports;
    const supports = sponsors.chips.filter((c) => Array.isArray(picked) && picked.includes(c));
    return done({ kind: "sponsor", name, organization, reach, supports, message });
  }
  return { value: null, problems: { kind: forms.problems.kind } };
}
