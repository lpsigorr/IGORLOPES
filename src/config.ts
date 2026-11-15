// Site-wide settings.

export const LANGS = ["en", "fr", "nl"] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = "en";

export const SITE = {
  name: "Igor Lopes",
  fullName: "Igor Lopes Oliveira",
  title: "Creative Technologist",
  city: "Brussels",
  github: "https://github.com/lpsigorr",
  // Where the contact form sends to (for example a Formspree URL). Empty = form shows "not connected yet".
  formEndpoint: "",
};

/** Builds a link that works with the GitHub Pages base path. url("/en/work/") -> "/IGORLOPES/en/work/" */
export function url(path = "/"): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : "/" + path;
  return base + p;
}

/** Path to a file in public/media. media("star/poster.webp") */
export function media(path: string): string {
  return url("/media/" + path);
}
