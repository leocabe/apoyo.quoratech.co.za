import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const projectRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const workerPath = resolve(projectRoot, "dist/server/index.js");
const manifestPath = resolve(projectRoot, "dist/.openai/hosting.json");
const [source, manifestText] = await Promise.all([
  readFile(workerPath, "utf8"),
  readFile(manifestPath, "utf8"),
]);
const manifest = JSON.parse(manifestText);
assert.equal(manifest.project_id, "appgprj_6ada535fc7108191b8d993cb32231b19");
assert.equal("static" in manifest, false, "Worker manifest must not declare static.directory");
assert.equal(source.includes("__INDEX_HTML__"), false);

const moduleUrl = `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
const workerModule = await import(moduleUrl);
assert.equal(typeof workerModule.default?.fetch, "function", `${pathToFileURL(workerPath)} must export default.fetch`);

const home = await workerModule.default.fetch(new Request("https://example.test/"), {}, {});
assert.equal(home.status, 200);
assert.match(home.headers.get("content-type"), /text\/html/);

const missingKey = await workerModule.default.fetch(
  new Request("https://example.test/api/create-checkout-session", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ amount: 25 }),
  }),
  {},
  {},
);
assert.equal(missingKey.status, 503);

let stripeRequest;
const originalFetch = globalThis.fetch;
globalThis.fetch = async (url, init) => {
  stripeRequest = { url, init };
  return new Response(JSON.stringify({ url: "https://checkout.stripe.com/test-session" }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
};
try {
  const checkout = await workerModule.default.fetch(
    new Request("https://example.test/api/create-checkout-session", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ amount: 25 }),
    }),
    { STRIPE_SECRET_KEY: "test_secret" },
    {},
  );
  assert.equal(checkout.status, 200);
  assert.equal((await checkout.json()).url, "https://checkout.stripe.com/test-session");
  assert.equal(stripeRequest.url, "https://api.stripe.com/v1/checkout/sessions");
  assert.equal(stripeRequest.init.headers.authorization, "Bearer test_secret");
  const stripeBody = new URLSearchParams(stripeRequest.init.body);
  assert.equal(stripeBody.has("payment_method_types[0]"), false);
  assert.equal(stripeBody.get("mode"), "payment");
  assert.equal(stripeBody.get("submit_type"), "donate");
  assert.equal(stripeBody.get("line_items[0][price_data][unit_amount]"), "2500");
} finally {
  globalThis.fetch = originalFetch;
}

console.log("Artifact is valid ESM; assets and Stripe endpoint are wired");
