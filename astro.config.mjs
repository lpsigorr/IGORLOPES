import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://www.lpsigorr.com",
  trailingSlash: "always",
  build: { format: "directory" },
  // The black bar Astro shows at the bottom while developing. Set to true to get it back.
  devToolbar: { enabled: false },
});
