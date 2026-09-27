import { Link, useLocation } from "react-router";

const publicLinks = [
  { to: "/", label: "Home" },
  { to: "/articles", label: "Articles" },
  { to: "/about", label: "About" },
];

export function SiteHeader({ isAuthor }: { isAuthor: boolean }) {
  const location = useLocation();

  return (
    <header className="site-header">
      <div className="site-shell flex items-center justify-between gap-6 py-6 md:py-8">
        <Link to="/" className="brand-link">
          UNASKED
        </Link>
        <nav className="flex flex-wrap items-center justify-end gap-x-6 gap-y-2 text-sm tracking-wide">
          {publicLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`nav-link ${location.pathname === link.to ? "nav-link-active" : ""}`}
            >
              {link.label}
            </Link>
          ))}
          {isAuthor ? (
            <>
              <Link to="/admin/new" className="nav-link">Write</Link>
              <Link to="/admin" className="nav-link">Admin</Link>
            </>
          ) : (
            <Link to="/login" className="nav-link">Login</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
