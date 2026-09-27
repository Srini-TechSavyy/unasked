import { redirect } from "react-router";
import type { Route } from "./+types/auth.google";
import { buildGoogleAuthUrl } from "~/lib/auth.server";

export function loader({ request }: Route.LoaderArgs) {
  return redirect(buildGoogleAuthUrl(request));
}
