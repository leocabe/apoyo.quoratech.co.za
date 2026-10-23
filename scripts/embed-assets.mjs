import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const [worker, html, css, script] = await Promise.all([
  readFile(resolve(projectRoot, "worker/index.js"), "utf8"),
  readFile(resolve(projectRoot, "site/index.html"), "utf8"),
  readFile(resolve(projectRoot, "site/styles.css"), "utf8"),
  readFile(resolve(projectRoot, "site/script.js"), "utf8"),
]);

const output = worker
  .replace('"__INDEX_HTML__"', () => JSON.stringify(html))
  .replace('"__STYLES_CSS__"', () => JSON.stringify(css))
  .replace('"__CLIENT_JS__"', () => JSON.stringify(script));

if (output.includes("__INDEX_HTML__") || output.includes("__STYLES_CSS__") || output.includes("__CLIENT_JS__")) {
  throw new Error("Asset embedding failed");
}

await writeFile(resolve(projectRoot, "dist/server/index.js"), output);
