import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    allowedHosts: ['projectfinal.timyim.info'],
    port: 5173,
    proxy: {
      "/api": { target: "http://localhost:3000", changeOrigin: true }
    },
    hmr: {
        protocol: 'wss',
        host: 'projectfinal.timyim.info',
        clientPort: 443
    }
  }
});
