import { redirect } from "react-router";
import type { Route } from "./+types/logout";
import { sessionClearCookieHeader } from "~/lib/auth.server";

export function action({ request }: Route.ActionArgs) {
  return redirect("/", {
    headers: {
      "Set-Cookie": sessionClearCookieHeader(request),
    },
  });
}

export function loader() {
  return redirect("/");
}
