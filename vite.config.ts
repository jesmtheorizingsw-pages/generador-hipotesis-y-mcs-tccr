import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // en Netlify la app se sirve desde "/"
  base: "/",  
  server: {
    port: 3000,
    host: "0.0.0.0",
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
