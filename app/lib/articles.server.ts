import { env } from "cloudflare:workers";
import { slugifyTitle } from "~/lib/slug";
import { excerptFromContent } from "~/lib/markdown.server";
import type { Article, ArticleRow, ArticleStatus } from "~/lib/types";
import { mapArticle } from "~/lib/types";

function db() {
  return env.DB;
}

function rowToArticle(row: ArticleRow | null): Article | null {
  return row ? mapArticle(row) : null;
}

export async function getPublishedArticles(topic?: string): Promise<Article[]> {
  const query = topic
    ? `SELECT * FROM articles WHERE status = 'published' AND topic = ? ORDER BY published_at DESC, updated_at DESC`
    : `SELECT * FROM articles WHERE status = 'published' ORDER BY published_at DESC, updated_at DESC`;
  const result = topic
    ? await db().prepare(query).bind(topic).all<ArticleRow>()
    : await db().prepare(query).all<ArticleRow>();
  return (result.results ?? []).map(mapArticle);
}

export async function getLatestPublished(limit: number): Promise<Article[]> {
  const result = await db()
    .prepare(
      `SELECT * FROM articles WHERE status = 'published' ORDER BY published_at DESC, updated_at DESC LIMIT ?`,
    )
    .bind(limit)
    .all<ArticleRow>();
  return (result.results ?? []).map(mapArticle);
}

export async function getPublishedBySlug(slug: string): Promise<Article | null> {
  const row = await db()
    .prepare(`SELECT * FROM articles WHERE slug = ? AND status = 'published'`)
    .bind(slug)
    .first<ArticleRow>();
  return rowToArticle(row);
}

export async function getArticleById(id: number): Promise<Article | null> {
  const row = await db()
    .prepare(`SELECT * FROM articles WHERE id = ?`)
    .bind(id)
    .first<ArticleRow>();
  return rowToArticle(row);
}

export async function getArticleBySlugAnyStatus(
  slug: string,
): Promise<Article | null> {
  const row = await db()
    .prepare(`SELECT * FROM articles WHERE slug = ?`)
    .bind(slug)
    .first<ArticleRow>();
  return rowToArticle(row);
}

export async function getRelatedPublished(
  article: Article,
  limit = 3,
): Promise<Article[]> {
  const result = await db()
    .prepare(
      `SELECT * FROM articles
       WHERE status = 'published' AND id != ?
       AND (topic = ? OR topic IS NULL)
       ORDER BY
         CASE WHEN topic = ? THEN 0 ELSE 1 END,
         published_at DESC
       LIMIT ?`,
    )
    .bind(article.id, article.topic, article.topic, limit)
    .all<ArticleRow>();
  return (result.results ?? []).map(mapArticle);
}

export async function getAdminStats(): Promise<{
  total: number;
  published: number;
  drafts: number;
}> {
  const total = await db()
    .prepare(`SELECT COUNT(*) as count FROM articles`)
    .first<{ count: number }>();
  const published = await db()
    .prepare(`SELECT COUNT(*) as count FROM articles WHERE status = 'published'`)
    .first<{ count: number }>();
  const drafts = await db()
    .prepare(`SELECT COUNT(*) as count FROM articles WHERE status = 'draft'`)
    .first<{ count: number }>();
  return {
    total: total?.count ?? 0,
    published: published?.count ?? 0,
    drafts: drafts?.count ?? 0,
  };
}

export async function listAllArticles(): Promise<Article[]> {
  const result = await db()
    .prepare(`SELECT * FROM articles ORDER BY updated_at DESC`)
    .all<ArticleRow>();
  return (result.results ?? []).map(mapArticle);
}

export async function slugExists(slug: string, excludeId?: number): Promise<boolean> {
  const row = excludeId
    ? await db()
        .prepare(`SELECT id FROM articles WHERE slug = ? AND id != ?`)
        .bind(slug, excludeId)
        .first<{ id: number }>()
    : await db()
        .prepare(`SELECT id FROM articles WHERE slug = ?`)
        .bind(slug)
        .first<{ id: number }>();
  return Boolean(row);
}

export async function ensureUniqueSlug(
  baseSlug: string,
  excludeId?: number,
): Promise<string> {
  let slug = baseSlug || "untitled";
  let suffix = 2;
  while (await slugExists(slug, excludeId)) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
  return slug;
}

export interface ArticleInput {
  title: string;
  slug?: string;
  subtitle?: string;
  excerpt?: string;
  content: string;
  topic?: string;
  tags?: string[];
  cover_image?: string;
  medium_url?: string;
  status: ArticleStatus;
}

export async function createArticle(input: ArticleInput): Promise<Article> {
  const now = new Date().toISOString();
  const baseSlug =
    slugifyTitle(input.slug?.trim() || input.title) || "untitled";
  const slug = await ensureUniqueSlug(baseSlug);
  const excerpt =
    input.excerpt?.trim() || excerptFromContent(input.content, 220);
  const tags = JSON.stringify(input.tags ?? []);
  const published_at = input.status === "published" ? now : null;

  const result = await db()
    .prepare(
      `INSERT INTO articles (
        title, slug, subtitle, excerpt, content, topic, tags,
        cover_image, medium_url, status, published_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING *`,
    )
    .bind(
      input.title.trim(),
      slug,
      input.subtitle?.trim() || null,
      excerpt,
      input.content,
      input.topic?.trim() || null,
      tags,
      input.cover_image?.trim() || null,
      input.medium_url?.trim() || null,
      input.status,
      published_at,
      now,
      now,
    )
    .first<ArticleRow>();

  if (!result) {
    throw new Error("Failed to create article");
  }
  return mapArticle(result);
}

export async function updateArticle(
  id: number,
  input: ArticleInput,
): Promise<Article> {
  const existing = await getArticleById(id);
  if (!existing) {
    throw new Error("Article not found");
  }

  const now = new Date().toISOString();
  const baseSlug =
    slugifyTitle(input.slug?.trim() || input.title) || "untitled";
  const slug = await ensureUniqueSlug(baseSlug, id);
  const excerpt =
    input.excerpt?.trim() || excerptFromContent(input.content, 220);
  const tags = JSON.stringify(input.tags ?? []);

  let published_at = existing.published_at;
  if (input.status === "published" && !published_at) {
    published_at = now;
  }
  if (input.status === "draft") {
    published_at = null;
  }

  await db()
    .prepare(
      `UPDATE articles SET
        title = ?, slug = ?, subtitle = ?, excerpt = ?, content = ?,
        topic = ?, tags = ?, cover_image = ?, medium_url = ?,
        status = ?, published_at = ?, updated_at = ?
      WHERE id = ?`,
    )
    .bind(
      input.title.trim(),
      slug,
      input.subtitle?.trim() || null,
      excerpt,
      input.content,
      input.topic?.trim() || null,
      tags,
      input.cover_image?.trim() || null,
      input.medium_url?.trim() || null,
      input.status,
      published_at,
      now,
      id,
    )
    .run();

  const updated = await getArticleById(id);
  if (!updated) {
    throw new Error("Failed to update article");
  }
  return updated;
}

export async function setArticleStatus(
  id: number,
  status: ArticleStatus,
): Promise<void> {
  const now = new Date().toISOString();
  const published_at = status === "published" ? now : null;
  await db()
    .prepare(
      `UPDATE articles SET status = ?, published_at = ?, updated_at = ? WHERE id = ?`,
    )
    .bind(status, published_at, now, id)
    .run();
}

export async function deleteArticle(id: number): Promise<void> {
  await db().prepare(`DELETE FROM articles WHERE id = ?`).bind(id).run();
}

export function parseTagsInput(raw: string): string[] {
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export function parseArticleForm(formData: FormData): ArticleInput {
  const status = formData.get("status") === "published" ? "published" : "draft";
  const intent = formData.get("intent");
  const resolvedStatus =
    intent === "publish" ? "published" : intent === "draft" ? "draft" : status;

  return {
    title: String(formData.get("title") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    subtitle: String(formData.get("subtitle") ?? ""),
    excerpt: String(formData.get("excerpt") ?? ""),
    content: String(formData.get("content") ?? ""),
    topic: String(formData.get("topic") ?? ""),
    tags: parseTagsInput(String(formData.get("tags") ?? "")),
    cover_image: String(formData.get("cover_image") ?? ""),
    medium_url: String(formData.get("medium_url") ?? ""),
    status: resolvedStatus,
  };
}

export function validateArticleInput(input: ArticleInput): string | null {
  if (!input.title.trim()) return "Title is required.";
  if (!input.content.trim()) return "Content is required.";
  if (input.topic && input.topic.length > 80) return "Topic is too long.";
  if (input.medium_url && !/^https?:\/\//i.test(input.medium_url)) {
    return "Medium URL must start with http:// or https://";
  }
  if (input.cover_image && !/^https?:\/\//i.test(input.cover_image)) {
    return "Cover image must be a valid URL.";
  }
  return null;
}
