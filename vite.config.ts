import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import devtools from "solid-devtools/vite";

export default defineConfig({
  base: './',
  plugins: [
    devtools({
      // Will automatically add names when creating signals, memos, stores, or mutables
      name: true,
    }),
    solidPlugin(),
  ],
  server: {
    port: 3000,
  },
  build: {
    target: "esnext",
  },
});
