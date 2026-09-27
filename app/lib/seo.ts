export const SITE_NAME = "Unasked";
export const SITE_TAGLINE = "Questions worth asking.";
export const SITE_DESCRIPTION =
  "Essays about life, technology, money, travel, and the questions hiding beneath the obvious.";

export function canonicalUrl(path: string, siteUrl: string): string {
  const base = siteUrl.replace(/\/$/, "");
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized === "/" ? "" : normalized}`;
}

export function absoluteImageUrl(
  image: string | null | undefined,
  siteUrl: string,
): string | undefined {
  if (!image) return undefined;
  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }
  return canonicalUrl(image, siteUrl);
}
