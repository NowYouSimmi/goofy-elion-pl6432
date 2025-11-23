import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  server: {
    allowedHosts: [
      "7xqndf-5173.csb.app", // ← your CodeSandbox host
      "*.csb.app", // optional wildcard so you don’t need to update again
    ],
  },
});
