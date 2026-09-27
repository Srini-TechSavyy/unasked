export const TOPICS = [
  "Life",
  "Philosophy",
  "Technology",
  "AI",
  "Money",
  "Investing",
  "Trading",
  "Travel",
  "Ideas",
] as const;

export type Topic = (typeof TOPICS)[number];

export function isTopic(value: string): value is Topic {
  return (TOPICS as readonly string[]).includes(value);
}
