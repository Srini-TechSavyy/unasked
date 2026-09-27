import type { Route } from "./+types/home";
import { ArticleCard } from "~/components/ArticleCard";
import { getLatestPublished } from "~/lib/articles.server";
import { getSiteUrl } from "~/lib/auth.server";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
  canonicalUrl,
} from "~/lib/seo";

export function meta() {
  const siteUrl = canonicalUrl("/", "https://unasked.techsavyy.com");
  return [
    { title: `${SITE_NAME} — ${SITE_TAGLINE}` },
    { name: "description", content: SITE_DESCRIPTION },
    { property: "og:title", content: SITE_NAME },
    { property: "og:description", content: SITE_DESCRIPTION },
    { property: "og:type", content: "website" },
    { tagName: "link", rel: "canonical", href: siteUrl },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const articles = await getLatestPublished(6);
  return { articles, siteUrl: getSiteUrl(request) };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { articles } = loaderData;

  return (
    <div className="site-shell pb-16 md:pb-24">
      <section className="pt-10 md:pt-16 max-w-3xl">
        <h1 className="font-display text-5xl md:text-7xl tracking-tight text-stone-900">
          UNASKED
        </h1>
        <p className="mt-4 text-xl md:text-2xl text-stone-600 leading-relaxed">
          {SITE_TAGLINE}
        </p>
        <p className="mt-6 text-base md:text-lg text-stone-500 leading-relaxed max-w-2xl">
          {SITE_DESCRIPTION}
        </p>
      </section>

      <section className="mt-16 md:mt-24 max-w-3xl">
        <h2 className="text-sm uppercase tracking-[0.25em] text-stone-500">
          Latest Essays
        </h2>
        <div className="mt-10 flex flex-col gap-12 md:gap-16">
          {articles.length === 0 ? (
            <p className="text-stone-500">New essays are on their way.</p>
          ) : (
            articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
