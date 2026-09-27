import { useState } from "react";
import { Link, useLocation } from "react-router";

const publicLinks = [
  { to: "/articles", label: "Articles" },
  { to: "/about", label: "About" },
];

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  );
}

export function SiteHeader({ isAuthor }: { isAuthor: boolean }) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/articles") {
      return location.pathname === "/articles" || location.pathname.startsWith("/articles/");
    }
    return location.pathname === path;
  };

  return (
    <header className="border-b border-border bg-canvas">
      <div className="site-shell flex items-center justify-between gap-6 py-5 md:py-6">
        <Link to="/" className="brand-link shrink-0">
          UNASKED<span className="brand-dot">●</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm">
          {publicLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`nav-link ${isActive(link.to) ? "nav-link-active" : ""}`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/articles"
            className="nav-link text-ink-muted hover:text-ink"
            aria-label="Browse articles"
          >
            <SearchIcon />
          </Link>
          {isAuthor ? (
            <>
              <Link to="/admin/new" className="nav-link">Write</Link>
              <Link to="/admin" className="nav-link">Admin</Link>
            </>
          ) : (
            <Link to="/login" className="btn-outline px-4 py-1.5">
              Login
            </Link>
          )}
        </nav>

        <button
          type="button"
          className="md:hidden flex h-10 w-10 items-center justify-center text-ink"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
            {menuOpen ? (
              <path d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>

      {menuOpen ? (
        <nav className="md:hidden border-t border-border bg-canvas px-5 pb-6 pt-4 flex flex-col gap-4 text-sm">
          {publicLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`nav-link ${isActive(link.to) ? "nav-link-active" : ""}`}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/articles"
            className="nav-link inline-flex items-center gap-2"
            onClick={() => setMenuOpen(false)}
          >
            <SearchIcon />
            Browse articles
          </Link>
          {isAuthor ? (
            <>
              <Link to="/admin/new" className="nav-link" onClick={() => setMenuOpen(false)}>
                Write
              </Link>
              <Link to="/admin" className="nav-link" onClick={() => setMenuOpen(false)}>
                Admin
              </Link>
            </>
          ) : (
            <Link to="/login" className="btn-outline w-fit" onClick={() => setMenuOpen(false)}>
              Login
            </Link>
          )}
        </nav>
      ) : null}
    </header>
  );
}
