import { redirect } from "react-router";
import { env } from "cloudflare:workers";
import type { Route } from "./+types/auth.google.callback";
import {
  createSessionToken,
  exchangeGoogleCode,
  sessionSetCookieHeader,
} from "~/lib/auth.server";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error || !code) {
    return redirect("/login?error=oauth");
  }

  try {
    const { email } = await exchangeGoogleCode(code, request);
    if (email.toLowerCase() !== env.AUTHOR_EMAIL.toLowerCase()) {
      return redirect("/login?error=unauthorized");
    }
    const token = await createSessionToken(email);
    return redirect("/admin", {
      headers: {
        "Set-Cookie": sessionSetCookieHeader(token, request),
      },
    });
  } catch {
    return redirect("/login?error=oauth");
  }
}
