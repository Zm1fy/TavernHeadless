import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@tavern/client-helpers": fileURLToPath(
        new URL("../../packages/official-integration-kit/client-helpers/src/index.ts", import.meta.url)
      ),
      "@tavern/sdk": fileURLToPath(new URL("../../packages/official-integration-kit/sdk/src/index.ts", import.meta.url)),
      "@tavern/shared": fileURLToPath(new URL("../../packages/shared/src/index.ts", import.meta.url))
    }
  },
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:3000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "")
      }
    },
    port: 5173,
    host: "0.0.0.0"
  }
});
