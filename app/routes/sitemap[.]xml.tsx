import type { Route } from "./+types/sitemap[.]xml";
import { getPublishedArticles } from "~/lib/articles.server";
import { getSiteUrl } from "~/lib/auth.server";
import { canonicalUrl } from "~/lib/seo";

export async function loader({ request }: Route.LoaderArgs) {
  const siteUrl = getSiteUrl(request);
  const articles = await getPublishedArticles();

  const urls = [
    canonicalUrl("/", siteUrl),
    canonicalUrl("/articles", siteUrl),
    canonicalUrl("/about", siteUrl),
    ...articles.map((a) => canonicalUrl(`/articles/${a.slug}`, siteUrl)),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (loc) => `  <url>
    <loc>${loc}</loc>
  </url>`,
  )
  .join("\n")}
</urlset>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
