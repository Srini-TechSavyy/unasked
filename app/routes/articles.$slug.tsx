import { Link } from "react-router";
import type { Route } from "./+types/articles.$slug";
import { ArticleCard } from "~/components/ArticleCard";
import { ArticleShare } from "~/components/ArticleShare";
import { CategoryLabel } from "~/components/CategoryLabel";
import { MarkdownContent } from "~/components/MarkdownContent";
import {
  getPublishedBySlug,
  getRelatedPublished,
} from "~/lib/articles.server";
import { getSiteUrl } from "~/lib/auth.server";
import { formatPublishedDate } from "~/lib/dates";
import { renderMarkdown } from "~/lib/markdown.server";
import { formatReadingTime } from "~/lib/reading-time";
import {
  absoluteImageUrl,
  canonicalUrl,
  SITE_NAME,
} from "~/lib/seo";

export async function loader({ params, request }: Route.LoaderArgs) {
  const article = await getPublishedBySlug(params.slug!);
  if (!article) {
    throw new Response("Not Found", { status: 404 });
  }
  const related = await getRelatedPublished(article, 3);
  const siteUrl = getSiteUrl(request);
  const html = renderMarkdown(article.content);
  const shareUrl = canonicalUrl(`/articles/${article.slug}`, siteUrl);
  return { article, related, siteUrl, html, shareUrl };
}

export function meta({ loaderData }: Route.MetaArgs) {
  if (!loaderData) return [{ title: "Not Found" }];
  const { article, siteUrl } = loaderData;
  const url = canonicalUrl(`/articles/${article.slug}`, siteUrl);
  const description = article.excerpt || article.subtitle || "";
  const image = absoluteImageUrl(article.cover_image, siteUrl);
  return [
    { title: `${article.title} — ${SITE_NAME}` },
    { name: "description", content: description },
    { property: "og:title", content: article.title },
    { property: "og:description", content: description },
    { property: "og:type", content: "article" },
    { property: "og:url", content: url },
    ...(image ? [{ property: "og:image", content: image }] : []),
    { tagName: "link", rel: "canonical", href: url },
  ];
}

export default function ArticlePage({ loaderData }: Route.ComponentProps) {
  const { article, related, siteUrl, html, shareUrl } = loaderData;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt || article.subtitle,
    datePublished: article.published_at,
    dateModified: article.updated_at,
    author: { "@type": "Person", name: "Srini" },
    publisher: { "@type": "Organization", name: SITE_NAME },
    mainEntityOfPage: canonicalUrl(`/articles/${article.slug}`, siteUrl),
    ...(article.cover_image
      ? { image: absoluteImageUrl(article.cover_image, siteUrl) }
      : {}),
  };

  return (
    <article className="pb-16 md:pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="site-shell-narrow pt-10 md:pt-14 text-left md:text-center">
        {article.topic ? (
          <div className="md:flex md:justify-center">
            <CategoryLabel>{article.topic}</CategoryLabel>
          </div>
        ) : null}
        <h1 className="mt-5 font-display text-4xl md:text-5xl lg:text-[3.25rem] leading-[1.12] text-ink tracking-tight">
          {article.title}
        </h1>
        {article.subtitle ? (
          <p className="mt-5 text-lg md:text-xl text-ink-muted leading-relaxed">
            {article.subtitle}
          </p>
        ) : null}
        <p className="mt-6 text-sm text-ink-muted">
          {article.published_at ? (
            <time dateTime={article.published_at}>
              {formatPublishedDate(article.published_at)}
            </time>
          ) : null}
          <span className="mx-2 text-border" aria-hidden>·</span>
          {formatReadingTime(article.content)}
        </p>
        <div className="mt-6 md:hidden flex justify-start">
          <ArticleShare url={shareUrl} title={article.title} layout="inline" />
        </div>
      </header>

      {article.cover_image ? (
        <figure className="site-shell mt-10 md:mt-12 max-w-5xl">
          <div className="article-card-image">
            <img
              src={article.cover_image}
              alt=""
              className="w-full max-h-[32rem] object-cover"
              loading="eager"
            />
          </div>
        </figure>
      ) : null}

      <div className="site-shell-narrow mt-12 md:mt-14 relative">
        <aside
          className="hidden lg:block absolute -left-[4.5rem] top-2"
          aria-label="Share"
        >
          <ArticleShare url={shareUrl} title={article.title} layout="rail" />
        </aside>
        <MarkdownContent html={html} />
      </div>

      {article.medium_url ? (
        <p className="site-shell-narrow mt-12 text-sm text-ink-muted">
          <a
            href={article.medium_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline-offset-4 hover:underline"
          >
            Originally published on Medium →
          </a>
        </p>
      ) : null}

      {related.length > 0 ? (
        <section className="site-shell max-w-3xl mt-20 md:mt-28 editorial-rule pt-12">
          <h2 className="editorial-label">More from Unasked</h2>
          <div className="mt-10 flex flex-col">
            {related.map((item) => (
              <ArticleCard key={item.id} article={item} />
            ))}
          </div>
        </section>
      ) : null}

      <p className="site-shell-narrow mt-16 text-sm text-ink-muted">
        <Link to="/articles" className="text-accent underline-offset-4 hover:underline">
          ← All articles
        </Link>
      </p>
    </article>
  );
}
