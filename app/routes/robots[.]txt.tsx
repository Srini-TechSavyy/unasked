import type { Route } from "./+types/robots[.]txt";
import { getSiteUrl } from "~/lib/auth.server";
import { canonicalUrl } from "~/lib/seo";

export function loader({ request }: Route.LoaderArgs) {
  const siteUrl = getSiteUrl(request);
  const sitemap = canonicalUrl("/sitemap.xml", siteUrl);
  const body = `User-agent: *
Allow: /

Sitemap: ${sitemap}
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
