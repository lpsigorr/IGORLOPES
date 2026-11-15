import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://lpsigorr.github.io",
  base: "/IGORLOPES",
  trailingSlash: "always",
  build: { format: "directory" },
  // The black bar Astro shows at the bottom while developing. Set to true to get it back.
  devToolbar: { enabled: false },
});
