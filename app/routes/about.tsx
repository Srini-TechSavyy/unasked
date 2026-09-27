import type { Route } from "./+types/about";
import { canonicalUrl, SITE_NAME } from "~/lib/seo";

export function meta() {
  const href = canonicalUrl("/about", "https://unasked.techsavyy.com");
  return [
    { title: `About — ${SITE_NAME}` },
    {
      name: "description",
      content: "About Srini and the Unasked writing project.",
    },
    { tagName: "link", rel: "canonical", href },
  ];
}

export default function About() {
  return (
    <div className="site-shell-narrow pb-16 md:pb-24">
      <header className="pt-10 md:pt-14 border-b border-border pb-8">
        <h1 className="font-display text-4xl md:text-5xl text-ink">About</h1>
      </header>
      <div className="mt-10 space-y-6 text-lg md:text-xl text-ink-muted leading-[1.75] font-serif">
        <p>
          I&apos;m Srini. I write about life, money, technology, travel, and the
          questions we often don&apos;t stop to ask.
        </p>
        <p>
          Some articles start with a question. Others start with something I
          noticed. I write to explore the idea rather than necessarily arrive at
          an answer.
        </p>
      </div>
    </div>
  );
}
