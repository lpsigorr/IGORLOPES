# IGOR LOPES

Portfolio of Igor Lopes Oliveira, creative technologist. Built with [Astro](https://astro.build), static, hosted on GitHub Pages.

Preview: https://lpsigorr.github.io/IGORLOPES/

## Run it on your computer

You need Node 22.23 or newer (`node -v` to check).

```bash
npm install
npm run dev
```

Then open http://localhost:4321/IGORLOPES/en/ . Every save reloads the page.

`npm run build` makes the final site in `dist/`. `npm run preview` serves that build.

## Where things are

| What | Where |
|---|---|
| All projects (case studies and lab): text, credits, images, order | `src/data/projects.ts` |
| Interface text (menu, buttons, form, footer) | `src/i18n.ts` |
| Name, title, GitHub link, contact form address | `src/config.ts` |
| Home page | `src/components/Home.astro` |
| Colours, fonts, all styles | `src/styles/site.css` |
| Shared parts: header, footer, project index, case study, lab grid | `src/components/` |
| Pages | `src/pages/[lang]/` |
| Scroll, cursor and motion | `src/scripts/engine.ts` |
| Images and films | `public/media/<project>/` |
| Fonts | `src/assets/fonts/` |

## Add a project

1. Put its images in `public/media/<slug>/` (WebP, about 1600 px wide at most).
2. In `src/data/projects.ts`, copy an existing entry, change `slug`, `name` and the text, and point the images to your files.
3. `kind: "case"` gives it a full page and a row in the index. `kind: "lab"` puts it in the lab.

The order in that file is the order on the site.

## Languages

Pages exist in English, French and Dutch (`/en/`, `/fr/`, `/nl/`). Any piece of text is written like `{ en: "..." }`. Add `fr: "..."` and `nl: "..."` next to it to translate it; until then, English shows.

## Pictures

Save a picture as `.webp` in `public/media/<project>/` at its best quality (up to 2400 px wide), then run:

```bash
npm run images
```

This makes the smaller copies (`photo.640.webp` and so on) and updates `src/data/media.json` with the real sizes. The site then loads the copy that fits each screen. Three rules are built in: no picture is cut, none is taller than the screen, none is shown larger than it really is.

## Contact form

The form needs a service to receive the messages, for example [Formspree](https://formspree.io). Paste its address in `formEndpoint` in `src/config.ts`. Until then the form says it is not connected yet.

## Publish

1. On GitHub: Settings > Pages > Source: **GitHub Actions** (once).
2. Push to `main`. The workflow in `.github/workflows/deploy.yml` builds and publishes the site.

### Moving lpsigorr.com to this site

lpsigorr.com still points to the old portfolio repo. When this one is ready:

1. Remove the custom domain from the old repo (its Settings > Pages, and its `public/CNAME`).
2. Here, in `astro.config.mjs`: set `site` to `"https://lpsigorr.com"` and delete the `base` line.
3. Add a file `public/CNAME` containing the line `lpsigorr.com`.
4. Push, then set the custom domain in this repo's Settings > Pages.
