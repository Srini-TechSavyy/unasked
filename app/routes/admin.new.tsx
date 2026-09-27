import { redirect, useActionData } from "react-router";
import type { Route } from "./+types/admin.new";
import { ArticleEditorForm } from "~/components/ArticleEditorForm";
import {
  createArticle,
  parseArticleForm,
  validateArticleInput,
} from "~/lib/articles.server";
import { requireAuthor } from "~/lib/auth.server";
import { SITE_NAME } from "~/lib/seo";

export function meta() {
  return [{ title: `New article — ${SITE_NAME}` }];
}

export async function action({ request }: Route.ActionArgs) {
  await requireAuthor(request);
  const formData = await request.formData();
  const input = parseArticleForm(formData);
  const error = validateArticleInput(input);
  if (error) return { error };

  const article = await createArticle(input);
  return redirect(`/admin/articles/${article.id}/edit`);
}

export async function loader({ request }: Route.LoaderArgs) {
  await requireAuthor(request);
  return null;
}

export default function AdminNew() {
  const actionData = useActionData<typeof action>();
  return <ArticleEditorForm title="New essay" error={actionData?.error} />;
}
