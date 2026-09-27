# Unasked

Personal writing site and archive for essays — **Write → Save Draft → Publish → Read → Archive**.

Production URL: [https://unasked.techsavyy.com](https://unasked.techsavyy.com)

## Stack

- [React Router](https://reactrouter.com/) (SSR) on **Cloudflare Workers**
- **Cloudflare D1** (SQLite)
- TypeScript, Tailwind CSS v4, Wrangler

## Prerequisites

- Node.js 20+
- A Cloudflare account
- A Google Cloud OAuth client (Web application)

## Local development

```bash
npm install
cp .dev.vars.example .dev.vars
# Edit .dev.vars with your secrets (see below)

npm run db:migrate:local
npm run dev
```

The dev server runs on `http://localhost:5173` by default.

### Environment variables

| Variable | Where | Description |
|----------|--------|-------------|
| `GOOGLE_CLIENT_ID` | Secret / `.dev.vars` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Secret / `.dev.vars` | Google OAuth client secret |
| `AUTHOR_EMAIL` | Secret / `.dev.vars` | Only this Google email may access `/admin` |
| `SESSION_SECRET` | Secret / `.dev.vars` | Long random string for signing session cookies |
| `SITE_URL` | `wrangler.jsonc` `vars` | Canonical site URL (production) |

Never commit `.dev.vars` or secrets to git.

```bash
# Production secrets (run once per environment)
npx wrangler secret put GOOGLE_CLIENT_ID
npx wrangler secret put GOOGLE_CLIENT_SECRET
npx wrangler secret put AUTHOR_EMAIL
npx wrangler secret put SESSION_SECRET
```

## Google Cloud Console (OAuth)

1. Create a project in [Google Cloud Console](https://console.cloud.google.com/).
2. Configure **OAuth consent screen** (External or Internal).
3. Create **Credentials → OAuth client ID → Web application**.

**Authorized JavaScript origins**

- `http://localhost:5173` (local dev)
- `https://unasked.techsavyy.com` (production)

**Authorized redirect URIs**

- `http://localhost:5173/auth/google/callback`
- `https://unasked.techsavyy.com/auth/google/callback`

Use the port shown when you run `npm run dev` if it differs from `5173`.

Authorization is enforced **on the server**: after Google sign-in, the user’s email must match `AUTHOR_EMAIL`. There is no public registration.

## Database (D1)

Schema lives in `migrations/`. Apply locally:

```bash
npm run db:migrate:local
```

For production, create a D1 database and update `database_id` in `wrangler.jsonc`:

```bash
npx wrangler d1 create unasked-db
npm run db:migrate:remote
```

## Deploy

```bash
npm run build
npm run deploy
```

### Custom domain

In the Cloudflare dashboard, attach the Worker to `unasked.techsavyy.com` (DNS + route or Workers custom domain). Ensure `SITE_URL` in `wrangler.jsonc` matches the canonical HTTPS URL.

## Project structure

| Path | Purpose |
|------|---------|
| `app/routes/` | Public pages, admin, auth, SEO routes |
| `app/lib/` | D1 access, auth, markdown, SEO helpers |
| `migrations/` | D1 SQL migrations |
| `workers/app.ts` | Worker entry (React Router request handler) |
| `wrangler.jsonc` | Worker + D1 bindings |

## Security notes

- Admin routes and all write operations require a valid author session.
- Public loaders only query `status = 'published'`.
- Markdown is rendered server-side and sanitized before HTML output.
- OAuth client secrets and session secrets are stored as Cloudflare secrets, not in source control.
--
