import { SITE_TAGLINE } from "~/lib/seo";

export function SiteFooter() {
  return (
    <footer className="site-footer border-t border-stone-200/80 mt-20 md:mt-28">
      <div className="site-shell py-10 md:py-12 text-sm text-stone-500 flex flex-col gap-2">
        <p className="font-display tracking-[0.2em] text-stone-800">UNASKED</p>
        <p>{SITE_TAGLINE}</p>
      </div>
    </footer>
  );
}
