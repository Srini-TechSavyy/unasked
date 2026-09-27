export type ArticleStatus = "draft" | "published";

export interface ArticleRow {
  id: number;
  title: string;
  slug: string;
  subtitle: string | null;
  excerpt: string | null;
  content: string;
  topic: string | null;
  tags: string;
  cover_image: string | null;
  medium_url: string | null;
  status: ArticleStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Article {
  id: number;
  title: string;
  slug: string;
  subtitle: string | null;
  excerpt: string | null;
  content: string;
  topic: string | null;
  tags: string[];
  cover_image: string | null;
  medium_url: string | null;
  status: ArticleStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export function mapArticle(row: ArticleRow): Article {
  let tags: string[] = [];
  try {
    const parsed = JSON.parse(row.tags) as unknown;
    if (Array.isArray(parsed)) {
      tags = parsed.filter((t): t is string => typeof t === "string");
    }
  } catch {
    tags = [];
  }
  return { ...row, tags };
}
