import { Link, redirect } from "react-router";
import type { Route } from "./+types/login";
import {
  buildGoogleAuthUrl,
  getSessionFromRequest,
  isAuthorSession,
} from "~/lib/auth.server";
import { canonicalUrl, SITE_NAME } from "~/lib/seo";

export function meta() {
  return [
    { title: `Login — ${SITE_NAME}` },
    { tagName: "link", rel: "canonical", href: canonicalUrl("/login", "https://unasked.techsavyy.com") },
  ];
}

const ERROR_MESSAGES: Record<string, string> = {
  oauth: "Google sign-in failed. Check your OAuth configuration and try again.",
  unauthorized: "This Google account is not authorized to access Unasked.",
};

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSessionFromRequest(request);
  if (isAuthorSession(session)) {
    throw redirect("/admin");
  }
  const url = new URL(request.url);
  const error = url.searchParams.get("error");
  return {
    googleUrl: buildGoogleAuthUrl(request),
    errorMessage: error ? ERROR_MESSAGES[error] ?? "Unable to sign in." : null,
  };
}

export default function Login({ loaderData }: Route.ComponentProps) {
  return (
    <div className="site-shell pb-20 max-w-lg">
      <div className="pt-14 md:pt-20">
        <h1 className="font-display text-3xl md:text-4xl text-ink">Login</h1>
        {loaderData.errorMessage ? (
          <p className="mt-4 text-sm text-red-900 bg-red-50 border border-red-200/80 px-3 py-2">
            {loaderData.errorMessage}
          </p>
        ) : null}
        <p className="mt-4 text-ink-muted leading-relaxed">
          Sign in with Google to write and manage articles. Only the configured
          author account can access the dashboard.
        </p>
        <a href={loaderData.googleUrl} className="btn-primary mt-10 inline-flex">
          Continue with Google
        </a>
        <p className="mt-8 text-sm text-ink-muted">
          <Link to="/" className="text-accent underline-offset-4 hover:underline">
            ← Back home
          </Link>
        </p>
      </div>
    </div>
  );
}
