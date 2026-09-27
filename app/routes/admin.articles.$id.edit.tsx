import { redirect, useActionData, useLoaderData } from "react-router";
import type { Route } from "./+types/admin.articles.$id.edit";
import { ArticleEditorForm } from "~/components/ArticleEditorForm";
import {
  getArticleById,
  parseArticleForm,
  updateArticle,
  validateArticleInput,
} from "~/lib/articles.server";
import { requireAuthor } from "~/lib/auth.server";
import { SITE_NAME } from "~/lib/seo";

export function meta({ loaderData }: Route.MetaArgs) {
  const title = loaderData?.article?.title ?? "Edit";
  return [{ title: `${title} — ${SITE_NAME}` }];
}

export async function loader({ request, params }: Route.LoaderArgs) {
  await requireAuthor(request);
  const id = Number(params.id);
  const article = await getArticleById(id);
  if (!article) throw new Response("Not Found", { status: 404 });
  return { article };
}

export async function action({ request, params }: Route.ActionArgs) {
  await requireAuthor(request);
  const id = Number(params.id);
  const formData = await request.formData();
  const input = parseArticleForm(formData);
  const error = validateArticleInput(input);
  if (error) return { error };

  await updateArticle(id, input);
  return redirect(`/admin/articles/${id}/edit`);
}

export default function AdminEdit() {
  const { article } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <ArticleEditorForm
      title="Edit essay"
      error={actionData?.error}
      defaultValues={{
        title: article.title,
        slug: article.slug,
        subtitle: article.subtitle ?? "",
        excerpt: article.excerpt ?? "",
        content: article.content,
        topic: article.topic ?? "",
        tags: article.tags.join(", "),
        cover_image: article.cover_image ?? "",
        medium_url: article.medium_url ?? "",
        status: article.status,
      }}
    />
  );
}
