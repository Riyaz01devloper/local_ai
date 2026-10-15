import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true,
      },
      workbox: {
        // Cache app shell but do NOT cache API responses
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        runtimeCaching: [
          {
            // Cache static assets
            urlPattern: /^(?!.*\/api\/).*/,
            handler: "NetworkFirst",
            options: {
              cacheName: "app-shell",
              networkTimeoutSeconds: 5,
            },
          },
        ],
      },
      manifest: {
        name: "ResQ AI — Emergency Assistant",
        short_name: "ResQ AI",
        description: "AI-powered emergency first-aid assistant with offline guidance",
        start_url: "/",
        display: "standalone",
        background_color: "#07111f",
        theme_color: "#07111f",
        orientation: "any",
        icons: [
          {
            src: "/icon.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icon.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/icon.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        categories: ["health", "medical", "utilities"],
      },
    }),
  ],
});