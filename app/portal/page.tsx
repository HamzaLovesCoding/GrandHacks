import type { Metadata } from "next";
import { portal } from "../content";
import { Portal } from "./portal";

// Not linked from the site and kept out of search results. The page itself holds no messages: they
// come from /api/portal/messages/, which answers only with a signed-in cookie.
export const metadata: Metadata = {
  title: portal.title,
  robots: { index: false, follow: false },
};
// Rendered on each request, so the page is sent with no-store like the portal's API.
export const dynamic = "force-dynamic";

export default function PortalPage() {
  return <Portal />;
}
