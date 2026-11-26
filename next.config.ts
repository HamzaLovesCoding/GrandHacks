import type { NextConfig } from "next";
const config: NextConfig = {
  devIndicators: false,
  // Next only trusts "localhost" in development. Opened at 127.0.0.1 instead, the page would show but
  // none of its scripts would start, so no button would work.
  allowedDevOrigins: ["127.0.0.1"],
  trailingSlash: true,
  // The organizers' portal can't be shown inside another site's frame, so its buttons can't be
  // clicked through a disguise, and it asks search engines to leave it out.
  async headers() {
    return [
      {
        source: "/portal/:path*",
        headers: [
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },
};
export default config;
