import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://nosleeppage.com",
  output: "static",
  trailingSlash: "always",
  build: {
    format: "directory",
    inlineStylesheets: "always",
  },
  i18n: {
    defaultLocale: "en",
    locales: ["en", "es", "de", "fr", "pt", "ja", "zh"],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
