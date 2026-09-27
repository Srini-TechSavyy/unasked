import { Link } from "react-router";
import { SITE_TAGLINE } from "~/lib/seo";

const footerLinks = [
  { to: "/articles", label: "Articles" },
  { to: "/about", label: "About" },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 md:mt-32 border-t border-border bg-canvas">
      <div className="site-shell py-14 md:py-16 flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <p className="font-display text-xl tracking-[0.12em] text-ink">
            UNASKED<span className="brand-dot">●</span>
          </p>
          <p className="mt-3 text-sm text-ink-muted leading-relaxed">{SITE_TAGLINE}</p>
        </div>

        <div className="flex flex-col gap-6 md:items-end">
          <nav className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
            {footerLinks.map((link) => (
              <Link key={link.to} to={link.to} className="nav-link">
                {link.label}
              </Link>
            ))}
          </nav>
          <p className="text-xs text-ink-muted">© {year} Unasked</p>
        </div>
      </div>
    </footer>
  );
}
