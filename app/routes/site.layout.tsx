import { Outlet, useLoaderData } from "react-router";
import { SiteFooter } from "~/components/SiteFooter";
import { SiteHeader } from "~/components/SiteHeader";
import { getSessionFromRequest, isAuthorSession } from "~/lib/auth.server";
import type { Route } from "./+types/site.layout";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSessionFromRequest(request);
  return { isAuthor: isAuthorSession(session) };
}

export default function SiteLayout() {
  const { isAuthor } = useLoaderData<typeof loader>();
  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f7] text-stone-900">
      <SiteHeader isAuthor={isAuthor} />
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}
