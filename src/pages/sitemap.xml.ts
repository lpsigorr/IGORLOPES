// sitemap.xml: every page in every language, with its translations linked, so Google finds them all.
import type { APIRoute } from "astro";
import { LANGS, url } from "../config";
import { pages } from "../data/projects";

export const GET: APIRoute = ({ site }) => {
  const paths = ["/", "/work/", "/lab/", "/about/", "/contact/", ...pages.map((p) => `/work/${p.slug}/`)];
  const abs = (lang: string, path: string) => new URL(url(`/${lang}${path}`), site).href;
  const body = paths.flatMap((path) => LANGS.map((lang) => `  <url>
    <loc>${abs(lang, path)}</loc>
${[...LANGS.map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${abs(l, path)}"/>`), `    <xhtml:link rel="alternate" hreflang="x-default" href="${abs("en", path)}"/>`].join("\n")}
  </url>`)).join("\n");
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${body}
</urlset>
`, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};
