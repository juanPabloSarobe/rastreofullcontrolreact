import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dotenv from "dotenv";
dotenv.config();

const target = process.env.TARGET;
// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      "/foo": {
        target: "https://plataforma.fullcontrolgps.com.ar",
        changeOrigin: true,
        configure: (proxy, options) => {
          proxy.on("proxyRes", (proxyRes, req, res) => {
            const cookies = proxyRes.headers["set-cookie"];
          });
        },
      },
      "^/fallback/.*": {
        target: "https://plataforma.fullcontrolgps.com.ar",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/fallback/, ""),
        configure: (proxy, options) => {
          proxy.on("proxyRes", (proxyRes, req, res) => {
            const cookies = proxyRes.headers["set-cookie"];
          });
        },
      },
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
    },
  },
  plugins: [react()],
});
