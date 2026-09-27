import { Link } from "react-router";
import type { Route } from "./+types/admin.articles.$id.preview";
import { MarkdownContent } from "~/components/MarkdownContent";
import { getArticleById } from "~/lib/articles.server";
import { requireAuthor } from "~/lib/auth.server";
import { formatPublishedDate } from "~/lib/dates";
import { renderMarkdown } from "~/lib/markdown.server";
import { formatReadingTime } from "~/lib/reading-time";
import { SITE_NAME } from "~/lib/seo";

export function meta({ loaderData }: Route.MetaArgs) {
  const title = loaderData?.article?.title ?? "Preview";
  return [{ title: `Preview: ${title} — ${SITE_NAME}` }];
}

export async function loader({ request, params }: Route.LoaderArgs) {
  await requireAuthor(request);
  const id = Number(params.id);
  const article = await getArticleById(id);
  if (!article) throw new Response("Not Found", { status: 404 });
  const html = renderMarkdown(article.content);
  return { article, html };
}

export default function AdminPreview({ loaderData }: Route.ComponentProps) {
  const { article, html } = loaderData;

  return (
    <div className="max-w-2xl mx-auto">
      <p className="text-xs uppercase tracking-[0.2em] text-amber-900/80 bg-amber-50 border border-amber-100 px-3 py-2 inline-block">
        Draft preview — {article.status}
      </p>
      <header className="mt-8 text-center">
        {article.topic ? (
          <p className="text-xs uppercase tracking-[0.25em] text-stone-500">
            {article.topic}
          </p>
        ) : null}
        <h1 className="mt-4 font-display text-4xl leading-tight">{article.title}</h1>
        {article.subtitle ? (
          <p className="mt-4 text-lg text-stone-600">{article.subtitle}</p>
        ) : null}
        <p className="mt-6 text-sm text-stone-500">
          {article.published_at ? formatPublishedDate(article.published_at) : "Unpublished"}
          <span className="mx-2">·</span>
          {formatReadingTime(article.content)}
        </p>
      </header>
      {article.cover_image ? (
        <img
          src={article.cover_image}
          alt=""
          className="mt-10 w-full max-h-96 object-cover"
        />
      ) : null}
      <div className="mt-10">
        <MarkdownContent html={html} />
      </div>
      <p className="mt-12 text-sm">
        <Link
          to={`/admin/articles/${article.id}/edit`}
          className="underline-offset-4 hover:underline"
        >
          ← Back to editor
        </Link>
      </p>
    </div>
  );
}
