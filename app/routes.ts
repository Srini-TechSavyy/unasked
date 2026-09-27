import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  route("auth/google", "routes/auth.google.tsx"),
  route("auth/google/callback", "routes/auth.google.callback.tsx"),
  route("logout", "routes/logout.tsx"),
  route("sitemap.xml", "routes/sitemap[.]xml.tsx"),
  route("robots.txt", "routes/robots[.]txt.tsx"),
  layout("routes/admin.layout.tsx", [
    route("admin", "routes/admin._index.tsx"),
    route("admin/new", "routes/admin.new.tsx"),
    route("admin/articles/:id/edit", "routes/admin.articles.$id.edit.tsx"),
    route(
      "admin/articles/:id/preview",
      "routes/admin.articles.$id.preview.tsx",
    ),
  ]),
  layout("routes/site.layout.tsx", [
    index("routes/home.tsx"),
    route("articles", "routes/articles._index.tsx"),
    route("articles/:slug", "routes/articles.$slug.tsx"),
    route("about", "routes/about.tsx"),
    route("login", "routes/login.tsx"),
  ]),
] satisfies RouteConfig;
