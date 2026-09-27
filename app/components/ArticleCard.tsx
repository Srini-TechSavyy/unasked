import { Link } from "react-router";
import { CategoryLabel } from "~/components/CategoryLabel";
import { formatPublishedDate } from "~/lib/dates";
import { formatReadingTime } from "~/lib/reading-time";
import type { Article } from "~/lib/types";

export function ArticleCard({
  article,
  variant = "list",
}: {
  article: Article;
  variant?: "list" | "grid";
}) {
  const excerpt = article.excerpt || article.subtitle || "";

  if (variant === "grid") {
    return (
      <article className="group flex flex-col">
        <Link
          to={`/articles/${article.slug}`}
          className="article-card-image aspect-[4/3] block"
        >
          {article.cover_image ? (
            <img src={article.cover_image} alt="" loading="lazy" />
          ) : (
            <div className="flex h-full min-h-[12rem] items-end bg-canvas-muted p-4">
              <span className="font-display text-lg text-ink-muted/60">Unasked</span>
            </div>
          )}
        </Link>
        <div className="mt-5 flex flex-col gap-3 border-t border-border pt-5">
          {article.topic ? <CategoryLabel>{article.topic}</CategoryLabel> : null}
          <h3 className="font-display text-xl md:text-2xl leading-snug text-ink">
            <Link to={`/articles/${article.slug}`} className="article-title-link">
              {article.title}
            </Link>
          </h3>
          {excerpt ? (
            <p className="text-sm md:text-base text-ink-muted leading-relaxed line-clamp-3">
              {excerpt}
            </p>
          ) : null}
          <p className="text-xs text-ink-muted">
            {article.published_at ? (
              <time dateTime={article.published_at}>
                {formatPublishedDate(article.published_at)}
              </time>
            ) : null}
            <span className="mx-2 text-border" aria-hidden>·</span>
            {formatReadingTime(article.content)}
          </p>
        </div>
      </article>
    );
  }

  return (
    <article className="article-card group border-t border-border pt-10 first:border-t-0 first:pt-0">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xs uppercase tracking-[0.18em] text-ink-muted">
        {article.topic ? <span className="text-accent">{article.topic}</span> : null}
        {article.published_at ? (
          <>
            <span className="text-border" aria-hidden>·</span>
            <time dateTime={article.published_at}>
              {formatPublishedDate(article.published_at)}
            </time>
          </>
        ) : null}
        <span className="text-border" aria-hidden>·</span>
        <span>{formatReadingTime(article.content)}</span>
      </div>
      <h3 className="mt-3 font-display text-2xl md:text-3xl leading-tight text-ink">
        <Link to={`/articles/${article.slug}`} className="article-title-link">
          {article.title}
        </Link>
      </h3>
      {excerpt ? (
        <p className="mt-3 text-base md:text-lg text-ink-muted leading-relaxed max-w-2xl">
          {excerpt}
        </p>
      ) : null}
    </article>
  );
}
