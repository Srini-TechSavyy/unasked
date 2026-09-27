export function formatPublishedDate(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso.includes("T") ? iso : `${iso}Z`);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatShortDate(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso.includes("T") ? iso : `${iso}Z`);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
