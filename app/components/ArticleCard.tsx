import { Link } from "react-router";
import { formatPublishedDate } from "~/lib/dates";
import { formatReadingTime } from "~/lib/reading-time";
import type { Article } from "~/lib/types";

export function ArticleCard({ article }: { article: Article }) {
  const excerpt = article.excerpt || article.subtitle || "";

  return (
    <article className="article-card group">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xs uppercase tracking-wider text-stone-500">
        {article.topic ? <span>{article.topic}</span> : null}
        {article.published_at ? (
          <>
            <span className="text-stone-300" aria-hidden>·</span>
            <time dateTime={article.published_at}>
              {formatPublishedDate(article.published_at)}
            </time>
          </>
        ) : null}
        <span className="text-stone-300" aria-hidden>·</span>
        <span>{formatReadingTime(article.content)}</span>
      </div>
      <h3 className="mt-3 font-display text-2xl md:text-3xl leading-tight text-stone-900">
        <Link to={`/articles/${article.slug}`} className="article-title-link">
          {article.title}
        </Link>
      </h3>
      {excerpt ? (
        <p className="mt-3 text-base md:text-lg text-stone-600 leading-relaxed max-w-2xl">
          {excerpt}
        </p>
      ) : null}
    </article>
  );
}
