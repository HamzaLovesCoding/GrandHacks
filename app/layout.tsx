import type { Metadata } from "next";
import "./globals.css";
import { siteUrl } from "./lib/site";
export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: "GrandHacks Overnight | Think Grand. Build Bold.",
  description:
    "A free overnight hackathon for middle and high school students in San Francisco, June 19–20, 2027. 200+ hackers, teams of 1–5, six awards.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
