import { Link } from "react-router";
import type { Route } from "./+types/articles.$slug";
import { ArticleCard } from "~/components/ArticleCard";
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
  return { article, related, siteUrl, html };
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
  const { article, related, siteUrl, html } = loaderData;

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
    <article className="site-shell pb-16 md:pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="max-w-2xl mx-auto pt-10 md:pt-14 text-center">
        {article.topic ? (
          <p className="text-xs uppercase tracking-[0.25em] text-stone-500">
            {article.topic}
          </p>
        ) : null}
        <h1 className="mt-4 font-display text-4xl md:text-5xl leading-tight text-stone-900">
          {article.title}
        </h1>
        {article.subtitle ? (
          <p className="mt-4 text-lg md:text-xl text-stone-600 leading-relaxed">
            {article.subtitle}
          </p>
        ) : null}
        <p className="mt-6 text-sm text-stone-500">
          {article.published_at ? (
            <time dateTime={article.published_at}>
              {formatPublishedDate(article.published_at)}
            </time>
          ) : null}
          <span className="mx-2 text-stone-300" aria-hidden>·</span>
          {formatReadingTime(article.content)}
        </p>
      </header>

      {article.cover_image ? (
        <figure className="max-w-3xl mx-auto mt-10 md:mt-12">
          <img
            src={article.cover_image}
            alt=""
            className="w-full max-h-[28rem] object-cover"
            loading="lazy"
          />
        </figure>
      ) : null}

      <div className="max-w-2xl mx-auto mt-10 md:mt-14">
        <MarkdownContent html={html} />
      </div>

      {article.medium_url ? (
        <p className="max-w-2xl mx-auto mt-12 text-sm text-stone-500">
          <a
            href={article.medium_url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline-offset-4 hover:underline"
          >
            Originally published on Medium →
          </a>
        </p>
      ) : null}

      {related.length > 0 ? (
        <section className="max-w-3xl mx-auto mt-20 md:mt-28 border-t border-stone-200/80 pt-12">
          <h2 className="text-sm uppercase tracking-[0.25em] text-stone-500">
            More from Unasked
          </h2>
          <div className="mt-10 flex flex-col gap-12">
            {related.map((item) => (
              <ArticleCard key={item.id} article={item} />
            ))}
          </div>
        </section>
      ) : null}

      <p className="max-w-2xl mx-auto mt-16 text-sm text-stone-500">
        <Link to="/articles" className="underline-offset-4 hover:underline">
          ← All articles
        </Link>
      </p>
    </article>
  );
}
