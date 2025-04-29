import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dotenv from "dotenv";
import path from "path";
dotenv.config();

const target =
  process.env.VITE_APP_TARGET || "https://plataforma.fullcontrolgps.com.ar";

export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: target,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
        configure: (proxy, options) => {
          proxy.on("proxyRes", (proxyRes, req, res) => {
            const cookies = proxyRes.headers["set-cookie"];
          });
        },
      },
      "^/informes": {
        target: target,
        changeOrigin: true,
        configure: (proxy, options) => {
          proxy.on("proxyRes", (proxyRes, req, res) => {
            const cookies = proxyRes.headers["set-cookie"];
          });
        },
      },
      "^/fulladm": {
        target: target,
        changeOrigin: true,
        configure: (proxy, options) => {
          proxy.on("proxyRes", (proxyRes, req, res) => {
            const cookies = proxyRes.headers["set-cookie"];
          });
        },
      },
    },
  },
  plugins: [react()],
});
