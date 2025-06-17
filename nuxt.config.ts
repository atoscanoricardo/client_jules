import vuetify, { transformAssetUrls } from "vite-plugin-vuetify";
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  devtools: { enabled: true },
  build: {
    transpile: ["vuetify"],
  },
  vite: {
    define: {
      "process.env.DEBUG": false,
    },
    css: {
      preprocessorOptions: {
        sass: {
          additionalData: '@use "vuetify" as *;\n',
        },
      },
    },
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },
  css: ["vuetify/styles", "@mdi/font/css/materialdesignicons.css"],
  modules: [
    "@pinia/nuxt",
    (_options, nuxt) => {
      nuxt.hooks.hook("vite:extendConfig", (config) => {
        // @ts-expect-error
        config.plugins.push(vuetify({ autoImport: true }));
      });
    },
  ],
  ssr: false, // Ensure client-side rendering for static hosting
  app: {
    baseURL: "/client_jules/", // Repository name for GitHub Pages
    buildAssetsDir: "assets", // Recommended for GitHub Pages asset handling
    // head: { ... } // Preserve if exists, or add common head elements
  },
  // Optional: Configure Pinia for SSR false explicitly if needed,
  // though top-level ssr:false should cover it.
  // pinia: {
  //   storesDirs: ['./stores/**'],
  // },
  nitro: {
    // Nitro options for static generation (usually default is fine for GitHub Pages)
    // For GitHub Pages, ensure no server-specific presets are active if this object exists.
    // Default behavior of `nuxi generate` is to create a public/ directory suitable for static hosting.
    prerender: {
      // Optional: if you have dynamic routes that need to be pre-rendered and aren't auto-detected
      // routes: ['/some/dynamic/route'],
      failOnError: false, // Allow build to succeed even if some routes fail to prerender (useful for complex cases)
      routes: ["/"],
    },
  },
});
