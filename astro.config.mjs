// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://pempekilen.com",
  integrations: [
    sitemap({
      filter: (page) =>
        !page.includes("/admin") &&
        !page.includes("/login") &&
        !page.includes("/404"),
    }),
  ],
  output: "static",
});
