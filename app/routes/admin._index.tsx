import { Form, Link } from "react-router";
import type { Route } from "./+types/admin._index";
import {
  deleteArticle,
  getAdminStats,
  listAllArticles,
  setArticleStatus,
} from "~/lib/articles.server";
import { requireAuthor } from "~/lib/auth.server";
import { formatShortDate } from "~/lib/dates";
import { SITE_NAME } from "~/lib/seo";

export function meta() {
  return [{ title: `Admin — ${SITE_NAME}` }];
}

export async function loader({ request }: Route.LoaderArgs) {
  await requireAuthor(request);
  const [stats, articles] = await Promise.all([
    getAdminStats(),
    listAllArticles(),
  ]);
  return { stats, articles };
}

export async function action({ request }: Route.ActionArgs) {
  await requireAuthor(request);
  const formData = await request.formData();
  const intent = formData.get("intent");
  const id = Number(formData.get("id"));
  if (!id) return { error: "Invalid article" };

  if (intent === "publish") {
    await setArticleStatus(id, "published");
  } else if (intent === "unpublish") {
    await setArticleStatus(id, "draft");
  } else if (intent === "delete") {
    await deleteArticle(id);
  }

  return null;
}

export default function AdminDashboard({ loaderData }: Route.ComponentProps) {
  const { stats, articles } = loaderData;

  return (
    <div>
      <h1 className="font-display text-3xl md:text-4xl">Dashboard</h1>
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl">
        <Stat label="Total" value={stats.total} />
        <Stat label="Published" value={stats.published} />
        <Stat label="Drafts" value={stats.drafts} />
      </div>

      <div className="mt-12 overflow-x-auto">
        <table className="admin-table w-full min-w-[640px] text-sm">
          <thead>
            <tr>
              <th className="text-left">Title</th>
              <th className="text-left">Topic</th>
              <th className="text-left">Status</th>
              <th className="text-left">Updated</th>
              <th className="text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => (
              <tr key={article.id}>
                <td className="font-medium text-stone-900">{article.title}</td>
                <td>{article.topic ?? "—"}</td>
                <td>
                  <span
                    className={
                      article.status === "published"
                        ? "status-pill status-published"
                        : "status-pill status-draft"
                    }
                  >
                    {article.status}
                  </span>
                </td>
                <td>{formatShortDate(article.updated_at)}</td>
                <td>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      to={`/admin/articles/${article.id}/edit`}
                      className="admin-action"
                    >
                      Edit
                    </Link>
                    <Link
                      to={`/admin/articles/${article.id}/preview`}
                      className="admin-action"
                    >
                      Preview
                    </Link>
                    {article.status === "draft" ? (
                      <Form method="post" className="inline">
                        <input type="hidden" name="id" value={article.id} />
                        <button
                          type="submit"
                          name="intent"
                          value="publish"
                          className="admin-action"
                        >
                          Publish
                        </button>
                      </Form>
                    ) : (
                      <Form method="post" className="inline">
                        <input type="hidden" name="id" value={article.id} />
                        <button
                          type="submit"
                          name="intent"
                          value="unpublish"
                          className="admin-action"
                        >
                          Unpublish
                        </button>
                      </Form>
                    )}
                    <Form method="post" className="inline">
                      <input type="hidden" name="id" value={article.id} />
                      <button
                        type="submit"
                        name="intent"
                        value="delete"
                        className="admin-action text-red-800"
                        onClick={(e) => {
                          if (!confirm("Delete this article permanently?")) {
                            e.preventDefault();
                          }
                        }}
                      >
                        Delete
                      </button>
                    </Form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {articles.length === 0 ? (
          <p className="mt-6 text-stone-500">
            No articles yet.{" "}
            <Link to="/admin/new" className="underline-offset-4 hover:underline">
              Write your first essay
            </Link>
            .
          </p>
        ) : null}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-sm border border-stone-200/80 bg-[#faf9f7] px-4 py-5">
      <p className="text-xs uppercase tracking-wider text-stone-500">{label}</p>
      <p className="mt-2 text-3xl font-display text-stone-900">{value}</p>
    </div>
  );
}
