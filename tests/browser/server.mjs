import { createServer } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath } from "node:url";

// Isolated component fixture: no login requests or production app/auth changes.
const root = fileURLToPath(new URL("../../", import.meta.url));
const server = await createServer({
  configFile: false,
  root,
  plugins: [vue()],
  resolve: { alias: { src: `${root}src` } },
  server: { host: "127.0.0.1", port: 8781, strictPort: true },
});
await server.listen();
console.log("Local Storymap fixture: http://127.0.0.1:8781/tests/browser/");
