// The site's own address, for link previews and the sitemap. Set NEXT_PUBLIC_SITE_URL once there's a
// domain; until then Vercel's own address is used, and on this computer, localhost.
export const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ||
    (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ||
    "http://localhost:3000",
);
