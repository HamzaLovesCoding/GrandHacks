import type { Metadata } from "next";
import "./not-found.css";

export const metadata: Metadata = { title: "Page not found | GrandHacks" };

export default function NotFound() {
  return (
    <main className="lost">
      <p className="lostCode">404</p>
      <h1>This page doesn’t exist.</h1>
      <p>The link may be old, or the address may have a typo.</p>
      <a className="btn" href="/">
        Back to GrandHacks
      </a>
    </main>
  );
}
