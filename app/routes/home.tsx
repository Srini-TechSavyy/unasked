import { Link } from "react-router";
import type { Route } from "./+types/home";
import { ArticleCard } from "~/components/ArticleCard";
import { CategoryLabel } from "~/components/CategoryLabel";
import { getLatestPublished } from "~/lib/articles.server";
import { getSiteUrl } from "~/lib/auth.server";
import { formatPublishedDate } from "~/lib/dates";
import { formatReadingTime } from "~/lib/reading-time";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
  canonicalUrl,
} from "~/lib/seo";

const DEFAULT_HERO_IMAGE =
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1400&q=80";

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
  const featured = articles[0] ?? null;
  const latest = articles.slice(1, 5);
  const heroImage = featured?.cover_image ?? DEFAULT_HERO_IMAGE;
  const latestHref = featured
    ? `/articles/${featured.slug}`
    : articles.length > 0
      ? `/articles/${articles[0].slug}`
      : "/articles";

  return (
    <div className="pb-20 md:pb-28">
      <section className="site-shell pt-12 md:pt-16 pb-16 md:pb-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          <div className="max-w-xl">
            <CategoryLabel>Questions worth asking</CategoryLabel>
            <h1 className="mt-5 font-display text-4xl md:text-5xl lg:text-[3.25rem] leading-[1.1] text-ink tracking-tight">
              Ideas for a more curious life.
            </h1>
            <p className="mt-6 text-base md:text-lg text-ink-muted leading-relaxed">
              Thoughts about technology, life, money, happiness, and the things we
              rarely question.
            </p>
            <Link to={latestHref} className="editorial-link mt-8">
              Read the latest →
            </Link>
          </div>
          <div className="article-card-image aspect-[4/3] lg:aspect-[5/4]">
            <img
              src={heroImage}
              alt=""
              className="h-full w-full object-cover"
              loading="eager"
            />
          </div>
        </div>
      </section>

      {featured ? (
        <section className="bg-canvas-muted border-y border-border">
          <div className="site-shell py-16 md:py-20">
            <CategoryLabel>Featured article</CategoryLabel>
            <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:gap-14 items-start">
              <Link
                to={`/articles/${featured.slug}`}
                className="article-card-image group block aspect-[4/3]"
              >
                {featured.cover_image ? (
                  <img src={featured.cover_image} alt="" loading="lazy" />
                ) : (
                  <div className="flex h-full min-h-[16rem] items-center justify-center bg-canvas p-8">
                    <span className="font-display text-2xl text-ink-muted">Unasked</span>
                  </div>
                )}
              </Link>
              <div className="flex flex-col justify-center">
                {featured.topic ? <CategoryLabel>{featured.topic}</CategoryLabel> : null}
                <h2 className="mt-4 font-display text-3xl md:text-4xl leading-tight text-ink">
                  <Link to={`/articles/${featured.slug}`} className="article-title-link">
                    {featured.title}
                  </Link>
                </h2>
                {featured.subtitle || featured.excerpt ? (
                  <p className="mt-5 text-base md:text-lg text-ink-muted leading-relaxed">
                    {featured.subtitle || featured.excerpt}
                  </p>
                ) : null}
                <p className="mt-6 text-sm text-ink-muted">
                  {featured.published_at ? (
                    <time dateTime={featured.published_at}>
                      {formatPublishedDate(featured.published_at)}
                    </time>
                  ) : null}
                  <span className="mx-2 text-border" aria-hidden>·</span>
                  {formatReadingTime(featured.content)}
                </p>
                <Link
                  to={`/articles/${featured.slug}`}
                  className="editorial-link mt-8"
                >
                  Read article →
                </Link>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="site-shell pt-16 md:pt-20">
        <div className="flex items-baseline justify-between gap-4 border-b border-border pb-4">
          <h2 className="editorial-label">Latest articles</h2>
          <Link to="/articles" className="editorial-link text-xs tracking-[0.18em] uppercase">
            View all →
          </Link>
        </div>

        {latest.length === 0 && !featured ? (
          <p className="mt-12 text-ink-muted">New essays are on their way.</p>
        ) : (
          <div className="mt-12 grid gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {(latest.length > 0 ? latest : featured ? [featured] : []).map((article) => (
              <ArticleCard key={article.id} article={article} variant="grid" />
            ))}
          </div>
        )}
      </section>

      <section className="site-shell mt-24 md:mt-32 max-w-3xl mx-auto text-center px-5">
        <blockquote className="font-display text-2xl md:text-3xl leading-snug text-ink">
          “Some of the most important questions in life go unasked.”
        </blockquote>
        <div className="mx-auto mt-8 h-px w-12 bg-accent" aria-hidden />
      </section>
    </div>
  );
}
