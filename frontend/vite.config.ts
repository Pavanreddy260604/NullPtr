import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "android-chrome-192x192.png"],
      manifest: false, // We already have site.webmanifest
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        navigateFallback: "/index.html",
        navigateFallbackAllowlist: [/^(?!\/__).*/], // Allow all routes except internal ones
        runtimeCaching: [
          {
            // Cache API responses for same-origin serverless routes and approved remote backends.
            urlPattern: ({ url, sameOrigin }) => {
              const isApprovedRemoteHost =
                /^study-[a-z0-9-]+\.vercel\.app$/i.test(url.hostname) ||
                /^study-g3xc\.onrender\.com$/i.test(url.hostname) ||
                (url.hostname === "localhost" && url.port === "5000");

              const isApiPath = url.pathname.startsWith("/api/");
              const isLegacyBackendPath = /^\/(subjects|units|mcq|fillblank|descriptive)(\/|$)/i.test(url.pathname);

              if (sameOrigin) {
                return isApiPath;
              }

              if (!isApprovedRemoteHost) {
                return false;
              }

              return isApiPath || isLegacyBackendPath;
            },
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "api-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days (Hardened offline support)
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // Cache images
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "image-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
          {
            // Cache fonts
            urlPattern: /\.(?:woff|woff2|ttf|eot)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "font-cache",
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 8080,
    host: true,
    proxy: {
      '/api': {
        target: 'https://study-8c4d.vercel.app',
        changeOrigin: true,
      },
    },
  },
});
