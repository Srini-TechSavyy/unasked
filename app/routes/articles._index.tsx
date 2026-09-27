import { Link } from "react-router";
import type { Route } from "./+types/articles._index";
import { ArticleCard } from "~/components/ArticleCard";
import { getPublishedArticles } from "~/lib/articles.server";
import { getSiteUrl } from "~/lib/auth.server";
import { canonicalUrl, SITE_NAME } from "~/lib/seo";
import { TOPICS } from "~/lib/topics";

export function meta() {
  const href = canonicalUrl("/articles", "https://unasked.techsavyy.com");
  return [
    { title: `Articles — ${SITE_NAME}` },
    {
      name: "description",
      content: "Essays and notes from Unasked, browsable by topic.",
    },
    { tagName: "link", rel: "canonical", href },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const topic = url.searchParams.get("topic") ?? undefined;
  const articles = await getPublishedArticles(topic || undefined);
  return {
    articles,
    topic: topic ?? null,
    siteUrl: getSiteUrl(request),
  };
}

export default function ArticlesIndex({ loaderData }: Route.ComponentProps) {
  const { articles, topic } = loaderData;

  return (
    <div className="site-shell pb-16 md:pb-24 max-w-3xl">
      <header className="pt-10 md:pt-14">
        <h1 className="font-display text-4xl md:text-5xl text-stone-900">Articles</h1>
        <p className="mt-4 text-stone-600 text-lg">
          Published essays, filtered by what you want to explore.
        </p>
      </header>

      <div className="mt-10 flex flex-wrap gap-2">
        <Link
          to="/articles"
          className={`topic-pill ${!topic ? "topic-pill-active" : ""}`}
        >
          All
        </Link>
        {TOPICS.map((t) => (
          <Link
            key={t}
            to={`/articles?topic=${encodeURIComponent(t)}`}
            className={`topic-pill ${topic === t ? "topic-pill-active" : ""}`}
          >
            {t}
          </Link>
        ))}
      </div>

      <div className="mt-12 flex flex-col gap-12 md:gap-16">
        {articles.length === 0 ? (
          <p className="text-stone-500">
            No published articles{topic ? ` in ${topic}` : ""} yet.
          </p>
        ) : (
          articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))
        )}
      </div>

      <p className="mt-16 text-sm text-stone-500">
        <Link to="/" className="underline-offset-4 hover:underline">
          ← Back home
        </Link>
      </p>
    </div>
  );
}
