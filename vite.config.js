import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Chemins relatifs : la même build fonctionne à la racine (Vercel) ou
  // sous un sous-chemin (GitHub Pages, https://<user>.github.io/<repo>/).
  base: "./",
  plugins: [react()],
});
