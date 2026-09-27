import { Form, Link, Outlet, useLoaderData } from "react-router";
import type { Route } from "./+types/admin.layout";
import { requireAuthor } from "~/lib/auth.server";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await requireAuthor(request);
  return { email: session.email };
}

export default function AdminLayout() {
  const { email } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-[#f6f4f1] text-stone-900">
      <header className="border-b border-stone-200/80 bg-[#faf9f7]">
        <div className="site-shell flex flex-wrap items-center justify-between gap-4 py-5">
          <div>
            <Link to="/" className="brand-link text-sm">UNASKED</Link>
            <p className="text-xs text-stone-500 mt-1">Signed in as {email}</p>
          </div>
          <nav className="flex flex-wrap items-center gap-4 text-sm">
            <Link to="/admin" className="nav-link">Dashboard</Link>
            <Link to="/admin/new" className="nav-link">Write</Link>
            <Link to="/" className="nav-link">View site</Link>
            <Form method="post" action="/logout">
              <button type="submit" className="nav-link">Log out</button>
            </Form>
          </nav>
        </div>
      </header>
      <main className="site-shell py-8 md:py-10">
        <Outlet />
      </main>
    </div>
  );
}
